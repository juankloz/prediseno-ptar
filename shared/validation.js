const SOIL_USER_TYPES = new Set(["rural_dispersa", "equiparable", "diferente"]);
const INFILTRATION_CATEGORIES = new Set(["I", "II", "III"]);
const DISCHARGE_POINTS = new Set(["cuerpo_agua", "alcantarillado", "suelo"]);

function finiteNumber(value, field, { min, max, required = true }) {
  if ((value === "" || value == null) && !required) return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${field}: ingrese un número finito.`);
  }
  if (parsed < min || parsed > max) {
    throw new ValidationError(`${field}: el valor debe estar entre ${min} y ${max}.`);
  }
  return parsed;
}

export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export function validatePredisenoInput(raw = {}) {
  const actividad = String(raw.actividad || "").trim();
  const puntoVertimiento = String(raw.puntoVertimiento || "").trim();
  const tieneParametros = raw.tieneParametros === true;

  if (!actividad || actividad.length > 100) {
    throw new ValidationError("Actividad económica inválida.");
  }
  if (!DISCHARGE_POINTS.has(puntoVertimiento)) {
    throw new ValidationError("Punto de vertimiento inválido.");
  }

  const caudal = finiteNumber(raw.caudal, "Caudal", { min: 0.001, max: 10000 });
  let tipoUsuarioSuelo = String(raw.tipoUsuarioSuelo || "diferente").trim();
  let categoriaInfiltracion = String(raw.categoriaInfiltracion || "I").trim();

  if (puntoVertimiento === "suelo") {
    if (actividad !== "domestico") {
      throw new ValidationError(
        "El vertimiento a suelo de esta versión solo está habilitado para agua residual doméstica."
      );
    }
    if (!SOIL_USER_TYPES.has(tipoUsuarioSuelo)) {
      throw new ValidationError("Tipo de usuario para vertimiento a suelo inválido.");
    }
    if (!INFILTRATION_CATEGORIES.has(categoriaInfiltracion)) {
      throw new ValidationError("Categoría de infiltración inválida.");
    }
  } else {
    tipoUsuarioSuelo = "diferente";
    categoriaInfiltracion = "I";
  }

  const params = raw.params || {};
  const normalizedParams = tieneParametros
    ? {
        dbo5: finiteNumber(params.dbo5, "DBO5", { min: 0.01, max: 100000 }),
        dqo: finiteNumber(params.dqo, "DQO", { min: 0.01, max: 250000 }),
        sst: finiteNumber(params.sst, "SST", { min: 0, max: 100000 }),
        gya: finiteNumber(params.gya, "Grasas y aceites", { min: 0, max: 50000 }),
        ph: finiteNumber(params.ph, "pH", { min: 0, max: 14 }),
      }
    : {};

  const projectId = raw.projectId == null || raw.projectId === ""
    ? null
    : String(raw.projectId).trim();

  if (projectId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
    throw new ValidationError("Identificador de proyecto inválido.");
  }

  return {
    actividad,
    puntoVertimiento,
    tieneParametros,
    params: normalizedParams,
    caudal,
    tipoUsuarioSuelo,
    categoriaInfiltracion,
    projectId,
  };
}
