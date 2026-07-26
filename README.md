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

## Opcional — usar su propio dominio (la página que ya tiene)

En el proyecto de Vercel, vaya a "Settings" → "Domains" y agregue un subdominio de su página,
por ejemplo `prediseno.suweb.com`. Vercel le da un registro DNS para pegar en el proveedor de
su dominio. Así la herramienta queda bajo su propia marca, no bajo `vercel.app`.

## Desarrollo local (opcional, para probar antes de publicar)

```
npm install
npm run dev
```
