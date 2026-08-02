select 'profiles' as elemento, count(*) as registros from public.ptar_profiles
union all select 'projects', count(*) from public.ptar_projects
union all select 'products', count(*) from public.ptar_products
union all select 'orders', count(*) from public.ptar_orders
union all select 'entitlements', count(*) from public.ptar_entitlements
union all select 'calculation_runs', count(*) from public.ptar_calculation_runs;

select code, name, amount_in_cents, active, payment_enabled
from public.ptar_products
order by amount_in_cents;
