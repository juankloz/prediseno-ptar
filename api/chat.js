export default async function handler(req, res) {
  const numero = process.env.WHATSAPP_NUMBER;

  if (!numero) {
    return res.status(500).send("Falta configurar WHATSAPP_NUMBER en Vercel (Settings → Environment Variables).");
  }

  const { caudal, actividad, vertimiento } = req.query;

  const mensaje = `Hola, quiero agendar una revisión de mi prediseño.
Actividad: ${actividad || "no especificada"}
Caudal: ${caudal || "?"} L/s
Vertimiento: ${vertimiento || "no especificado"}`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  res.writeHead(302, { Location: url });
  res.end();
}
