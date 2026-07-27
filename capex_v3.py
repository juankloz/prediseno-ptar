import numpy as np
from scipy.optimize import curve_fit

# Baseline: HRT de diseño original (horas -> dias) y eficiencia tipica de literatura a ese HRT,
# usados para RECALIBRAR k de modo que el modelo cinetico sea consistente con reactores de alta tasa.
BASELINE = {
    "uasb_alta":  {"hrt_h": 8, "e_lit": 0.70, "H": 5.0, "geom":"cil"},
    "rafa_media": {"hrt_h": 5, "e_lit": 0.55, "H": 4.0, "geom":"cil"},
    "aerobio":    {"hrt_h": 8, "e_lit": 0.85, "H": 3.0, "geom":"rect"},
    "fafa":       {"hrt_h": 4, "e_lit": 0.75, "H": 2.5, "geom":"cil"},
}

K_NUEVO = {}
for tipo, b in BASELINE.items():
    theta_d = b["hrt_h"]/24
    e = b["e_lit"]
    k = e/(theta_d*(1-e))
    K_NUEVO[tipo] = k
    print(f"{tipo:12s} k recalibrado = {k:.2f} /dia  (verificacion: theta a E={e} -> {e/(k*(1-e))*24:.1f} h, esperado {b['hrt_h']} h)")

COSTO_M2 = 500000
def area_de_volumen(V, h, geom):
    if geom == "rect":
        W = np.sqrt((V/h)/2); L = 2*W
        return (V/h) + 2*h*(L+W)
    else:
        D = np.sqrt(4*(V/h)/np.pi)
        return np.pi*D*h + 2*(np.pi*D**2/4)

def costo_unidad(tipo, Q_Ls, E):
    b = BASELINE[tipo]
    E = min(E, 0.97)
    theta = E/(K_NUEVO[tipo]*(1-E))
    Q_m3d = Q_Ls*86.4
    V = Q_m3d*theta
    area = area_de_volumen(V, b["H"], b["geom"])
    return area*COSTO_M2

Qs = np.arange(5,105,5)
Es = np.arange(0.20,0.96,0.04)

def modelo(X,a,b,c):
    Q,E = X
    return a*np.power(Q,b)*np.power(E/(1-E), c)

print()
resultados = {}
for tipo in BASELINE:
    Qg,Eg = np.meshgrid(Qs,Es)
    Qf,Ef = Qg.flatten(), Eg.flatten()
    costos = np.array([costo_unidad(tipo,q,e) for q,e in zip(Qf,Ef)])
    popt,_ = curve_fit(modelo,(Qf,Ef),costos,p0=[1e6,0.8,0.5],maxfev=20000)
    pred = modelo((Qf,Ef),*popt)
    r2 = 1-np.sum((costos-pred)**2)/np.sum((costos-np.mean(costos))**2)
    resultados[tipo] = {"a":popt[0],"b":popt[1],"c":popt[2],"r2":r2,"k":K_NUEVO[tipo]}
    print(f"{tipo:12s} a={popt[0]:>14,.0f}  b={popt[1]:.3f}  c={popt[2]:.3f}  R2={r2:.5f}")

print()
print("--- Verificacion de sanidad: costo a Q=20 L/s en la E de literatura (deberia ser razonable, decenas-cientos de millones) ---")
for tipo,b in BASELINE.items():
    c = costo_unidad(tipo, 20, b["e_lit"])
    print(f"{tipo:12s} Q=20 L/s, E={b['e_lit']}: costo = ${c:,.0f} COP")

import json
with open("equations_v3.json","w") as f:
    json.dump(resultados, f, indent=2)
