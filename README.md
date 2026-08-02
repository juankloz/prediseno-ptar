> **Versión segura Fase 1:** los pagos están desactivados. El acceso premium depende de Supabase Auth y de un permiso por proyecto. Consulte `INSTRUCCIONES_FASE1.md`.

# Prediseño de PTAR — proyecto desplegable

Este proyecto tiene dos partes que se despliegan juntas, en el mismo sitio:
- `src/` — la página que ve el usuario (formulario + esquema)
- `api/prediseno.js` — la función que calcula el tren de tratamiento (la lógica que no debe verse en el navegador)

## Por qué GitHub + Vercel (y no GitHub Pages)

GitHub Pages solo sirve archivos estáticos — no puede ejecutar la función `api/prediseno.js`,
que es justamente la pieza que protege su lógica de negocio. Vercel sí ejecuta esa función,
y además se conecta directo a su repositorio de GitHub: cada vez que suba un cambio, Vercel
lo publica automáticamente, sin que usted tenga que hacer nada manual.

Su cuenta de GitHub sirve para guardar y versionar el código; Vercel es quien lo pone en línea.

## Paso 1 — Subir el proyecto a GitHub

1. En GitHub, cree un repositorio nuevo (por ejemplo `prediseno-ptar`), vacío, sin README.
2. En su computador, dentro de esta carpeta, ejecute:
   ```
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/SU_USUARIO/prediseno-ptar.git
   git push -u origin main
   ```

## Paso 2 — Conectar el repositorio a Vercel

1. Entre a vercel.com con su cuenta existente
2. "Add New" → "Project" → seleccione el repositorio `prediseno-ptar` de GitHub
3. Vercel detecta automáticamente que es un proyecto Vite — no necesita cambiar nada
4. Clic en "Deploy"

En unos minutos le entrega una URL como `https://prediseno-ptar.vercel.app`, ya con la página
y la función funcionando juntas.

## Paso 3 — Capturar los leads (Formspree, gratis, sin código)

1. Cree una cuenta gratis en formspree.io
2. Cree un formulario nuevo — le da un endpoint tipo `https://formspree.io/f/xxxxxxx`
3. Pegue esa URL en `LEAD_FORM_URL`, dentro de `src/App.jsx`
4. Cada persona que use la herramienta le llegará a su correo automáticamente

## Paso 4 — Configurar su número de WhatsApp (sin exponerlo en el código)

El número NO va en ningún archivo — vive como variable de entorno en Vercel, así nunca
aparece en el código fuente ni en la URL que ve el usuario:

1. En el proyecto en Vercel, vaya a "Settings" → "Environment Variables"
2. Cree una variable: nombre `WHATSAPP_NUMBER`, valor su número en formato internacional
   sin `+` ni espacios (ej. `573001234567`)
3. Guarde y, en la pestaña "Deployments", use "Redeploy" en el último despliegue para que
   tome la variable nueva

El botón "Agendar revisión" y el código QR seguirán funcionando igual — ahora apuntan a una
función propia (`/api/chat`) que arma el enlace de WhatsApp en el servidor.

## Paso 5 — Configurar los dos informes de pago

Ahora hay dos niveles, cada uno con su propio link de pago:

1. Cree una cuenta gratis en Wompi (wompi.co) o Bold (bold.co)
2. Cree **dos** links de pago:
   - Informe 1: $10.000 COP, redirección a `https://SU-SITIO.vercel.app/?pagado=basico`
   - Informe 2: $250.000 COP, redirección a `https://SU-SITIO.vercel.app/?pagado=completo`
3. Pegue cada URL en `PAYMENT_LINK_BASICO` y `PAYMENT_LINK_COMPLETO`, dentro de `src/App.jsx`

**Importante — cómo funciona la protección, y su límite real:**
Cuando alguien paga, Wompi/Bold lo redirige de vuelta a su sitio con `?pagado=basico` o
`?pagado=completo` en la URL, y ahí se desbloquea el nivel correspondiente. Es simple y
funciona bien para validar el producto, pero técnicamente alguien que conozca el parámetro
podría escribirlo a mano y ver cualquiera de los dos informes sin pagar — no hay verificación
real de que el pago ocurrió. Para el volumen inicial este riesgo es bajo y aceptable. Si más
adelante el volumen de ventas lo justifica, el siguiente paso es verificar el pago del lado
del servidor usando el webhook de eventos de Wompi.



En el proyecto de Vercel, vaya a "Settings" → "Domains" y agregue un subdominio de su página,
por ejemplo `prediseno.suweb.com`. Vercel le da un registro DNS para pegar en el proveedor de
su dominio. Así la herramienta queda bajo su propia marca, no bajo `vercel.app`.

## Desarrollo local (opcional, para probar antes de publicar)

```
npm install
npm run dev
```
