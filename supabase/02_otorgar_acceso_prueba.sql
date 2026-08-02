-- EJECUTAR DESPUÉS DE QUE EL USUARIO INICIE SESIÓN Y GUARDE UN PROYECTO.
-- Cambie el correo y el nivel si es necesario.

select *
from public.admin_grant_ptar_test_access(
  'Juankloz75@hotmail.com',
  'complete'
);
