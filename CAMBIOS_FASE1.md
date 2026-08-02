# Cambios incluidos

- Supabase independiente configurado mediante variables de entorno.
- Autenticación sin contraseña por correo.
- Proyectos persistentes con RLS.
- Cálculos asociados al usuario y al proyecto.
- Validación estricta de caudal, DBO5, DQO, SST, grasas, pH y categorías.
- Rechazo de números negativos, infinitos, NaN y categorías inválidas.
- Respuesta pública sin CAPEX, memorias ni calidad por etapa.
- Informe básico y completo controlados por `ptar_entitlements`.
- Parámetro `pagado` eliminado.
- Enlaces estáticos de Wompi eliminados.
- Formspree retirado de la captura inicial.
- Productos y precios sembrados, pero pagos deshabilitados.
- Encabezados básicos de seguridad en Vercel.
- Función administrativa para otorgar acceso de prueba.

## Pendiente para la fase 2

- creación de órdenes en servidor;
- checkout Wompi con referencia única;
- webhook firmado e idempotente;
- clave secreta de Supabase solo en Vercel;
- generación de PDF en servidor;
- Storage privado de informes;
- panel administrativo.
