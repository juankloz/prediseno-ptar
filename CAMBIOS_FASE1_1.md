# Cambios — Fase 1.1

## Experiencia del usuario

- Se eliminó el segundo formulario que solicitaba nombre y correo o WhatsApp.
- El correo solo se solicita una vez, en el panel de autenticación.
- La vista previa gratuita puede generarse sin iniciar sesión.
- Una cuenta verificada sirve para guardar el proyecto y recuperar resultados.
- Se reemplazó el formulario duplicado por un botón directo: `Generar vista previa`.
- Se añadieron estados más claros de cálculo, error y reintento.
- El código UUID completo del proyecto ya no se muestra; se presenta un código corto.
- Se corrigió la unidad del pH.

## Productos

- Se mejoró la presentación de Informe 1 e Informe 2.
- Se añadió un ejemplo visible del Informe 1.
- El ejemplo del Informe 1 muestra:
  - resumen del caso;
  - tren conceptual;
  - rango económico;
  - alcance del entregable;
  - limitaciones.
- El ejemplo del Informe 2 se mantiene y ahora responde mejor en pantallas pequeñas.

## Seguridad

No se modificaron las políticas RLS, la base de datos ni las variables de entorno.
El acceso pagado continúa desactivado hasta implementar Wompi mediante órdenes y
webhook firmado.
