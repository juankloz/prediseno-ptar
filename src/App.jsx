import React, { useState, useMemo } from "react";

// Reemplace por su número real de WhatsApp, formato internacional sin "+" ni espacios (ej. 573001234567)
const WHATSAPP_NUMBER = "573001234567";

// Como el frontend y la función /api se despliegan juntos en el mismo proyecto de Vercel,
// esta ruta relativa funciona sin configurar ninguna URL.
const API_URL = "/api/prediseno";

// Reemplace por la URL de su formulario en formspree.io (gratis, sin código) — ver README.md
const LEAD_FORM_URL = "https://formspree.io/f/SU_ID_DE_FORMULARIO";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
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
  domestico: {
    label: "Doméstico / residencial",
    dbo5: 250,
    dqo: 500,
    sst: 250,
    gya: 80,
    ph: 7,
  },
  palma: {
    label: "Agroindustrial — extracción de aceite de palma (POME)",
    dbo5: 25000,
    dqo: 50000,
    sst: 18000,
    gya: 6000,
    ph: 4.5,
  },
  lacteos: {
    label: "Industria de alimentos / lácteos",
    dbo5: 2500,
    dqo: 5000,
    sst: 1200,
    gya: 800,
    ph: 6,
  },
};

const VERTIMIENTO_LABELS = {
  cuerpo_agua: "Cuerpo de agua superficial",
  alcantarillado: "Alcantarillado público",
  suelo: "Suelo (riego / infiltración)",
};

// La lógica de decisión (buildTrain / getNormativa) vive en api/prediseno.js,
// no aquí, para no exponerla en el navegador.

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
        body: JSON.stringify({ actividad, puntoVertimiento, tieneParametros, params }),
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

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, quiero agendar una revisión de mi prediseño.\nActividad: ${ACTIVITY_PROFILES[actividad].label}\nCaudal: ${caudal} L/s\nVertimiento: ${VERTIMIENTO_LABELS[puntoVertimiento]}`
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
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {Object.entries(ACTIVITY_PROFILES).map(([key, v]) => (
                <option key={key} value={key} style={{ color: "#000" }}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>

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
              <div className="flex items-start justify-between mb-6">
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

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block px-6 py-3 text-xs uppercase tracking-widest"
                style={{ background: TOKENS.rust, color: TOKENS.ink, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}
              >
                Agendar revisión con un ingeniero →
              </a>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
