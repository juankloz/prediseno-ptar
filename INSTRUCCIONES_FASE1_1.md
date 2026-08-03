# Publicación de la Fase 1.1

Esta versión reemplaza la Fase 1 anterior.

## No requiere cambios en Supabase

No ejecutes SQL adicional. Se conservan:

- el proyecto Supabase independiente;
- las tablas y políticas RLS;
- las variables de Vercel;
- el SMTP configurado.

## Publicar en GitHub

1. Descomprime `prediseno-ptar-fase1-1.zip`.
2. Abre el repositorio `juankloz/prediseno-ptar`.
3. Reemplaza el contenido actual con el contenido interior de la carpeta.
4. Mensaje sugerido:

```text
Simplifica la vista previa y añade ejemplo del Informe 1
```

5. Confirma el commit.
6. Vercel iniciará un despliegue nuevo.
7. Al finalizar, recarga la aplicación con `Ctrl + F5`.

## Pruebas

### Sin iniciar sesión

- Completa la ficha técnica.
- Pulsa `Generar vista previa`.
- Debe mostrarse el tren conceptual.
- El proyecto no debe guardarse.

### Con sesión verificada

- Verifica el correo.
- Pulsa `Generar vista previa`.
- Debe mostrarse un código corto de proyecto.
- En Supabase debe existir el registro en `ptar_projects`.

### Ejemplo de Informe 1

- Genera una vista previa.
- Busca `Informe 1 — $10.000 COP`.
- Pulsa `Ver ejemplo del Informe 1`.
- Debe aparecer el resumen técnico y económico del caso ficticio.

Los botones de pago permanecen inactivos hasta completar la integración segura con Wompi.
