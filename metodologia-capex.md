# Metodología de costeo (CAPEX) por unidad

Este documento explica cómo se llegó a la ecuación **costo = a · Q^b** (Q en L/s) que usa
`api/prediseno.js` para cada unidad de tratamiento. El script que genera estas ecuaciones está
en `capex_model.py` (no se despliega, es solo el cálculo que se hizo una vez).

## Metodología, paso a paso

1. Para cada unidad, se asumió un **criterio de diseño típico** (tiempo de retención hidráulica
   en horas, o carga superficial en m³/m²·h) tomado de literatura general (Metcalf & Eddy y
   referencias similares) — **no de su experiencia de campo en Casanare**.
2. Con ese criterio se calculó el volumen o área en planta necesaria para caudales de 5 a
   100 L/s, cada 5 L/s.
3. Se asumió una geometría (rectangular sin techo, o cilíndrica con techo para reactores
   anaerobios cerrados) para convertir esa área en planta a **área superficial fabricada** real
   (paredes + fondo, en m² de PRFV).
4. Esa área se multiplicó por su cifra de **$500.000 COP/m²** para obtener el costo en cada
   punto de caudal.
5. Con esos 20 puntos (costo vs. caudal) se ajustó una regresión potencial `costo = a·Q^b` y,
   para comparar, una logarítmica `costo = a·ln(Q)+b`. La potencial ganó claramente en las 13
   unidades (R² > 0.999 vs. ~0.89–0.92 de la logarítmica), consistente con la teoría de
   economías de escala en plantas de tratamiento (la conocida "regla de 0.6").

## Tabla de criterios asumidos — REVISAR Y AJUSTAR

| Unidad | Criterio | Valor asumido | Profundidad (H) | Geometría |
|---|---|---|---|---|
| Cribado / rejillas | HRT | 0.05 h | 0.6 m | Rectangular |
| Desarenador | Carga superficial | 29.2 m³/m²·h | 1.0 m | Rectangular |
| Trampa de grasas | HRT | 0.5 h | 1.2 m | Rectangular |
| DAF | Carga superficial | 5.0 m³/m²·h | 2.0 m | Rectangular |
| Ajuste de pH | HRT | 0.25 h | 1.5 m | Rectangular |
| Sedimentación primaria / Imhoff | Carga superficial | 1.5 m³/m²·h | 3.0 m | Rectangular |
| UASB / laguna anaerobia (alta carga) | HRT | 8.0 h | 5.0 m | Cilíndrica, con techo |
| Aerobio (lodos activados / facultativa) | HRT | 8.0 h | 3.0 m | Rectangular |
| RAFA / UASB (carga media) | HRT | 5.0 h | 4.0 m | Cilíndrica, con techo |
| Filtro percolador / humedal | Carga superficial | 1.0 m³/m²·h | 1.5 m | Rectangular |
| FAFA | HRT | 4.0 h | 2.5 m | Cilíndrica, con techo |
| Desinfección | HRT | 0.5 h | 1.2 m | Rectangular |
| Filtración final | Carga superficial | 5.0 m³/m²·h | 2.0 m | Rectangular |

**Geometría rectangular**: relación largo:ancho de 2:1, sin techo (tanques abiertos).
**Geometría cilíndrica**: incluye techo (reactores anaerobios normalmente cerrados para
captura de biogás).

## Cómo corregir un criterio

1. Abra `capex_model.py`
2. Cambie el valor de `"valor"` (y/o `"H"`) de la unidad que quiera corregir, en el
   diccionario `UNIDADES`
3. Ejecute el script (`python3 capex_model.py`, requiere `numpy` y `scipy`)
4. Copie los nuevos valores de `a` y `b` que imprime, y actualícelos en `COST_PARAMS`
   dentro de `api/prediseno.js`

## Actualización — modelo de eficiencia de remoción (versión 2)

El CAPEX ya no depende solo del caudal. Para el reactor UASB (alta carga), RAFA (carga media),
tratamiento aerobio y FAFA, el costo también depende de la **eficiencia de remoción de DBO5
requerida** para cumplir la norma, calculada como:

```
E_total = 1 − (límite normativo DBO5 / DBO5 de entrada)
```

Esa eficiencia se reparte entre las etapas del tren (30% en sedimentación primaria, 65% o 55%
en la primera etapa biológica según la carga, y el resto en la segunda etapa), y de ahí se
deriva un tiempo de retención vía cinética de primer orden `θ = E/(k(1−E))`, calibrada para que
a la eficiencia típica de literatura el tiempo coincida con el HRT real de diseño (horas, no
días — ver `capex_v3.py` para el detalle de la recalibración).

El **filtro percolador/humedal** NO usa este modelo — se dimensiona por carga hidráulica
superficial y su costo depende solo del caudal, igual que antes.

Como el DBO5 de entrada puede venir del valor típico por actividad O del dato real que el
cliente reporte, la eficiencia (y por tanto el costo) se recalcula automáticamente según cuál
esté vigente — sin necesitar ningún cambio adicional en la lógica.

## Limitaciones que debe tener presentes


- El costo cubre **solo la estructura en PRFV** — no incluye equipos electromecánicos
  (bombas, sopladores, agitadores), instrumentación, obra civil de soporte, ni instalación.
  Para un CAPEX real completo, estos rubros deben sumarse aparte.
- El margen de ±25-30% alrededor del valor puntual (visible como rango mín-máx en el reporte)
  es una holgura genérica de estimación de orden de magnitud, no un análisis de incertidumbre
  estadístico.
- La geometría y los criterios son simplificaciones razonables para un anteproyecto, no
  sustituyen el dimensionamiento detallado que usted hace en el diseño completo.
