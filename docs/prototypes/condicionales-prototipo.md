# Decidir con `if` y `else`

`if` comprueba una condición. Si es verdadera, Python ejecuta el bloque con sangría que sigue a `if`. Si es falsa, ejecuta el bloque de `else`.

```python
temperatura = 25
if temperatura >= 24:
    print("Hace calor")
else:
    print("Hace fresco")
```

[Explorar los casos de temperatura](../../content/walkthroughs/condicionales-svg.json)

Con 25 o 24 se muestra `Hace calor`. Con 23 se muestra `Hace fresco`.

> [!NOTE]
> El operador `>=` incluye el valor del límite.
