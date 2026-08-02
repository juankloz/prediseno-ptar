# Fase 1 — Supabase independiente y acceso seguro

Esta versión realiza cuatro cambios principales:

1. elimina por completo el acceso mediante `?pagado=basico` o `?pagado=completo`;
2. añade acceso por correo con Supabase Auth;
3. guarda cada proyecto bajo el usuario autenticado;
4. el API solo devuelve información premium cuando existe un permiso activo para ese proyecto.

Los pagos permanecen desactivados hasta integrar Wompi con orden y webhook.

## 1. Ejecutar el esquema

En el nuevo proyecto Supabase:

```text
SQL Editor → New query
```

Ejecute completo:

```text
supabase/01_esquema_seguro_ptar.sql
```

Después ejecute:

```text
supabase/03_verificar_instalacion.sql
```

Debe mostrar dos productos y `payment_enabled = false`.

## 2. Configurar Authentication

```text
Authentication → URL Configuration
```

Site URL:

```text
https://prediseno-ptar.vercel.app
```

Redirect URLs:

```text
https://prediseno-ptar.vercel.app/**
http://localhost:5173/**
```

En Email provider deje habilitado el registro por correo.

## 3. Variables de Vercel

En el proyecto Vercel abra:

```text
Settings → Environment Variables
```

Cree en Production, Preview y Development:

```text
VITE_SUPABASE_URL=https://vnqavcgpjwqjobvceajf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qHxQSd-TP8LwppTWtizRdg_TXdjuA7S
SUPABASE_URL=https://vnqavcgpjwqjobvceajf.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_qHxQSd-TP8LwppTWtizRdg_TXdjuA7S
```

No configure todavía `SUPABASE_SECRET_KEY` ni claves Wompi.

## 4. Publicar

Reemplace el contenido del repositorio `prediseno-ptar` por esta versión o copie los archivos modificados. Después haga commit y espere el despliegue de Vercel.

## 5. Prueba

1. Abra la aplicación.
2. Solicite el enlace de acceso con el correo del propietario del proyecto.
3. Regrese desde el correo.
4. Complete los datos y pulse `Ver mi esquema`.
5. La barra superior debe mostrar un identificador de proyecto.
6. En Supabase revise `Table Editor → ptar_projects` y `ptar_calculation_runs`.
7. La vista debe permanecer gratuita y no mostrar CAPEX ni memorias.

## 6. Otorgar acceso completo de prueba

Cuando el usuario ya haya iniciado sesión y guardado el proyecto, ejecute:

```text
supabase/02_otorgar_acceso_prueba.sql
```

Luego vuelva a calcular. La respuesta del API debe incluir `access.tier = complete` y aparecerá el informe completo.

## 7. Seguridad

- La clave publicable incluida en el frontend es pública por diseño.
- No comparta ni agregue al repositorio una clave `sb_secret_`.
- No active los botones de pago todavía.
- Convierta el repositorio en privado antes de comercializar el motor.
