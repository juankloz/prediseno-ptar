import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function AuthPanel({ session, projectId, projectStatus, tokens }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestAccess(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setBusy(true);
    setStatus("");
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setBusy(false);
    setStatus(
      error
        ? error.message
        : "Enlace enviado. Revisa la bandeja principal y el correo no deseado."
    );
  }

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
  }

  return (
    <section
      className="p-4 md:p-5 rounded-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
      style={{ background: tokens.blueprintDeep, border: `1px solid ${tokens.grid}` }}
      aria-label="Acceso seguro"
    >
      <div>
        <div
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: tokens.brass, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Cuenta y proyectos
        </div>
        {session ? (
          <>
            <p className="text-sm" style={{ color: tokens.ink }}>
              Sesión verificada: <strong>{session.user.email}</strong>
            </p>
            <p className="text-xs mt-1" style={{ color: tokens.inkDim }}>
              {projectId
                ? `Proyecto guardado: ${projectId}`
                : "El proyecto se guardará al calcular la vista previa."}
              {projectStatus === "saving" ? " · Guardando…" : ""}
            </p>
          </>
        ) : (
          <p className="text-sm max-w-xl" style={{ color: tokens.inkDim }}>
            La vista previa es gratuita. Inicia sesión por correo para guardar el proyecto y
            vincular posteriormente un pago seguro a ese proyecto.
          </p>
        )}
      </div>

      {session ? (
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="px-4 py-2 text-xs uppercase tracking-widest"
          style={{ border: `1px solid ${tokens.inkDim}`, color: tokens.ink, background: "transparent" }}
        >
          Cerrar sesión
        </button>
      ) : (
        <form onSubmit={requestAccess} className="flex flex-col sm:flex-row gap-2 min-w-0 md:min-w-[430px]">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@dominio.com"
            required
            className="min-w-0 flex-1 px-3 py-2 text-sm"
            style={{ color: "#071f2e", background: "#fff", border: "1px solid #94a3b8" }}
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-xs uppercase tracking-widest"
            style={{ background: tokens.brass, color: tokens.blueprintDeep }}
          >
            {busy ? "Enviando…" : "Enviar acceso"}
          </button>
          {status && (
            <span className="text-xs sm:absolute sm:mt-11" style={{ color: tokens.inkDim }}>
              {status}
            </span>
          )}
        </form>
      )}
    </section>
  );
}
