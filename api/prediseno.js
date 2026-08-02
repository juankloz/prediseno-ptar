import { createHash } from "node:crypto";
import { authenticatedUser } from "./_lib/supabase.js";
import { validatePredisenoInput, ValidationError } from "../shared/validation.js";

// api/prediseno.js
// Despliegue sugerido: Vercel (gratis para este volumen). Ver instrucciones al final del archivo.

// Catálogo de actividades económicas según Resolución 631 de 2015 (Art. 9-15).
// confianza: "literatura" = valor de literatura específica del proceso (mayor confianza).
//            "generico"   = estimación genérica = límite normativo × 2.5 (confianza BAJA,
//            revisar con prioridad antes de usar comercialmente para esa actividad).
const ACTIVITY_PROFILES = {
  domestico: { label: "Doméstico / residencial", dbo5: 250, dqo: 500, sst: 250, gya: 80, ph: 7, confianza: "literatura" },
  hortalizas_frutas: { label: "Agroindustria — hortalizas, frutas, legumbres, raíces y tubérculos", dbo5: 200, dqo: 450, sst: 300, gya: 30, ph: 7, confianza: "generico" },
  cafe_ecologico: { label: "Agroindustria — beneficio de café (proceso ecológico)", dbo5: 10000, dqo: 20000, sst: 3000, gya: 50, ph: 4.5, confianza: "literatura" },
  cafe_tradicional: { label: "Agroindustria — beneficio de café (proceso tradicional)", dbo5: 2500, dqo: 5000, sst: 800, gya: 30, ph: 5.5, confianza: "literatura" },
  platano_banano: { label: "Agroindustria — poscosecha de plátano y banano", dbo5: 150, dqo: 400, sst: 200, gya: 20, ph: 7, confianza: "generico" },
  azucar_cana: { label: "Agroindustria — producción de azúcar y derivados de caña", dbo5: 3000, dqo: 6000, sst: 1000, gya: 40, ph: 5, confianza: "literatura" },
  palma: { label: "Agroindustria — extracción de aceites de origen vegetal (palma)", dbo5: 25000, dqo: 50000, sst: 18000, gya: 6000, ph: 4.5, confianza: "literatura" },
  bovino_cria: { label: "Ganadería — bovino/bufalino/equino/ovino/caprino (cría)", dbo5: 1000, dqo: 2000, sst: 600, gya: 60, ph: 7, confianza: "literatura" },
  bovino_beneficio: { label: "Ganadería — bovino/bufalino/equino/ovino/caprino (beneficio)", dbo5: 3000, dqo: 6000, sst: 1500, gya: 600, ph: 7, confianza: "literatura" },
  porcinos_cria: { label: "Ganadería — porcinos (cría)", dbo5: 4000, dqo: 8000, sst: 2000, gya: 100, ph: 7, confianza: "literatura" },
  porcinos_beneficio: { label: "Ganadería — porcinos (beneficio)", dbo5: 3000, dqo: 6000, sst: 1500, gya: 400, ph: 7, confianza: "literatura" },
  bovino_porcino_dual: { label: "Ganadería — bovinos y porcinos (beneficio dual)", dbo5: 3000, dqo: 6000, sst: 1600, gya: 500, ph: 7, confianza: "literatura" },
  aves_incubacion: { label: "Ganadería — aves de corral (incubación y cría)", dbo5: 700, dqo: 1500, sst: 500, gya: 60, ph: 7, confianza: "literatura" },
  aves_beneficio: { label: "Ganadería — aves de corral (beneficio)", dbo5: 2000, dqo: 4000, sst: 800, gya: 300, ph: 7, confianza: "literatura" },
  mineria_carbon: { label: "Minería — extracción de carbón de piedra y lignito", dbo5: 150, dqo: 400, sst: 300, gya: 30, ph: 7, confianza: "generico" },
  mineria_hierro: { label: "Minería — extracción de minerales de hierro", dbo5: 150, dqo: 400, sst: 300, gya: 30, ph: 7, confianza: "generico" },
  mineria_oro: { label: "Minería — extracción de oro y otros metales preciosos", dbo5: 150, dqo: 400, sst: 400, gya: 30, ph: 7, confianza: "generico" },
  mineria_niquel: { label: "Minería — extracción de minerales de níquel y otros no ferrosos", dbo5: 150, dqo: 400, sst: 300, gya: 30, ph: 7, confianza: "generico" },
  mineria_otras: { label: "Minería — extracción de otras minas y canteras", dbo5: 150, dqo: 400, sst: 300, gya: 30, ph: 7, confianza: "generico" },
  hc_exploracion: { label: "Hidrocarburos — exploración (upstream)", dbo5: 500, dqo: 1200, sst: 200, gya: 100, ph: 7, confianza: "literatura" },
  hc_produccion: { label: "Hidrocarburos — producción (upstream)", dbo5: 200, dqo: 600, sst: 150, gya: 80, ph: 7, confianza: "literatura" },
  hc_refino: { label: "Hidrocarburos — refino", dbo5: 500, dqo: 1200, sst: 200, gya: 100, ph: 7, confianza: "literatura" },
  hc_venta: { label: "Hidrocarburos — venta y distribución (downstream)", dbo5: 200, dqo: 600, sst: 150, gya: 80, ph: 7, confianza: "literatura" },
  hc_transporte: { label: "Hidrocarburos — transporte y almacenamiento (midstream)", dbo5: 200, dqo: 600, sst: 150, gya: 80, ph: 7, confianza: "literatura" },
  alimenticios_general: { label: "Alimentos — elaboración de productos alimenticios (general)", dbo5: 1200, dqo: 1800, sst: 600, gya: 60, ph: 7, confianza: "literatura" },
  alimentos_animales: { label: "Alimentos — alimentos preparados para animales", dbo5: 300, dqo: 600, sst: 150, gya: 30, ph: 7, confianza: "generico" },
  maltas_cervezas: { label: "Alimentos — elaboración de maltas y cervezas", dbo5: 2000, dqo: 4000, sst: 300, gya: 30, ph: 6, confianza: "literatura" },
  bebidas_no_alcoholicas: { label: "Alimentos — bebidas no alcohólicas, aguas minerales y embotelladas", dbo5: 600, dqo: 1200, sst: 150, gya: 60, ph: 6.5, confianza: "generico" },
  lacteos: { label: "Alimentos — elaboración de productos lácteos", dbo5: 2500, dqo: 5000, sst: 1200, gya: 800, ph: 6, confianza: "literatura" },
  aceites_grasas_af: { label: "Alimentos — aceites y grasas de origen animal y vegetal", dbo5: 1600, dqo: 3000, sst: 900, gya: 200, ph: 6.5, confianza: "literatura" },
  cafe_soluble: { label: "Alimentos — elaboración de café soluble", dbo5: 3000, dqo: 5000, sst: 1200, gya: 90, ph: 6, confianza: "generico" },
  tabaco: { label: "Fabricación — productos derivados del tabaco", dbo5: 500, dqo: 1000, sst: 500, gya: 50, ph: 7, confianza: "generico" },
  textiles: { label: "Fabricación — productos textiles", dbo5: 500, dqo: 1000, sst: 125, gya: 50, ph: 7, confianza: "generico" },
  piel_curtido: { label: "Fabricación — artículos de piel, curtido y adobo de pieles", dbo5: 1500, dqo: 3000, sst: 1500, gya: 150, ph: 7, confianza: "generico" },
  gases_industriales: { label: "Fabricación — gases industriales y medicinales", dbo5: 500, dqo: 750, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  papel_pulpa: { label: "Fabricación — papel y cartón (pulpa blanqueada, plantas integradas)", dbo5: 750, dqo: 1375, sst: 625, gya: 50, ph: 7, confianza: "generico" },
  papel_reciclado: { label: "Fabricación — papel y cartón a partir de fibras recicladas", dbo5: 1000, dqo: 2000, sst: 1000, gya: 100, ph: 7, confianza: "generico" },
  abonos_nitrogenados: { label: "Fabricación — abonos y compuestos inorgánicos nitrogenados", dbo5: 250, dqo: 500, sst: 250, gya: 25, ph: 7, confianza: "generico" },
  quimicos_general: { label: "Fabricación — sustancias y productos químicos (general)", dbo5: 1500, dqo: 2000, sst: 500, gya: 62, ph: 7, confianza: "generico" },
  pigmentos_azul: { label: "Fabricación — pigmentos inorgánicos (azul ultramar)", dbo5: 500, dqo: 1250, sst: 500, gya: 62, ph: 7, confianza: "generico" },
  pigmentos_oxidos_fe: { label: "Fabricación — pigmentos inorgánicos (óxidos de hierro)", dbo5: 500, dqo: 1250, sst: 500, gya: 62, ph: 7, confianza: "generico" },
  pigmentos_cromatos: { label: "Fabricación — pigmentos inorgánicos (cromatos y molibdatos de plomo)", dbo5: 375, dqo: 500, sst: 375, gya: 62, ph: 7, confianza: "generico" },
  acidos_inorganicos: { label: "Fabricación — ácidos inorgánicos y sus sales", dbo5: 125, dqo: 450, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  plasticos: { label: "Fabricación — plásticos en formas primarias/básicas y artículos plásticos", dbo5: 312, dqo: 750, sst: 200, gya: 50, ph: 7, confianza: "generico" },
  sabores_fragancias: { label: "Fabricación — sabores y fragancias", dbo5: 750, dqo: 1500, sst: 175, gya: 25, ph: 7, confianza: "generico" },
  surfactantes: { label: "Fabricación — surfactantes", dbo5: 250, dqo: 1250, sst: 250, gya: 50, ph: 7, confianza: "generico" },
  plaguicidas: { label: "Fabricación — plaguicidas y otros químicos de uso agropecuario", dbo5: 500, dqo: 1500, sst: 500, gya: 25, ph: 7, confianza: "generico" },
  pinturas_barnices: { label: "Fabricación — pinturas, barnices y revestimientos similares", dbo5: 1000, dqo: 2000, sst: 500, gya: 50, ph: 7, confianza: "generico" },
  jabones_detergentes: { label: "Fabricación — jabones, detergentes y productos cosméticos", dbo5: 625, dqo: 1250, sst: 200, gya: 38, ph: 9, confianza: "generico" },
  farmaceuticos: { label: "Fabricación — productos farmacéuticos y sustancias químicas medicinales", dbo5: 375, dqo: 1000, sst: 125, gya: 38, ph: 7, confianza: "generico" },
  vidrio_cemento: { label: "Fabricación — vidrio, productos de vidrio, cemento, cal y yeso", dbo5: 125, dqo: 325, sst: 125, gya: 50, ph: 7, confianza: "generico" },
  ceramicos: { label: "Fabricación — productos cerámicos", dbo5: 125, dqo: 250, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  hormigon_yeso: { label: "Fabricación — artículos de hormigón, cemento y yeso", dbo5: 250, dqo: 500, sst: 250, gya: 50, ph: 7, confianza: "generico" },
  revestimiento_metales: { label: "Fabricación — tratamiento y revestimiento de metales", dbo5: 250, dqo: 625, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  pilas_baterias: { label: "Fabricación — pilas, baterías y acumuladores eléctricos", dbo5: 125, dqo: 250, sst: 125, gya: 38, ph: 7, confianza: "generico" },
  iluminacion: { label: "Fabricación — equipos eléctricos de iluminación", dbo5: 125, dqo: 500, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  uso_domestico: { label: "Fabricación — aparatos de uso doméstico", dbo5: 200, dqo: 400, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  maquinaria_electrolitico: { label: "Fabricación — maquinaria y equipos (recubrimientos electrolíticos)", dbo5: 250, dqo: 500, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  vehiculos: { label: "Fabricación — vehículos automotores, remolques y semirremolques", dbo5: 250, dqo: 750, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  autopartes: { label: "Fabricación — autopartes", dbo5: 500, dqo: 1000, sst: 250, gya: 75, ph: 7, confianza: "generico" },
  siderurgia: { label: "Fabricación — siderurgia", dbo5: 150, dqo: 625, sst: 75, gya: 50, ph: 7, confianza: "generico" },
  imprentas: { label: "Fabricación — imprentas y litografías", dbo5: 250, dqo: 500, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  bebidas_destiladas: { label: "Fabricación — bebidas alcohólicas destiladas", dbo5: 3750, dqo: 7500, sst: 750, gya: 75, ph: 6, confianza: "generico" },
  mezcla_alcoholicas: { label: "Fabricación — mezcla-formulación de bebidas alcohólicas", dbo5: 500, dqo: 1250, sst: 500, gya: 50, ph: 7, confianza: "generico" },
  caucho: { label: "Fabricación — producción y fabricación de derivados de caucho", dbo5: 125, dqo: 625, sst: 125, gya: 25, ph: 7, confianza: "generico" },
  generacion_energia: { label: "Servicios — generación de energía eléctrica", dbo5: 350, dqo: 500, sst: 250, gya: 50, ph: 7, confianza: "generico" },
  tratamiento_residuos: { label: "Servicios — tratamiento y disposición de residuos (lixiviados)", dbo5: 8000, dqo: 20000, sst: 1000, gya: 100, ph: 7.5, confianza: "literatura" },
  reciclaje_plasticos: { label: "Servicios — reciclaje de materiales plásticos y similares", dbo5: 500, dqo: 1200, sst: 500, gya: 50, ph: 7, confianza: "generico" },
  reciclaje_tambores: { label: "Servicios — reciclaje de tambores", dbo5: 1500, dqo: 2500, sst: 400, gya: 60, ph: 7, confianza: "generico" },
  salud_atencion: { label: "Servicios — atención a la salud humana (con o sin internación)", dbo5: 350, dqo: 500, sst: 150, gya: 25, ph: 7, confianza: "generico" },
  salud_hemodialisis: { label: "Servicios — atención a la salud (hemodiálisis y diálisis peritoneal)", dbo5: 1400, dqo: 1800, sst: 250, gya: 25, ph: 7, confianza: "generico" },
  pompas_funebres: { label: "Servicios — pompas fúnebres y actividades relacionadas", dbo5: 600, dqo: 1400, sst: 250, gya: 50, ph: 7, confianza: "generico" },
  otras_no_contempladas: { label: "Otra actividad no contemplada en los sectores anteriores", dbo5: 125, dqo: 375, sst: 125, gya: 25, ph: 7, confianza: "generico" },
};

const VERTIMIENTO_LABELS = {
  cuerpo_agua: "Cuerpo de agua superficial",
  alcantarillado: "Alcantarillado público",
  suelo: "Suelo (riego / infiltración) — solo doméstico",
};

// Resolución 699 de 2021 — SOLO aplica a Aguas Residuales Domésticas Tratadas (ARD-T).
// "diferente" trae DBO5 explícito (Tabla 2, fijo en 90 mg/L en las 3 categorías).
// "equiparable" (Tabla 1) NO trae DBO5 explícito — se aproxima desde DQO con la razón
// DQO/DBO5 típica doméstica (≈2:1), marcado como aproximación.
// "rural_dispersa" no requiere permiso si la solución cumple los parámetros del RAS — exenta.
const TIPO_USUARIO_SUELO_LABELS = {
  rural_dispersa: "Vivienda rural dispersa (exenta de permiso si cumple el RAS)",
  equiparable: "Equiparable a vivienda rural dispersa (≤ 1,0 kg DBO5/día)",
  diferente: "Usuario diferente (mayor generación doméstica)",
};
const CATEGORIA_INFILTRACION_LABELS = {
  I: "Categoría I — infiltración 16 a 27 mm/h",
  II: "Categoría II — infiltración 2,6-15 o 28-52 mm/h",
  III: "Categoría III — infiltración <2,5 o >53 mm/h",
};
const SUELO_LIMITE_DBO5 = {
  diferente: { I: 90, II: 90, III: 90 }, // Tabla 2 — valor real, fijo
  equiparable: { I: 100, II: 100, III: 100 }, // aproximado desde DQO=200 (Tabla 1), razón DQO/DBO5≈2
};

function getNormativa(punto, tipoUsuarioSuelo) {
  if (punto === "cuerpo_agua")
    return "Resolución 0631 de 2015 — límites de vertimiento a cuerpos de agua superficiales, según actividad.";
  if (punto === "alcantarillado")
    return "Resolución 0631 de 2015 + reglamento de vertimiento de la entidad prestadora del servicio de alcantarillado.";
  if (tipoUsuarioSuelo === "rural_dispersa")
    return "Resolución 699 de 2021 (MADS) — exento de permiso de vertimiento si la solución individual de saneamiento cumple los parámetros del RAS (Ley 1955 de 2019, Art. 279).";
  return "Resolución 699 de 2021 (MADS) — parámetros y valores límites para vertimientos de Aguas Residuales Domésticas Tratadas (ARD-T) al suelo.";
}

// Límite DBO5 (mg/L) a cuerpo de agua superficial, por actividad — de la Resolución 631 de 2015, Art. 8-15.
const LIMITE_DBO5 = {
  domestico: 90, hortalizas_frutas: 50, cafe_ecologico: 400, cafe_tradicional: 200,
  platano_banano: 50, azucar_cana: 500, palma: 600, bovino_cria: 250, bovino_beneficio: 450,
  porcinos_cria: 450, porcinos_beneficio: 450, bovino_porcino_dual: 450, aves_incubacion: 200,
  aves_beneficio: 300, mineria_carbon: 50, mineria_hierro: 50, mineria_oro: 50, mineria_niquel: 50,
  mineria_otras: 50, hc_exploracion: 200, hc_produccion: 60, hc_refino: 200, hc_venta: 60,
  hc_transporte: 60, alimenticios_general: 400, alimentos_animales: 100, maltas_cervezas: 100,
  bebidas_no_alcoholicas: 200, lacteos: 250, aceites_grasas_af: 300, cafe_soluble: 600,
  tabaco: 200, textiles: 200, piel_curtido: 600, gases_industriales: 200, papel_pulpa: 300,
  papel_reciclado: 400, abonos_nitrogenados: 100, quimicos_general: 600, pigmentos_azul: 200,
  pigmentos_oxidos_fe: 200, pigmentos_cromatos: 150, acidos_inorganicos: 50, plasticos: 125,
  sabores_fragancias: 300, surfactantes: 100, plaguicidas: 200, pinturas_barnices: 400,
  jabones_detergentes: 250, farmaceuticos: 150, vidrio_cemento: 50, ceramicos: 50,
  hormigon_yeso: 100, revestimiento_metales: 100, pilas_baterias: 50, iluminacion: 50,
  uso_domestico: 80, maquinaria_electrolitico: 100, vehiculos: 100, autopartes: 200,
  siderurgia: 60, imprentas: 100, bebidas_destiladas: 1500, mezcla_alcoholicas: 200,
  caucho: 50, generacion_energia: 150, tratamiento_residuos: 800, reciclaje_plasticos: 200,
  reciclaje_tambores: 600, salud_atencion: 150, salud_hemodialisis: 600, pompas_funebres: 250,
  otras_no_contempladas: 50,
};

// Reparto de la eficiencia de remoción de DBO5 entre etapas del tren (valores típicos de literatura).
const ETA_PRIMARIA = 0.30; // sedimentación primaria
const ETA_ETAPA1_ALTA = 0.65; // UASB alta carga como primera etapa
const ETA_ETAPA1_MEDIA = 0.55; // RAFA como primera etapa (carga media)
const E_MAX = 0.97; // tope del modelo cinético de primer orden

function calcularLimiteEfectivo(actividad, puntoVertimiento, tipoUsuarioSuelo, categoriaInfiltracion) {
  const base = LIMITE_DBO5[actividad];
  if (puntoVertimiento === "alcantarillado") return base * 1.5;
  if (puntoVertimiento === "suelo") {
    if (tipoUsuarioSuelo === "rural_dispersa") return null; // exento, sin límite numérico aplicable
    const tabla = SUELO_LIMITE_DBO5[tipoUsuarioSuelo];
    return tabla ? tabla[categoriaInfiltracion] : base; // fallback defensivo
  }
  return base; // cuerpo_agua
}

function clampE(e) {
  return Math.max(0, Math.min(e, E_MAX));
}

// Constantes cinéticas (día⁻¹), recalibradas para que a la eficiencia típica de literatura de
// cada reactor, el tiempo de retención resultante coincida con el HRT real de diseño (horas).
// Antes tenían valores de lagunas de estabilización (procesos de días), inconsistentes con
// reactores de alta tasa (horas) — esa versión quedó descartada tras la prueba de sanidad.
const K_CINETICA = {
  uasb_alta: 7.0,   // E=70% típico a HRT=8h
  rafa_media: 5.87, // E=55% típico a HRT=5h
  aerobio: 17.0,    // E=85% típico a HRT=8h
  fafa: 18.0,       // E=75% típico a HRT=4h
};

// Ecuaciones ajustadas: costo_COP = a * Q(L/s)^b * (E/(1-E))^c — R² > 0.998 en las 4 unidades.
// El filtro percolador/humedal NO usa este modelo: se dimensiona por carga hidráulica
// superficial, no por tiempo de retención en tanque, así que mantiene su ecuación de solo caudal
// (ver COST_PARAMS).
const KINETIC_COST_PARAMS = {
  uasb_alta: { a: 6789450, b: 0.877, c: 0.872 },
  rafa_media: { a: 7503001, b: 0.913, c: 0.909 },
  aerobio: { a: 3906361, b: 0.816, c: 0.811 },
  fafa: { a: 3597769, b: 0.923, c: 0.919 },
};

function costoKinetico(tipo, caudalLs, e) {
  const eClamp = Math.max(0.01, Math.min(e, E_MAX));
  const { a, b, c } = KINETIC_COST_PARAMS[tipo];
  const puntual = a * Math.pow(caudalLs, b) * Math.pow(eClamp / (1 - eClamp), c);
  return { min: puntual * 0.8, max: puntual * 1.3 };
}

// Ecuaciones de costo ajustadas: costo_COP = a * Q(L/s)^b
// Obtenidas de un prediseño dimensional (criterios típicos de retención/carga superficial,
// geometría PRFV) + costo de $500.000/m2 terminado, ajustado con regresión potencial (R² > 0.999
// en las 13 estructuras — muy superior al ajuste logarítmico probado, R² ~0.89-0.92).
// AJUSTAR "valor" de retención/carga en el script de prediseño dimensional si se cuenta con
// criterios de campo más precisos, y volver a correr la regresión.
const COST_PARAMS = {
  "Cribado / rejillas": { a: 552673, b: 0.798 },
  Desarenador: { a: 591362, b: 0.679 },
  "Trampa de grasas": { a: 2510766, b: 0.812 },
  "Flotación por aire disuelto (DAF)": { a: 2817518, b: 0.702 },
  "Ajuste de pH (neutralización)": { a: 1910888, b: 0.726 },
  "Sedimentación primaria / tanque Imhoff": { a: 7643550, b: 0.726 },
  "Reactor anaerobio (UASB / laguna anaerobia)": { a: 17500011, b: 0.825 },
  "Tratamiento aerobio (lodos activados / laguna facultativa)": { a: 15910025, b: 0.813 },
  "Reactor anaerobio de flujo ascendente (RAFA / UASB)": { a: 12649535, b: 0.837 },
  "Filtro percolador / humedal artificial": { a: 5073566, b: 0.836 },
  "Filtro anaerobio de flujo ascendente (FAFA)": { a: 11014693, b: 0.895 },
  "Desinfección (cloración o UV)": { a: 2510766, b: 0.812 },
  "Desinfección + filtración final": { a: 2817518, b: 0.702 },
};

function formatCOP(valor) {
  return `$${Math.round(valor).toLocaleString("es-CO")}`;
}

// Criterios de diseño dimensional (para las memorias de cálculo del Informe 2) — los mismos
// usados para construir las ecuaciones de costo. tipo: 'hrt' (horas) o 'carga' (m3/m2·h).
const DISEÑO_CRITERIOS = {
  "Cribado / rejillas": { tipo: "hrt", valor: 0.05, H: 0.6, geom: "rect" },
  Desarenador: { tipo: "carga", valor: 29.2, H: 1.0, geom: "rect" },
  "Trampa de grasas": { tipo: "hrt", valor: 0.5, H: 1.2, geom: "rect" },
  "Flotación por aire disuelto (DAF)": { tipo: "carga", valor: 5.0, H: 2.0, geom: "rect" },
  "Ajuste de pH (neutralización)": { tipo: "hrt", valor: 0.25, H: 1.5, geom: "rect" },
  "Sedimentación primaria / tanque Imhoff": { tipo: "carga", valor: 1.5, H: 3.0, geom: "rect" },
  "Filtro percolador / humedal artificial": { tipo: "carga", valor: 1.0, H: 1.5, geom: "rect" },
  "Desinfección (cloración o UV)": { tipo: "hrt", valor: 0.5, H: 1.2, geom: "rect" },
  "Desinfección + filtración final": { tipo: "carga", valor: 5.0, H: 2.0, geom: "rect" },
};

const GEOM_CINETICA = {
  uasb_alta: { H: 5.0, geom: "cil" },
  rafa_media: { H: 4.0, geom: "cil" },
  aerobio: { H: 3.0, geom: "rect" },
  fafa: { H: 2.5, geom: "cil" },
};

function areaDeVolumen(V, H, geom) {
  if (geom === "rect") {
    const W = Math.sqrt(V / H / 2);
    const L = 2 * W;
    return V / H + 2 * H * (L + W);
  }
  const D = Math.sqrt((4 * (V / H)) / Math.PI);
  return Math.PI * D * H + 2 * ((Math.PI * D * D) / 4);
}

// Memoria de cálculo (volumen, tiempo de retención u carga superficial, área PRFV) para el
// Informe 2. No afecta el costo del Informe 1 — es la misma geometría que ya sustenta esas
// ecuaciones, expuesta de forma transparente.
function memoriaCalculo(nombre, caudalLs, eRequerida) {
  const Q_m3h = caudalLs * 3.6;
  const critHidraulico = DISEÑO_CRITERIOS[nombre];
  if (critHidraulico) {
    let V, areaPlan;
    if (critHidraulico.tipo === "hrt") {
      V = Q_m3h * critHidraulico.valor;
      areaPlan = V / critHidraulico.H;
    } else {
      areaPlan = Q_m3h / critHidraulico.valor;
      V = areaPlan * critHidraulico.H;
    }
    const area = areaDeVolumen(V, critHidraulico.H, critHidraulico.geom);
    return {
      volumen_m3: Math.round(V * 10) / 10,
      criterio: critHidraulico.tipo === "hrt" ? `HRT = ${critHidraulico.valor} h` : `Carga superficial = ${critHidraulico.valor} m³/m²·h`,
      profundidad_m: critHidraulico.H,
      area_m2: Math.round(area * 10) / 10,
    };
  }
  const geomCin = GEOM_CINETICA[nombre === "Reactor anaerobio (UASB / laguna anaerobia)" ? "uasb_alta" : nombre === "Reactor anaerobio de flujo ascendente (RAFA / UASB)" ? "rafa_media" : nombre === "Tratamiento aerobio (lodos activados / laguna facultativa)" ? "aerobio" : nombre === "Filtro anaerobio de flujo ascendente (FAFA)" ? "fafa" : null];
  if (!geomCin || eRequerida == null) return null;
  const tipoKey = nombre === "Reactor anaerobio (UASB / laguna anaerobia)" ? "uasb_alta" : nombre === "Reactor anaerobio de flujo ascendente (RAFA / UASB)" ? "rafa_media" : nombre === "Tratamiento aerobio (lodos activados / laguna facultativa)" ? "aerobio" : "fafa";
  const e = Math.max(0.01, Math.min(eRequerida, E_MAX));
  const theta_d = e / (K_CINETICA[tipoKey] * (1 - e));
  const V = Q_m3h * 24 * theta_d;
  const area = areaDeVolumen(V, geomCin.H, geomCin.geom);
  return {
    volumen_m3: Math.round(V * 10) / 10,
    criterio: `Tiempo de retención (según eficiencia requerida) = ${(theta_d * 24).toFixed(1)} h`,
    profundidad_m: geomCin.H,
    area_m2: Math.round(area * 10) / 10,
  };
}

function buildTrain(profile, puntoVertimiento, caudalLs, actividad, tipoUsuarioSuelo, categoriaInfiltracion) {
  const units = [];
  const advertencias = [];

  const limiteEfectivo = calcularLimiteEfectivo(actividad, puntoVertimiento, tipoUsuarioSuelo, categoriaInfiltracion);
  const exentoPorRAS = puntoVertimiento === "suelo" && tipoUsuarioSuelo === "rural_dispersa";
  const eTotalRaw = exentoPorRAS ? 0.75 : 1 - limiteEfectivo / profile.dbo5; // 0.75 = supuesto genérico para dimensionar, no exige límite normativo
  const eTotal = clampE(eTotalRaw);

  if (exentoPorRAS) {
    advertencias.push(
      "Usuario de vivienda rural dispersa: según la Resolución 699 de 2021 y el Art. 279 de la Ley 1955 de 2019, no requiere permiso de vertimiento si la solución individual de saneamiento se diseña bajo los parámetros del RAS. Este prediseño usa una eficiencia de referencia (75%) solo para dimensionar, no un límite normativo exigido."
    );
  } else if (puntoVertimiento === "suelo" && tipoUsuarioSuelo === "equiparable") {
    advertencias.push(
      "La Resolución 699 de 2021 no fija un límite explícito de DBO5 para usuarios equiparables (Tabla 1) — se aproximó desde el límite de DQO (200 mg/L) con la razón DQO/DBO5 típica doméstica (≈2:1). Válido solo si la generación es ≤ 1,0 kg DBO5/día, como exige la resolución."
    );
  } else if (puntoVertimiento === "suelo") {
    advertencias.push(
      "Límite de DBO5 = 90 mg/L según Resolución 699 de 2021 (Tabla 2, usuarios diferentes), constante en las 3 categorías de velocidad de infiltración — esa velocidad sí afecta otros parámetros (SST, SSED, cloruros) no modelados aún en el costeo."
    );
  }
  if (eTotalRaw > E_MAX) {
    advertencias.push(
      `La eficiencia de remoción requerida (${(eTotalRaw * 100).toFixed(0)}%) supera el límite de validez del modelo cinético (${(E_MAX * 100).toFixed(0)}%). El resultado es una aproximación — en la práctica esta carga suele requerir un tren multi-etapa más exigente que el aquí calculado.`
    );
  }

  units.push({
    nombre: "Cribado / rejillas",
    nota: "Pretratamiento",
    justificacion: "Remueve sólidos gruesos y protege bombas y equipos aguas abajo. Obligatorio en cualquier tren de tratamiento.",
  });

  if (profile.sst > 150) {
    units.push({
      nombre: "Desarenador",
      nota: "Pretratamiento",
      justificacion: `SST estimado en ${profile.sst.toLocaleString()} mg/L: se requiere remover arenas para proteger bombas y tuberías de abrasión.`,
    });
  }

  if (profile.gya > 100) {
    units.push({
      nombre: profile.gya > 1000 ? "Flotación por aire disuelto (DAF)" : "Trampa de grasas",
      nota: "Pretratamiento",
      justificacion: `Grasas y aceites de ${profile.gya.toLocaleString()} mg/L deben removerse antes del tratamiento biológico para evitar taponamientos y pérdida de eficiencia.`,
    });
  }

  if (profile.ph < 6 || profile.ph > 9) {
    units.push({
      nombre: "Ajuste de pH (neutralización)",
      nota: "Acondicionamiento",
      justificacion: `pH estimado de ${profile.ph} está fuera del rango 6–9 necesario para actividad biológica eficiente.`,
    });
  }

  units.push({
    nombre: "Sedimentación primaria / tanque Imhoff",
    nota: "Tratamiento primario",
    justificacion: "Remueve sólidos sedimentables antes del proceso biológico, reduciendo la carga que debe tratar la siguiente etapa.",
  });

  // Eficiencia que le queda pendiente al tratamiento secundario, después de la primaria
  const eSecundaria = clampE(1 - (1 - eTotal) / (1 - ETA_PRIMARIA));

  if (profile.dbo5 > 5000) {
    const eEtapa2 = clampE(1 - (1 - eSecundaria) / (1 - ETA_ETAPA1_ALTA));
    units.push({
      nombre: "Reactor anaerobio (UASB / laguna anaerobia)",
      nota: "Tratamiento secundario — etapa 1",
      justificacion: `Carga orgánica muy alta (DBO5 ≈ ${profile.dbo5.toLocaleString()} mg/L) exige una etapa anaerobia previa para reducirla antes del proceso aerobio. Remoción asumida: ${(ETA_ETAPA1_ALTA * 100).toFixed(0)}%.`,
      _tipoCinetico: "uasb_alta",
      _eRequerida: ETA_ETAPA1_ALTA,
    });
    units.push({
      nombre: "Tratamiento aerobio (lodos activados / laguna facultativa)",
      nota: "Tratamiento secundario — etapa 2",
      justificacion: `Pule el efluente anaerobio hasta niveles compatibles con el punto de vertimiento. Remoción requerida en esta etapa: ${(eEtapa2 * 100).toFixed(0)}%.`,
      _tipoCinetico: "aerobio",
      _eRequerida: eEtapa2,
    });
  } else if (profile.dbo5 > 500) {
    const eEtapa2 = clampE(1 - (1 - eSecundaria) / (1 - ETA_ETAPA1_MEDIA));
    units.push({
      nombre: "Reactor anaerobio de flujo ascendente (RAFA / UASB)",
      nota: "Tratamiento secundario — etapa 1",
      justificacion: `Carga orgánica media-alta (DBO5 ≈ ${profile.dbo5.toLocaleString()} mg/L) se beneficia de una etapa anaerobia antes del pulimento final. Remoción asumida: ${(ETA_ETAPA1_MEDIA * 100).toFixed(0)}%.`,
      _tipoCinetico: "rafa_media",
      _eRequerida: ETA_ETAPA1_MEDIA,
    });
    units.push({
      nombre: "Filtro percolador / humedal artificial",
      nota: "Tratamiento secundario — etapa 2",
      justificacion: "Pulimento aerobio de bajo costo operativo, que recibe el efluente parcialmente tratado del RAFA. Se dimensiona por carga hidráulica superficial, no por tiempo de retención — su costo depende del caudal, no de la eficiencia de remoción.",
      _eRequerida: eEtapa2,
    });
  } else {
    units.push({
      nombre: "Filtro anaerobio de flujo ascendente (FAFA)",
      nota: "Tratamiento secundario",
      justificacion: `Carga orgánica típica de agua residual doméstica (DBO5 ≈ ${profile.dbo5} mg/L); un FAFA es suficiente como tratamiento secundario. Remoción requerida: ${(eSecundaria * 100).toFixed(0)}%.`,
      _tipoCinetico: "fafa",
      _eRequerida: eSecundaria,
    });
  }

  if (puntoVertimiento === "cuerpo_agua") {
    units.push({
      nombre: "Desinfección (cloración o UV)",
      nota: "Tratamiento terciario",
      justificacion: "Exigida para reducir carga patógena antes de verter a un cuerpo de agua superficial.",
    });
  }
  if (puntoVertimiento === "suelo") {
    units.push({
      nombre: "Desinfección + filtración final",
      nota: "Tratamiento terciario",
      justificacion: "El vertimiento a suelo exige control estricto de patógenos y sólidos remanentes para no afectar el suelo ni el acuífero.",
    });
  }
  if (puntoVertimiento === "alcantarillado") {
    units.push({
      nombre: "Verificación de norma de vertimiento a la red",
      nota: "Trámite",
      justificacion: "Confirmar ante la entidad prestadora el permiso de conexión y los límites exigidos; puede eximir de tratamiento biológico completo si el municipio cuenta con PTAR.",
    });
  }

  let dbo5Actual = profile.dbo5;
  const unitsConCosto = units.map((u) => {
    // Calidad de salida: DBO5 remanente después de esta unidad (Informe 2)
    const eficienciaUnidad = u.nombre === "Sedimentación primaria / tanque Imhoff" ? ETA_PRIMARIA : u._eRequerida || 0;
    dbo5Actual = dbo5Actual * (1 - eficienciaUnidad);
    const calidadSalida = { dbo5: Math.round(dbo5Actual) };

    // Memoria de cálculo (Informe 2) — no afecta el costo, solo lo documenta
    const memoria = memoriaCalculo(u.nombre, caudalLs, u._eRequerida);

    if (u._tipoCinetico) {
      const costoEstimado = !caudalLs || caudalLs <= 0 ? null : costoKinetico(u._tipoCinetico, caudalLs, u._eRequerida);
      const { _tipoCinetico, _eRequerida, ...resto } = u;
      return { ...resto, costoEstimado, memoria, calidadSalida };
    }
    const { _eRequerida, ...resto } = u;
    const params = COST_PARAMS[u.nombre];
    if (!params || !caudalLs || caudalLs <= 0) return { ...resto, costoEstimado: null, memoria, calidadSalida };
    const puntual = params.a * Math.pow(caudalLs, params.b);
    return { ...resto, costoEstimado: { min: puntual * 0.8, max: puntual * 1.3 }, memoria, calidadSalida };
  });

  return { units: unitsConCosto, eTotal, advertencias };
}

function calcularCapexTotal(units) {
  let min = 0;
  let max = 0;
  for (const u of units) {
    if (u.costoEstimado) {
      min += u.costoEstimado.min;
      max += u.costoEstimado.max;
    }
  }
  return { min, max, texto: `${formatCOP(min)} – ${formatCOP(max)} COP` };
}

const ENGINE_VERSION = "2026.08.0-secure-preview-1";
const NORMATIVE_VERSION = "Resoluciones 0631 de 2015 y 0699 de 2021 — alcance preliminar";

function publicUnits(units) {
  return units.map(({ costoEstimado, memoria, calidadSalida, ...unit }) => unit);
}

function basicUnits(units) {
  return units.map(({ memoria, calidadSalida, ...unit }) => unit);
}

function activeEntitlement(entitlement) {
  if (!entitlement?.active) return false;
  if (!entitlement.expires_at) return true;
  return new Date(entitlement.expires_at).getTime() > Date.now();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    let input = validatePredisenoInput(req.body || {});
    const auth = await authenticatedUser(req);
    let project = null;
    let entitlement = null;

    if (input.projectId && !auth) {
      return res.status(401).json({ error: "Inicia sesión para usar un proyecto guardado." });
    }

    if (auth && input.projectId) {
      const { data, error } = await auth.client
        .from("ptar_projects")
        .select("id,user_id,input_data")
        .eq("id", input.projectId)
        .maybeSingle();

      if (error || !data) {
        return res.status(403).json({ error: "El proyecto no existe o no pertenece al usuario." });
      }

      project = data;
      input = validatePredisenoInput({ ...data.input_data, projectId: data.id });

      const { data: entitlementData } = await auth.client
        .from("ptar_entitlements")
        .select("id,report_tier,active,expires_at,remaining_regenerations")
        .eq("project_id", data.id)
        .eq("user_id", auth.user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeEntitlement(entitlementData)) entitlement = entitlementData;
    }

    const {
      actividad,
      puntoVertimiento,
      tieneParametros,
      params,
      caudal,
      tipoUsuarioSuelo,
      categoriaInfiltracion,
    } = input;

    if (!ACTIVITY_PROFILES[actividad] || !VERTIMIENTO_LABELS[puntoVertimiento]) {
      return res.status(400).json({ error: "Actividad o punto de vertimiento inválidos." });
    }

    const caudalLs = caudal;
    const base = ACTIVITY_PROFILES[actividad];
    const profile = tieneParametros
      ? {
          label: `${base.label} (parámetros de laboratorio del cliente)`,
          dbo5: params.dbo5,
          dqo: params.dqo,
          sst: params.sst,
          gya: params.gya,
          ph: params.ph,
        }
      : base;

    const { units, eTotal, advertencias } = buildTrain(
      profile,
      puntoVertimiento,
      caudalLs,
      actividad,
      tipoUsuarioSuelo,
      categoriaInfiltracion
    );
    const normativa = getNormativa(puntoVertimiento, tipoUsuarioSuelo);
    const capex = calcularCapexTotal(units);
    const tier = entitlement?.report_tier || null;

    const preview = {
      profile,
      units: publicUnits(units),
      normativa,
      capex: null,
      eTotal,
      advertencias,
    };

    let output = preview;
    if (tier === "basic") {
      output = { ...preview, units: basicUnits(units), capex };
    } else if (tier === "complete") {
      output = { ...preview, units, capex };
    }

    let runId = null;
    if (auth && project) {
      const hash = createHash("sha256")
        .update(JSON.stringify(input))
        .digest("hex");

      const { data: run } = await auth.client
        .from("ptar_calculation_runs")
        .insert({
          project_id: project.id,
          user_id: auth.user.id,
          engine_version: ENGINE_VERSION,
          normative_version: NORMATIVE_VERSION,
          input_snapshot: input,
          public_output: preview,
          input_hash: hash,
        })
        .select("id")
        .single();
      runId = run?.id || null;
    }

    return res.status(200).json({
      ...output,
      runId,
      engineVersion: ENGINE_VERSION,
      access: {
        authenticated: Boolean(auth),
        projectId: project?.id || null,
        tier,
        paymentEnabled: false,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message, details: error.details });
    }
    console.error("prediseno_error", error);
    return res.status(500).json({ error: "No fue posible procesar el prediseño." });
  }
}
