import React, { useState, useMemo } from "react";

// El número de WhatsApp ya no vive aquí — vive en una variable de entorno en Vercel
// y lo resuelve la función api/chat.js, para que no quede visible en el código ni en la URL.

// Reemplace por sus links de pago de Wompi o Bold (se generan sin código desde su panel — ver README.md)
const PAYMENT_LINK_BASICO = "https://checkout.wompi.co/l/SU_LINK_INFORME_BASICO";
const PAYMENT_LINK_COMPLETO = "https://checkout.wompi.co/l/SU_LINK_INFORME_COMPLETO";

// Como el frontend y la función /api se despliegan juntos en el mismo proyecto de Vercel,
// esta ruta relativa funciona sin configurar ninguna URL.
const API_URL = "/api/prediseno";

// Reemplace por la URL de su formulario en formspree.io (gratis, sin código) — ver README.md
const LEAD_FORM_URL = "https://formspree.io/f/xjgnpzlo";

// Coloque su logo en la carpeta public/ del proyecto (ver README.md) — esta ruta ya lo recoge.
const LOGO_URL = "/logo.png";

// Datos de contacto que aparecen en portada y pie de página del informe descargado.
// Complete web/teléfono si quiere que también aparezcan (quedan vacíos si los deja "").
const CONTACTO = {
  marca: "JuanKloz",
  tagline: "Ingeniería, agua y consultoría ambiental",
  instagram: "@juankloz75",
  web: "https://juankloz.github.io/",
  telefono: "3173002242",
};

const BIBLIOGRAFIA = [
  "Ministerio de Ambiente y Desarrollo Sostenible. Resolución 631 de 2015 — Parámetros y valores límites máximos permisibles en los vertimientos puntuales a cuerpos de agua superficiales y a los sistemas de alcantarillado público.",
  "Metcalf & Eddy, Inc. Wastewater Engineering: Treatment and Reuse. 4ª edición. McGraw-Hill.",
  "Von Sperling, M. Wastewater Characteristics, Treatment and Disposal. IWA Publishing.",
  "Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico (RAS) — Título E, Tratamiento de Aguas Residuales.",
];

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

@media print {
  body * { visibility: hidden; }
  #reporte-imprimible, #reporte-imprimible * { visibility: visible; }
  #reporte-imprimible { position: absolute; top: 0; left: 0; width: 100%; background: #fff !important; }
  #reporte-imprimible * { color: #000 !important; border-color: #999 !important; }
  #reporte-imprimible .print-header { display: block !important; margin-bottom: 1rem; }
  #reporte-imprimible .print-section { display: block !important; page-break-inside: avoid; margin-bottom: 1.25rem; }
  #reporte-imprimible .print-pagebreak { page-break-before: always; }
  #reporte-imprimible button { display: none !important; }
  #reporte-imprimible .marca-de-agua {
    display: flex !important;
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    align-items: center; justify-content: center;
    z-index: 0; opacity: 0.06; pointer-events: none;
  }
  #reporte-imprimible .marca-de-agua span {
    font-size: 5rem; font-weight: 700; transform: rotate(-30deg);
    white-space: nowrap; font-family: 'Space Grotesk', sans-serif;
  }
  #reporte-imprimible .pie-de-pagina {
    display: block !important;
    position: fixed; bottom: 0.4cm; left: 0; width: 100%;
    text-align: center; font-size: 8px; color: #666 !important;
  }
  #reporte-imprimible .contenido-informe { position: relative; z-index: 1; }
}
`;

const TOKENS = {
  ink: "#EAF2F5",
  inkDim: "#A9C2CE",
  blueprint: "#0B3D5C",
  blueprintDeep: "#072A40",
  grid: "rgba(234,242,245,0.07)",
  rust: "#C1440E",
  brass: "#C9A227",
};

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

const ACTIVIDADES_PRINCIPALES = [
  "domestico", "cafe_tradicional", "palma", "azucar_cana", "bovino_beneficio",
  "porcinos_beneficio", "aves_beneficio", "lacteos", "hc_produccion",
  "mineria_oro", "piel_curtido", "tratamiento_residuos", "salud_atencion",
];

const SECTOR_DE = {
  hortalizas_frutas: "Agroindustria", cafe_ecologico: "Agroindustria", platano_banano: "Agroindustria",
  bovino_cria: "Ganadería", porcinos_cria: "Ganadería", bovino_porcino_dual: "Ganadería", aves_incubacion: "Ganadería",
  mineria_carbon: "Minería", mineria_hierro: "Minería", mineria_niquel: "Minería", mineria_otras: "Minería",
  hc_exploracion: "Hidrocarburos", hc_refino: "Hidrocarburos", hc_venta: "Hidrocarburos", hc_transporte: "Hidrocarburos",
  alimenticios_general: "Alimentos y bebidas", alimentos_animales: "Alimentos y bebidas", maltas_cervezas: "Alimentos y bebidas",
  bebidas_no_alcoholicas: "Alimentos y bebidas", aceites_grasas_af: "Alimentos y bebidas", cafe_soluble: "Alimentos y bebidas",
  tabaco: "Fabricación y manufactura", textiles: "Fabricación y manufactura", gases_industriales: "Fabricación y manufactura",
  papel_pulpa: "Fabricación y manufactura", papel_reciclado: "Fabricación y manufactura", abonos_nitrogenados: "Fabricación y manufactura",
  quimicos_general: "Fabricación y manufactura", pigmentos_azul: "Fabricación y manufactura", pigmentos_oxidos_fe: "Fabricación y manufactura",
  pigmentos_cromatos: "Fabricación y manufactura", acidos_inorganicos: "Fabricación y manufactura", plasticos: "Fabricación y manufactura",
  sabores_fragancias: "Fabricación y manufactura", surfactantes: "Fabricación y manufactura", plaguicidas: "Fabricación y manufactura",
  pinturas_barnices: "Fabricación y manufactura", jabones_detergentes: "Fabricación y manufactura", farmaceuticos: "Fabricación y manufactura",
  vidrio_cemento: "Fabricación y manufactura", ceramicos: "Fabricación y manufactura", hormigon_yeso: "Fabricación y manufactura",
  revestimiento_metales: "Fabricación y manufactura", pilas_baterias: "Fabricación y manufactura", iluminacion: "Fabricación y manufactura",
  uso_domestico: "Fabricación y manufactura", maquinaria_electrolitico: "Fabricación y manufactura", vehiculos: "Fabricación y manufactura",
  autopartes: "Fabricación y manufactura", siderurgia: "Fabricación y manufactura", imprentas: "Fabricación y manufactura",
  bebidas_destiladas: "Fabricación y manufactura", mezcla_alcoholicas: "Fabricación y manufactura", caucho: "Fabricación y manufactura",
  generacion_energia: "Servicios", reciclaje_plasticos: "Servicios", reciclaje_tambores: "Servicios",
  salud_hemodialisis: "Servicios", pompas_funebres: "Servicios",
  otras_no_contempladas: "Otras",
};
const ACTIVIDADES_OTRAS_AGRUPADAS = Object.keys(ACTIVITY_PROFILES)
  .filter((key) => !ACTIVIDADES_PRINCIPALES.includes(key))
  .reduce((acc, key) => {
    const sector = SECTOR_DE[key] || "Otras";
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(key);
    return acc;
  }, {});


const VERTIMIENTO_LABELS = {
  cuerpo_agua: "Cuerpo de agua superficial",
  alcantarillado: "Alcantarillado público",
  suelo: "Suelo (riego / infiltración)",
};

// La lógica de decisión (buildTrain / getNormativa) vive en api/prediseno.js,
// no aquí, para no exponerla en el navegador.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acepta números con o sin +, entre 7 y 15 dígitos (rango internacional válido)
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,14}$/;

function isValidContact(value) {
  const v = value.trim();
  return EMAIL_RE.test(v) || PHONE_RE.test(v);
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span
        className="block text-xs mb-1 tracking-wide uppercase"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${TOKENS.inkDim}`,
  color: TOKENS.ink,
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: "0.95rem",
  padding: "0.4rem 0.1rem",
  outline: "none",
};

// Ejemplo fijo del Informe 2, para mostrar el alcance antes de comprar (caso ficticio, no calculado en vivo).
const EJEMPLO_INFORME2 = {
  actividad: "Alimentos — elaboración de productos lácteos",
  caudal: 20,
  vertimiento: "Cuerpo de agua superficial",
  eTotal: 0.9,
  filas: [
    { nombre: "Sedimentación primaria / tanque Imhoff", criterio: "Carga superficial = 1.5 m³/m²·h", volumen: 144, area: 136.2, dbo5Salida: 1750, costoMin: 53818659, costoMax: 87455321 },
    { nombre: "Reactor anaerobio de flujo ascendente (RAFA / UASB)", criterio: "Tiempo de retención = 5.0 h", volumen: 359.8, area: 314.4, dbo5Salida: 787, costoMin: 111015824, costoMax: 180400714 },
    { nombre: "Filtro percolador / humedal artificial", criterio: "Carga superficial = 1 m³/m²·h", volumen: 108, area: 126, dbo5Salida: 250, costoMin: 49666594, costoMax: 80708215 },
  ],
};

export default function App() {
  const [caudal, setCaudal] = useState("50");
  const [actividad, setActividad] = useState("domestico");
  const [puntoVertimiento, setPuntoVertimiento] = useState("cuerpo_agua");
  const [tieneParametros, setTieneParametros] = useState(false);
  const [params, setParams] = useState({ dbo5: "", dqo: "", sst: "", gya: "", ph: "" });

  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadError, setLeadError] = useState("");

  const [remoteResult, setRemoteResult] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");

  const nivelPagado = useMemo(() => {
    if (typeof window === "undefined") return null;
    const v = new URLSearchParams(window.location.search).get("pagado");
    return v === "basico" || v === "completo" ? v : null;
  }, []);

  const [verEjemplo, setVerEjemplo] = useState(false);

  const profilePreview = useMemo(() => {
    if (!tieneParametros) return ACTIVITY_PROFILES[actividad];
    const base = ACTIVITY_PROFILES[actividad];
    return {
      dbo5: parseFloat(params.dbo5) || base.dbo5,
      dqo: parseFloat(params.dqo) || base.dqo,
      sst: parseFloat(params.sst) || base.sst,
      gya: parseFloat(params.gya) || base.gya,
      ph: parseFloat(params.ph) || base.ph,
    };
  }, [tieneParametros, params, actividad]);

  async function fetchPrediseno() {
    setRemoteLoading(true);
    setRemoteError("");
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividad, puntoVertimiento, tieneParametros, params, caudal }),
      });
      if (!resp.ok) throw new Error("respuesta no válida");
      const data = await resp.json();
      setRemoteResult(data);
    } catch (err) {
      setRemoteError("No se pudo calcular el esquema. Intente de nuevo en unos segundos.");
    } finally {
      setRemoteLoading(false);
    }
  }

  async function handleLeadSubmit(e) {
    e.preventDefault();
    if (!leadName.trim() || !leadContact.trim()) {
      setLeadError("Ingrese su nombre y un correo o WhatsApp de contacto.");
      return;
    }
    if (!isValidContact(leadContact)) {
      setLeadError("Ingrese un correo válido (ej. nombre@dominio.com) o un número de WhatsApp válido (ej. 3001234567).");
      return;
    }
    setLeadError("");
    setLeadSaving(true);
    try {
      // Envía el lead a Formspree — usted lo recibe por correo automáticamente.
      await fetch(LEAD_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: leadName,
          contacto: leadContact,
          caudal,
          actividad: ACTIVITY_PROFILES[actividad].label,
          puntoVertimiento: VERTIMIENTO_LABELS[puntoVertimiento],
        }),
      });
    } catch (err) {
      console.error("No se pudo enviar el lead:", err);
    } finally {
      setLeadSaving(false);
      setLeadCaptured(true);
      fetchPrediseno();
    }
  }

  const chatHref = `/api/chat?caudal=${encodeURIComponent(caudal)}&actividad=${encodeURIComponent(
    ACTIVITY_PROFILES[actividad].label
  )}&vertimiento=${encodeURIComponent(VERTIMIENTO_LABELS[puntoVertimiento])}`;

  // URL absoluta necesaria para que el QR funcione al escanearlo desde otro dispositivo
  const chatHrefAbsolute =
    typeof window !== "undefined" ? `${window.location.origin}${chatHref}` : chatHref;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    chatHrefAbsolute
  )}`;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: TOKENS.blueprint,
        backgroundImage: `linear-gradient(${TOKENS.grid} 1px, transparent 1px), linear-gradient(90deg, ${TOKENS.grid} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <style>{FONTS}</style>

      <header className="px-6 pt-10 pb-6 md:px-12">
        <div
          className="text-xs tracking-widest uppercase mb-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}
        >
          Anteproyecto — prediseño conceptual
        </div>
        <h1
          className="text-2xl md:text-4xl font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: TOKENS.ink }}
        >
          Sistema de tratamiento de aguas residuales
        </h1>
        <p className="mt-2 max-w-xl text-sm md:text-base" style={{ color: TOKENS.inkDim }}>
          Ingrese los datos disponibles. El sistema propone el tren de unidades que debería
          incluir el sistema de tratamiento, a nivel conceptual.
        </p>
      </header>

      <main className="px-6 pb-16 md:px-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* FORM PANEL */}
        <section
          className="md:col-span-2 p-6 rounded-sm"
          style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.grid}` }}
        >
          <h2
            className="text-sm uppercase tracking-wide mb-6"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.ink }}
          >
            Ficha de datos
          </h2>

          <Field label="Caudal (Q, L/s)">
            <input type="number" value={caudal} onChange={(e) => setCaudal(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Actividad económica">
            <select
              value={ACTIVIDADES_PRINCIPALES.includes(actividad) ? actividad : "otra"}
              onChange={(e) => {
                if (e.target.value === "otra") {
                  const primerSector = Object.keys(ACTIVIDADES_OTRAS_AGRUPADAS)[0];
                  setActividad(ACTIVIDADES_OTRAS_AGRUPADAS[primerSector][0]);
                } else {
                  setActividad(e.target.value);
                }
              }}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {ACTIVIDADES_PRINCIPALES.map((key) => (
                <option key={key} value={key} style={{ color: "#000" }}>
                  {ACTIVITY_PROFILES[key].label}
                </option>
              ))}
              <option value="otra" style={{ color: "#000" }}>
                Otra actividad (ver todas) →
              </option>
            </select>
          </Field>

          {!ACTIVIDADES_PRINCIPALES.includes(actividad) && (
            <Field label="Seleccione la actividad específica">
              <select
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {Object.entries(ACTIVIDADES_OTRAS_AGRUPADAS).map(([sector, keys]) => (
                  <optgroup key={sector} label={sector} style={{ color: "#000" }}>
                    {keys.map((key) => (
                      <option key={key} value={key} style={{ color: "#000" }}>
                        {ACTIVITY_PROFILES[key].label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          )}

          <Field label="Punto de vertimiento">
            <select
              value={puntoVertimiento}
              onChange={(e) => setPuntoVertimiento(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {Object.entries(VERTIMIENTO_LABELS).map(([key, v]) => (
                <option key={key} value={key} style={{ color: "#000" }}>
                  {v}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex items-center gap-2 mt-6 mb-4 cursor-pointer select-none">
            <input type="checkbox" checked={tieneParametros} onChange={(e) => setTieneParametros(e.target.checked)} />
            <span
              className="text-xs uppercase tracking-wide"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}
            >
              Tengo parámetros de laboratorio
            </span>
          </label>

          {tieneParametros && (
            <div className="grid grid-cols-2 gap-x-4">
              {["dbo5", "dqo", "sst", "gya", "ph"].map((key) => (
                <Field key={key} label={key.toUpperCase() + " (mg/L)"}>
                  <input
                    type="number"
                    value={params[key]}
                    placeholder={String(ACTIVITY_PROFILES[actividad][key])}
                    onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${TOKENS.grid}` }}>
            <div
              className="text-xs uppercase tracking-wide mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}
            >
              Perfil asumido
            </div>
            <div className="text-xs leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.inkDim }}>
              DBO5 {profilePreview.dbo5.toLocaleString()} · DQO {profilePreview.dqo.toLocaleString()} · SST{" "}
              {profilePreview.sst.toLocaleString()} · GyA {profilePreview.gya.toLocaleString()} · pH {profilePreview.ph}
            </div>
            <div
              className="text-xs mt-2"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: ACTIVITY_PROFILES[actividad].confianza === "literatura" ? TOKENS.brass : TOKENS.rust,
              }}
            >
              {ACTIVITY_PROFILES[actividad].confianza === "literatura"
                ? "Valor de literatura específica del proceso"
                : "⚠ Estimación genérica — pendiente de validar con datos reales"}
            </div>
          </div>
        </section>

        {/* OUTPUT PANEL */}
        <section className="md:col-span-3">
          {!leadCaptured ? (
            <div className="p-6 md:p-8 rounded-sm max-w-md" style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.grid}` }}>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                Su esquema está listo
              </div>
              <p className="text-sm mb-5" style={{ color: TOKENS.inkDim }}>
                Déjenos sus datos para mostrarle el tren de tratamiento propuesto y enviarle una copia.
              </p>
              <form onSubmit={handleLeadSubmit}>
                <Field label="Nombre">
                  <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Correo o WhatsApp">
                  <input type="text" value={leadContact} onChange={(e) => setLeadContact(e.target.value)} style={inputStyle} />
                </Field>
                {leadError && (
                  <p className="text-xs mt-1 mb-2" style={{ color: TOKENS.rust }}>
                    {leadError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={leadSaving}
                  className="mt-4 px-5 py-2 text-xs uppercase tracking-widest"
                  style={{
                    background: TOKENS.brass,
                    color: TOKENS.blueprintDeep,
                    fontFamily: "'IBM Plex Mono', monospace",
                    border: "none",
                    cursor: leadSaving ? "default" : "pointer",
                    opacity: leadSaving ? 0.6 : 1,
                  }}
                >
                  {leadSaving ? "Guardando..." : "Ver mi esquema"}
                </button>
              </form>
            </div>
          ) : remoteLoading ? (
            <p className="text-sm" style={{ color: TOKENS.inkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
              Calculando esquema...
            </p>
          ) : remoteError ? (
            <div className="p-4 text-sm rounded-sm" style={{ border: `1px solid ${TOKENS.rust}`, color: TOKENS.rust }}>
              {remoteError}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-sm uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.ink }}>
                  Tren de tratamiento propuesto — Q = {caudal || "?"} L/s
                </h2>
                <div
                  className="px-3 py-2 text-[10px] leading-tight uppercase tracking-widest text-center"
                  style={{ border: `2px solid ${TOKENS.rust}`, color: TOKENS.rust, fontFamily: "'IBM Plex Mono', monospace", transform: "rotate(4deg)" }}
                >
                  Anteproyecto
                  <br />
                  no válido para
                  <br />
                  construcción
                </div>
              </div>

              {remoteResult?.eTotal != null && (
                <p className="text-xs mb-4" style={{ color: TOKENS.brass, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Eficiencia de remoción de DBO5 requerida para cumplir la norma: {(remoteResult.eTotal * 100).toFixed(0)}%
                </p>
              )}

              {(remoteResult?.advertencias || []).map((adv, i) => (
                <div key={i} className="mb-4 p-3 text-xs rounded-sm" style={{ border: `1px solid ${TOKENS.rust}`, color: TOKENS.rust }}>
                  ⚠ {adv}
                </div>
              ))}

              <ol className="relative">
                {(remoteResult?.units || []).map((u, i) => (
                  <li key={i} className="relative pl-14 pb-8">
                    {i < remoteResult.units.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px" style={{ borderLeft: `2px dashed ${TOKENS.inkDim}` }} />
                    )}
                    <div
                      className="absolute left-0 top-0 flex items-center justify-center rounded-full"
                      style={{ width: "2rem", height: "2rem", border: `1px solid ${TOKENS.ink}`, color: TOKENS.ink, fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem" }}
                    >
                      {i + 1}
                    </div>
                    <div className="p-4 rounded-sm" style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.grid}` }}>
                      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                        {u.nota}
                      </div>
                      <div className="text-base md:text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: TOKENS.ink }}>
                        {u.nombre}
                      </div>
                      <p className="text-sm" style={{ color: TOKENS.inkDim }}>
                        {u.justificacion}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 p-4 text-xs leading-relaxed rounded-sm" style={{ border: `1px solid ${TOKENS.grid}`, color: TOKENS.inkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                Marco normativo de referencia: {remoteResult?.normativa}
              </div>

              {!nivelPagado ? (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-sm" style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.grid}` }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                      Informe 1 — $10.000 COP
                    </div>
                    <p className="text-sm mb-4" style={{ color: TOKENS.inkDim }}>
                      Estimado de inversión (CAPEX) por unidad y total del sistema, en un PDF con
                      su marca.
                    </p>
                    <a
                      href={PAYMENT_LINK_BASICO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2 text-xs uppercase tracking-widest"
                      style={{ background: TOKENS.brass, color: TOKENS.blueprintDeep, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}
                    >
                      Comprar Informe 1 →
                    </a>
                  </div>

                  <div className="p-6 rounded-sm" style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.brass}` }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                      Informe 2 — $250.000 COP
                    </div>
                    <p className="text-sm mb-3" style={{ color: TOKENS.inkDim }}>
                      Todo lo del Informe 1, más memorias de cálculo (volumen, criterio de diseño,
                      área) y la calidad del agua a la salida de cada unidad.
                    </p>
                    <button
                      onClick={() => setVerEjemplo(!verEjemplo)}
                      className="block mb-3 text-xs underline"
                      style={{ color: TOKENS.brass, background: "none", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {verEjemplo ? "Ocultar ejemplo" : "Ver ejemplo del Informe 2 →"}
                    </button>
                    <a
                      href={PAYMENT_LINK_COMPLETO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2 text-xs uppercase tracking-widest"
                      style={{ background: TOKENS.brass, color: TOKENS.blueprintDeep, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}
                    >
                      Comprar Informe 2 →
                    </a>
                  </div>

                  {verEjemplo && (
                    <div className="md:col-span-2 p-5 rounded-sm" style={{ border: `1px dashed ${TOKENS.inkDim}` }}>
                      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: TOKENS.brass, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Ejemplo ilustrativo — no es su resultado
                      </div>
                      <p className="text-xs mb-3" style={{ color: TOKENS.inkDim }}>
                        {EJEMPLO_INFORME2.actividad} · Q = {EJEMPLO_INFORME2.caudal} L/s ·{" "}
                        {EJEMPLO_INFORME2.vertimiento} · Eficiencia requerida: {(EJEMPLO_INFORME2.eTotal * 100).toFixed(0)}%
                      </p>
                      <table className="w-full text-xs" style={{ color: TOKENS.ink, borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ color: TOKENS.brass, fontFamily: "'IBM Plex Mono', monospace" }}>
                            <th className="text-left pb-2">Unidad</th>
                            <th className="text-left pb-2">Criterio de diseño</th>
                            <th className="text-right pb-2">Volumen (m³)</th>
                            <th className="text-right pb-2">Área (m²)</th>
                            <th className="text-right pb-2">DBO5 salida</th>
                            <th className="text-right pb-2">Costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {EJEMPLO_INFORME2.filas.map((f, i) => (
                            <tr key={i} style={{ borderTop: `1px solid ${TOKENS.grid}` }}>
                              <td className="py-2 pr-2">{f.nombre}</td>
                              <td className="py-2 pr-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{f.criterio}</td>
                              <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{f.volumen}</td>
                              <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{f.area}</td>
                              <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{f.dbo5Salida} mg/L</td>
                              <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                ${f.costoMin.toLocaleString("es-CO")}–${f.costoMax.toLocaleString("es-CO")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div id="reporte-imprimible" className="mt-6 p-6 rounded-sm" style={{ background: TOKENS.blueprintDeep, border: `1px solid ${TOKENS.brass}` }}>
                  <div className="marca-de-agua" style={{ display: "none" }}>
                    <span>{CONTACTO.marca.toUpperCase()} — PRELIMINAR</span>
                  </div>

                  <div className="contenido-informe">
                    <div className="print-header" style={{ display: "none" }}>
                      <img src={LOGO_URL} alt={CONTACTO.marca} style={{ height: 60, marginBottom: 12 }} />
                      <h1 style={{ fontSize: "1.4rem", marginBottom: 4 }}>
                        Prediseño de sistema de tratamiento de aguas residuales
                      </h1>
                      <p style={{ fontSize: "0.85rem" }}>
                        {nivelPagado === "completo" ? "Informe completo" : "Informe básico"} — {CONTACTO.marca} · {CONTACTO.tagline}
                      </p>
                      <p style={{ fontSize: "0.8rem" }}>
                        Actividad: {ACTIVITY_PROFILES[actividad].label} · Caudal: {caudal} L/s · Vertimiento:{" "}
                        {VERTIMIENTO_LABELS[puntoVertimiento]} · Fecha: {new Date().toLocaleDateString("es-CO")}
                      </p>
                    </div>

                    {nivelPagado === "completo" && (
                      <>
                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            1. Introducción
                          </h3>
                          <p className="text-sm" style={{ color: TOKENS.inkDim }}>
                            El presente documento constituye un anteproyecto conceptual de sistema de
                            tratamiento de aguas residuales para una actividad de tipo{" "}
                            {ACTIVITY_PROFILES[actividad].label.toLowerCase()}, con un caudal de diseño
                            de {caudal} L/s y vertimiento previsto hacia {VERTIMIENTO_LABELS[puntoVertimiento].toLowerCase()}.
                            Su propósito es orientar la toma de decisiones tempranas sobre la
                            configuración del tren de tratamiento y el orden de magnitud de la
                            inversión requerida, antes de contratar el diseño detallado.
                          </p>
                        </div>

                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            2. Objetivos
                          </h3>
                          <p className="text-sm mb-1" style={{ color: TOKENS.inkDim }}>
                            <b>General:</b> proponer un prediseño conceptual del sistema de tratamiento
                            de aguas residuales aplicable al caso descrito.
                          </p>
                          <p className="text-sm" style={{ color: TOKENS.inkDim }}>
                            <b>Específicos:</b> (i) caracterizar el agua residual de entrada; (ii)
                            identificar la normativa de vertimiento aplicable; (iii) definir el tren de
                            unidades de tratamiento requerido; (iv) estimar el orden de magnitud de la
                            inversión (CAPEX).
                          </p>
                        </div>

                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            3. Alcance y limitaciones
                          </h3>
                          <p className="text-sm" style={{ color: TOKENS.inkDim }}>
                            Este es un anteproyecto conceptual — no constituye diseño detallado, no
                            reemplaza las memorias de cálculo firmadas por un profesional competente, y
                            no debe usarse para construcción. Los criterios de diseño empleados son
                            simplificaciones razonables para esta etapa; el dimensionamiento definitivo
                            requiere caracterización de campo y validación profesional adicional.
                          </p>
                        </div>

                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            4. Caracterización del agua residual
                          </h3>
                          <p className="text-sm mb-1" style={{ color: TOKENS.inkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                            DBO5 {profilePreview.dbo5.toLocaleString()} mg/L · DQO {profilePreview.dqo.toLocaleString()} mg/L · SST{" "}
                            {profilePreview.sst.toLocaleString()} mg/L · GyA {profilePreview.gya.toLocaleString()} mg/L · pH {profilePreview.ph}
                          </p>
                          <p className="text-xs" style={{ color: TOKENS.inkDim }}>
                            Fuente: {tieneParametros ? "parámetros de laboratorio reportados por el cliente" : "valor típico de literatura para esta actividad"}.
                          </p>
                        </div>
                      </>
                    )}

                    <div className="print-section">
                      <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                        {nivelPagado === "completo" ? "5. Marco normativo aplicable" : "Marco normativo aplicable"}
                      </h3>
                      <p className="text-xs" style={{ color: TOKENS.inkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {remoteResult?.normativa}
                      </p>
                    </div>

                    {(remoteResult?.advertencias || []).length > 0 && (
                      <div className="print-section">
                        {remoteResult.advertencias.map((adv, i) => (
                          <p key={i} className="text-xs mb-1" style={{ color: TOKENS.rust }}>⚠ {adv}</p>
                        ))}
                      </div>
                    )}

                    <div className="print-section print-pagebreak">
                      <h3 className="text-sm uppercase tracking-wide mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                        {nivelPagado === "completo" ? "6. Tren de tratamiento — memorias de cálculo y estimado de inversión" : "Estimado de inversión (CAPEX) — orden de magnitud"}
                      </h3>
                      <table className="w-full text-xs mb-3" style={{ color: TOKENS.ink, borderCollapse: "collapse" }}>
                        <thead>
                          {nivelPagado === "completo" && (
                            <tr style={{ color: TOKENS.brass, fontFamily: "'IBM Plex Mono', monospace" }}>
                              <th className="text-left pb-2">Unidad</th>
                              <th className="text-left pb-2">Criterio</th>
                              <th className="text-right pb-2">Vol. (m³)</th>
                              <th className="text-right pb-2">Área (m²)</th>
                              <th className="text-right pb-2">DBO5 salida</th>
                              <th className="text-right pb-2">Costo</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {(remoteResult?.units || [])
                            .filter((u) => u.costoEstimado)
                            .map((u, i) =>
                              nivelPagado === "completo" ? (
                                <tr key={i} style={{ borderTop: `1px solid ${TOKENS.grid}` }}>
                                  <td className="py-2 pr-2">{u.nombre}</td>
                                  <td className="py-2 pr-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{u.memoria?.criterio || "—"}</td>
                                  <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{u.memoria?.volumen_m3 ?? "—"}</td>
                                  <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{u.memoria?.area_m2 ?? "—"}</td>
                                  <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{u.calidadSalida?.dbo5 ?? "—"} mg/L</td>
                                  <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                    ${Math.round(u.costoEstimado.min).toLocaleString("es-CO")}–${Math.round(u.costoEstimado.max).toLocaleString("es-CO")}
                                  </td>
                                </tr>
                              ) : (
                                <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.grid}` }}>
                                  <td className="py-2 pr-4">{u.nombre}</td>
                                  <td className="py-2 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                    ${Math.round(u.costoEstimado.min).toLocaleString("es-CO")} – $
                                    {Math.round(u.costoEstimado.max).toLocaleString("es-CO")} COP
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                      <p className="text-sm mb-1" style={{ color: TOKENS.brass, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Total estimado: {remoteResult?.capex?.texto}
                      </p>
                      <p className="text-xs" style={{ color: TOKENS.inkDim }}>
                        Cifras de orden de magnitud para una escala pequeña-mediana — no reemplazan
                        una cotización con proveedores reales.
                      </p>
                    </div>

                    {nivelPagado === "completo" && (
                      <>
                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            7. Conclusiones y recomendaciones
                          </h3>
                          <p className="text-sm" style={{ color: TOKENS.inkDim }}>
                            El sistema propuesto requiere una eficiencia de remoción de DBO5 de
                            aproximadamente {((remoteResult?.eTotal || 0) * 100).toFixed(0)}% para cumplir
                            la norma aplicable.{" "}
                            {(remoteResult?.eTotal || 0) >= 0.9
                              ? "Al tratarse de una exigencia alta, se recomienda validar la caracterización de entrada con datos reales de laboratorio y considerar un tren multi-etapa robusto antes de avanzar al diseño detallado."
                              : "Es una exigencia moderada, alcanzable con el tren propuesto; se recomienda de todas formas validar los criterios de diseño con datos de campo antes del diseño detallado."}
                          </p>
                        </div>

                        <div className="print-section">
                          <h3 className="text-sm uppercase tracking-wide mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.brass }}>
                            8. Bibliografía
                          </h3>
                          <ul className="text-xs pl-4" style={{ color: TOKENS.inkDim, listStyle: "disc" }}>
                            {BIBLIOGRAFIA.map((ref, i) => (
                              <li key={i} className="mb-1">{ref}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pie-de-pagina" style={{ display: "none" }}>
                    {CONTACTO.marca} — {CONTACTO.tagline} — Instagram {CONTACTO.instagram}
                    {CONTACTO.web && ` — ${CONTACTO.web}`}
                    {CONTACTO.telefono && ` — ${CONTACTO.telefono}`}
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: TOKENS.brass, color: TOKENS.blueprintDeep, fontFamily: "'IBM Plex Mono', monospace", border: "none", cursor: "pointer" }}
                  >
                    Descargar PDF →
                  </button>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <a
                  href={chatHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-xs uppercase tracking-widest"
                  style={{ background: TOKENS.rust, color: TOKENS.ink, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}
                >
                  Agendar revisión con un ingeniero →
                </a>
                <div className="flex items-center gap-3">
                  <img src={qrSrc} alt="Código QR para agendar por WhatsApp" width={80} height={80} style={{ background: "#fff", padding: "4px" }} />
                  <span className="text-xs" style={{ color: TOKENS.inkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
                    O escanea desde tu celular
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
