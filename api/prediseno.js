// api/prediseno.js
// Despliegue sugerido: Vercel (gratis para este volumen). Ver instrucciones al final del archivo.

const ACTIVITY_PROFILES = {
  domestico: { label: "Doméstico / residencial", dbo5: 250, dqo: 500, sst: 250, gya: 80, ph: 7 },
  palma: {
    label: "Agroindustrial — extracción de aceite de palma (POME)",
    dbo5: 25000,
    dqo: 50000,
    sst: 18000,
    gya: 6000,
    ph: 4.5,
  },
  lacteos: { label: "Industria de alimentos / lácteos", dbo5: 2500, dqo: 5000, sst: 1200, gya: 800, ph: 6 },
};

const VERTIMIENTO_LABELS = {
  cuerpo_agua: "Cuerpo de agua superficial",
  alcantarillado: "Alcantarillado público",
  suelo: "Suelo (riego / infiltración)",
};

function getNormativa(punto) {
  if (punto === "cuerpo_agua")
    return "Resolución 0631 de 2015 — límites de vertimiento a cuerpos de agua superficiales, según actividad.";
  if (punto === "alcantarillado")
    return "Resolución 0631 de 2015 + reglamento de vertimiento de la entidad prestadora del servicio de alcantarillado.";
  return "Decreto 1076 de 2015 (uso del suelo) + criterios de la autoridad ambiental regional para reúso/infiltración.";
}

function buildTrain(profile, puntoVertimiento) {
  const units = [];

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

  if (profile.dbo5 > 5000) {
    units.push({
      nombre: "Reactor anaerobio (UASB / laguna anaerobia)",
      nota: "Tratamiento secundario — etapa 1",
      justificacion: `Carga orgánica muy alta (DBO5 ≈ ${profile.dbo5.toLocaleString()} mg/L) exige una etapa anaerobia previa para reducirla antes del proceso aerobio.`,
    });
    units.push({
      nombre: "Tratamiento aerobio (lodos activados / laguna facultativa)",
      nota: "Tratamiento secundario — etapa 2",
      justificacion: "Pule el efluente anaerobio hasta niveles compatibles con el punto de vertimiento.",
    });
  } else if (profile.dbo5 > 500) {
    units.push({
      nombre: "Reactor anaerobio de flujo ascendente (RAFA / UASB)",
      nota: "Tratamiento secundario — etapa 1",
      justificacion: `Carga orgánica media-alta (DBO5 ≈ ${profile.dbo5.toLocaleString()} mg/L) se beneficia de una etapa anaerobia antes del pulimento final.`,
    });
    units.push({
      nombre: "Filtro percolador / humedal artificial",
      nota: "Tratamiento secundario — etapa 2",
      justificacion: "Pulimento aerobio de bajo costo operativo, adecuado para caudales moderados.",
    });
  } else {
    units.push({
      nombre: "Filtro anaerobio de flujo ascendente (FAFA)",
      nota: "Tratamiento secundario",
      justificacion: `Carga orgánica típica de agua residual doméstica (DBO5 ≈ ${profile.dbo5} mg/L); un FAFA es suficiente como tratamiento secundario.`,
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

  return units;
}

//module.exports = async function handler(req, res) {
export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { actividad, puntoVertimiento, tieneParametros, params } = req.body;

    if (!ACTIVITY_PROFILES[actividad] || !VERTIMIENTO_LABELS[puntoVertimiento]) {
      return res.status(400).json({ error: "actividad o puntoVertimiento inválidos" });
    }

    const base = ACTIVITY_PROFILES[actividad];
    const profile = tieneParametros
      ? {
          label: base.label + " (parámetros de laboratorio del cliente)",
          dbo5: parseFloat(params?.dbo5) || base.dbo5,
          dqo: parseFloat(params?.dqo) || base.dqo,
          sst: parseFloat(params?.sst) || base.sst,
          gya: parseFloat(params?.gya) || base.gya,
          ph: parseFloat(params?.ph) || base.ph,
        }
      : base;

    const units = buildTrain(profile, puntoVertimiento);
    const normativa = getNormativa(puntoVertimiento);

    return res.status(200).json({ profile, units, normativa });
  } catch (err) {
    return res.status(500).json({ error: "Error interno" });
  }
};

