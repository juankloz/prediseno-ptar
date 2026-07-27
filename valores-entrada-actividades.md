# Valores típicos de entrada por actividad (73 actividades)

Estos son los valores de **entrada** (agua residual cruda, antes de tratamiento) que usa la
herramienta cuando el usuario NO tiene datos de laboratorio propios. Unidades: DQO, DBO5, SST,
GyA en mg/L; pH en unidades de pH.

**Confianza:**
- **Literatura específica** (22 actividades): valor tomado de literatura de caracterización de
  ese proceso en particular (ej. POME de palma, aguas mieles de café, lixiviados de relleno
  sanitario) — mayor confianza.
- **Estimación genérica** ⚠ (51 actividades): calculada como el límite normativo de esa
  actividad × 2.5, un supuesto genérico sin literatura específica del proceso — **confianza
  baja, revisar con prioridad** antes de usar comercialmente para esa actividad.

Estos valores viven en `api/prediseno.js` (ACTIVITY_PROFILES) y en `src/App.jsx` (misma
estructura, duplicada para la vista previa del formulario). Si corrige un valor, debe
actualizarlo en ambos archivos.

| Actividad | pH | DQO | DBO5 | SST | GyA | Confianza |
|---|---|---|---|---|---|---|
| Doméstico / residencial | 7 | 500 | 250 | 250 | 80 | Literatura específica |
| Agroindustria — hortalizas, frutas, legumbres, raíces y tubérculos | 7 | 450 | 200 | 300 | 30 | Estimación genérica ⚠ |
| Agroindustria — beneficio de café (proceso ecológico) | 4.5 | 20,000 | 10,000 | 3,000 | 50 | Literatura específica |
| Agroindustria — beneficio de café (proceso tradicional) | 5.5 | 5,000 | 2,500 | 800 | 30 | Literatura específica |
| Agroindustria — poscosecha de plátano y banano | 7 | 400 | 150 | 200 | 20 | Estimación genérica ⚠ |
| Agroindustria — producción de azúcar y derivados de caña | 5 | 6,000 | 3,000 | 1,000 | 40 | Literatura específica |
| Agroindustria — extracción de aceites de origen vegetal (palma) | 4.5 | 50,000 | 25,000 | 18,000 | 6,000 | Literatura específica |
| Ganadería — bovino/bufalino/equino/ovino/caprino (cría) | 7 | 2,000 | 1,000 | 600 | 60 | Literatura específica |
| Ganadería — bovino/bufalino/equino/ovino/caprino (beneficio) | 7 | 6,000 | 3,000 | 1,500 | 600 | Literatura específica |
| Ganadería — porcinos (cría) | 7 | 8,000 | 4,000 | 2,000 | 100 | Literatura específica |
| Ganadería — porcinos (beneficio) | 7 | 6,000 | 3,000 | 1,500 | 400 | Literatura específica |
| Ganadería — bovinos y porcinos (beneficio dual) | 7 | 6,000 | 3,000 | 1,600 | 500 | Literatura específica |
| Ganadería — aves de corral (incubación y cría) | 7 | 1,500 | 700 | 500 | 60 | Literatura específica |
| Ganadería — aves de corral (beneficio) | 7 | 4,000 | 2,000 | 800 | 300 | Literatura específica |
| Minería — extracción de carbón de piedra y lignito | 7 | 400 | 150 | 300 | 30 | Estimación genérica ⚠ |
| Minería — extracción de minerales de hierro | 7 | 400 | 150 | 300 | 30 | Estimación genérica ⚠ |
| Minería — extracción de oro y otros metales preciosos | 7 | 400 | 150 | 400 | 30 | Estimación genérica ⚠ |
| Minería — extracción de minerales de níquel y otros no ferrosos | 7 | 400 | 150 | 300 | 30 | Estimación genérica ⚠ |
| Minería — extracción de otras minas y canteras | 7 | 400 | 150 | 300 | 30 | Estimación genérica ⚠ |
| Hidrocarburos — exploración (upstream) | 7 | 1,200 | 500 | 200 | 100 | Literatura específica |
| Hidrocarburos — producción (upstream) | 7 | 600 | 200 | 150 | 80 | Literatura específica |
| Hidrocarburos — refino | 7 | 1,200 | 500 | 200 | 100 | Literatura específica |
| Hidrocarburos — venta y distribución (downstream) | 7 | 600 | 200 | 150 | 80 | Literatura específica |
| Hidrocarburos — transporte y almacenamiento (midstream) | 7 | 600 | 200 | 150 | 80 | Literatura específica |
| Alimentos — elaboración de productos alimenticios (general) | 7 | 1,800 | 1,200 | 600 | 60 | Literatura específica |
| Alimentos — alimentos preparados para animales | 7 | 600 | 300 | 150 | 30 | Estimación genérica ⚠ |
| Alimentos — elaboración de maltas y cervezas | 6 | 4,000 | 2,000 | 300 | 30 | Literatura específica |
| Alimentos — bebidas no alcohólicas, aguas minerales y embotelladas | 6.5 | 1,200 | 600 | 150 | 60 | Estimación genérica ⚠ |
| Alimentos — elaboración de productos lácteos | 6 | 5,000 | 2,500 | 1,200 | 800 | Literatura específica |
| Alimentos — aceites y grasas de origen animal y vegetal | 6.5 | 3,000 | 1,600 | 900 | 200 | Literatura específica |
| Alimentos — elaboración de café soluble | 6 | 5,000 | 3,000 | 1,200 | 90 | Estimación genérica ⚠ |
| Fabricación — productos derivados del tabaco | 7 | 1,000 | 500 | 500 | 50 | Estimación genérica ⚠ |
| Fabricación — productos textiles | 7 | 1,000 | 500 | 125 | 50 | Estimación genérica ⚠ |
| Fabricación — artículos de piel, curtido y adobo de pieles | 7 | 3,000 | 1,500 | 1,500 | 150 | Estimación genérica ⚠ |
| Fabricación — gases industriales y medicinales | 7 | 750 | 500 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — papel y cartón (pulpa blanqueada, plantas integradas) | 7 | 1,375 | 750 | 625 | 50 | Estimación genérica ⚠ |
| Fabricación — papel y cartón a partir de fibras recicladas | 7 | 2,000 | 1,000 | 1,000 | 100 | Estimación genérica ⚠ |
| Fabricación — abonos y compuestos inorgánicos nitrogenados | 7 | 500 | 250 | 250 | 25 | Estimación genérica ⚠ |
| Fabricación — sustancias y productos químicos (general) | 7 | 2,000 | 1,500 | 500 | 62 | Estimación genérica ⚠ |
| Fabricación — pigmentos inorgánicos (azul ultramar) | 7 | 1,250 | 500 | 500 | 62 | Estimación genérica ⚠ |
| Fabricación — pigmentos inorgánicos (óxidos de hierro) | 7 | 1,250 | 500 | 500 | 62 | Estimación genérica ⚠ |
| Fabricación — pigmentos inorgánicos (cromatos y molibdatos de plomo) | 7 | 500 | 375 | 375 | 62 | Estimación genérica ⚠ |
| Fabricación — ácidos inorgánicos y sus sales | 7 | 450 | 125 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — plásticos en formas primarias/básicas y artículos plásticos | 7 | 750 | 312 | 200 | 50 | Estimación genérica ⚠ |
| Fabricación — sabores y fragancias | 7 | 1,500 | 750 | 175 | 25 | Estimación genérica ⚠ |
| Fabricación — surfactantes | 7 | 1,250 | 250 | 250 | 50 | Estimación genérica ⚠ |
| Fabricación — plaguicidas y otros químicos de uso agropecuario | 7 | 1,500 | 500 | 500 | 25 | Estimación genérica ⚠ |
| Fabricación — pinturas, barnices y revestimientos similares | 7 | 2,000 | 1,000 | 500 | 50 | Estimación genérica ⚠ |
| Fabricación — jabones, detergentes y productos cosméticos | 9 | 1,250 | 625 | 200 | 38 | Estimación genérica ⚠ |
| Fabricación — productos farmacéuticos y sustancias químicas medicinales | 7 | 1,000 | 375 | 125 | 38 | Estimación genérica ⚠ |
| Fabricación — vidrio, productos de vidrio, cemento, cal y yeso | 7 | 325 | 125 | 125 | 50 | Estimación genérica ⚠ |
| Fabricación — productos cerámicos | 7 | 250 | 125 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — artículos de hormigón, cemento y yeso | 7 | 500 | 250 | 250 | 50 | Estimación genérica ⚠ |
| Fabricación — tratamiento y revestimiento de metales | 7 | 625 | 250 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — pilas, baterías y acumuladores eléctricos | 7 | 250 | 125 | 125 | 38 | Estimación genérica ⚠ |
| Fabricación — equipos eléctricos de iluminación | 7 | 500 | 125 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — aparatos de uso doméstico | 7 | 400 | 200 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — maquinaria y equipos (recubrimientos electrolíticos) | 7 | 500 | 250 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — vehículos automotores, remolques y semirremolques | 7 | 750 | 250 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — autopartes | 7 | 1,000 | 500 | 250 | 75 | Estimación genérica ⚠ |
| Fabricación — siderurgia | 7 | 625 | 150 | 75 | 50 | Estimación genérica ⚠ |
| Fabricación — imprentas y litografías | 7 | 500 | 250 | 125 | 25 | Estimación genérica ⚠ |
| Fabricación — bebidas alcohólicas destiladas | 6 | 7,500 | 3,750 | 750 | 75 | Estimación genérica ⚠ |
| Fabricación — mezcla-formulación de bebidas alcohólicas | 7 | 1,250 | 500 | 500 | 50 | Estimación genérica ⚠ |
| Fabricación — producción y fabricación de derivados de caucho | 7 | 625 | 125 | 125 | 25 | Estimación genérica ⚠ |
| Servicios — generación de energía eléctrica | 7 | 500 | 350 | 250 | 50 | Estimación genérica ⚠ |
| Servicios — tratamiento y disposición de residuos (lixiviados) | 7.5 | 20,000 | 8,000 | 1,000 | 100 | Literatura específica |
| Servicios — reciclaje de materiales plásticos y similares | 7 | 1,200 | 500 | 500 | 50 | Estimación genérica ⚠ |
| Servicios — reciclaje de tambores | 7 | 2,500 | 1,500 | 400 | 60 | Estimación genérica ⚠ |
| Servicios — atención a la salud humana (con o sin internación) | 7 | 500 | 350 | 150 | 25 | Estimación genérica ⚠ |
| Servicios — atención a la salud (hemodiálisis y diálisis peritoneal) | 7 | 1,800 | 1,400 | 250 | 25 | Estimación genérica ⚠ |
| Servicios — pompas fúnebres y actividades relacionadas | 7 | 1,400 | 600 | 250 | 50 | Estimación genérica ⚠ |
| Otra actividad no contemplada en los sectores anteriores | 7 | 375 | 125 | 125 | 25 | Estimación genérica ⚠ |
