---
name: author-svg-walkthrough
description: Design, create, revise or migrate interactive Python Tutor lesson walkthroughs authored as SVG graphics and JSON steps, with optional Python code or output.
---

# Crear un recorrido SVG

1. Formula qué debe poder explicar el estudiante después del recorrido. Define el estado inicial, el cambio que ocurre en cada paso y el resultado. Usa un escenario si hay un solo camino. Si dos entradas enseñan comportamientos distintos, define un escenario por entrada y reutiliza el dibujo cuando compartan estructura. Incluye un límite si cambia cómo se interpreta la regla, como `24` en `>= 24`.
2. Elige si el lector necesita seguir líneas de Python. Usa `"code": true` y `topic.example` si el código explica el cambio. Omite `code` si el gráfico basta. Escribe una explicación por paso que comunique el cambio, también cuando el lector acceda al contenido sin ver el dibujo.
3. Dibuja cada escena en `content/walkthroughs/graphics/<slug>.svg`. Usa un `viewBox` ajustado y comprueba la legibilidad a 390 px. Agrupa cada bloque o flecha que pueda cambiar con un `data-part` único. Aplica los estilos del sitio mediante `data-style`. Dibuja una flecha con un conector y una punta dentro del mismo grupo. Consulta [el contrato](../../../docs/contract.md#recorridos-svg) para el vocabulario de estilos y los atributos admitidos.
4. Escribe `content/walkthroughs/<slug>.json` y apunta `topic.walkthrough` a `walkthroughs/<slug>.json`. Describe cada paso a partir de la escena base: repite en `show` lo que deba seguir visible y escribe en `output` toda la salida que deba verse en ese paso. Verifica que la línea y los IDs existan en el código y el gráfico de ese escenario.
5. Ejecuta `npm run build` y `npm run check`. Abre el tema en la vista previa del editor con `npm run editor`, usando `PYTHON_TUTOR_DIR` si el checkout de la app está en otra ruta. Comprueba cada estado en ambos sentidos, reinicia y cambia de escenario desde el último paso. Da por terminada la autoría cuando el texto, la línea, las flechas y los elementos visibles cuenten el mismo cambio.

Usa [Condicionales](../../../content/walkthroughs/condicionales-svg.json) como referencia de código y escenarios compartidos. Usa [Crecimiento de un arreglo](../../../content/walkthroughs/crecimiento-arreglo.json) como referencia de gráfico sin código y capas que aparecen o desaparecen. Es un modelo didáctico de capacidad.
