# Cómo crear una ficha HTML para el Aula Lilian Coria

Este texto se le pega a ChatGPT (o a otro asistente) para que arme una actividad en un solo archivo HTML. Ese archivo se puede publicar en el aula, abrir en el navegador e imprimir o guardar como PDF.

Las fichas no tienen un número fijo de páginas. Pueden ser 1, 3, 8 o las que hagan falta.

Hay dos tipos de material en el aula:

1. **Ficha HTML** — se abre, se ve y se imprime / PDF. Este documento es para esa.
2. **Archivo ya hecho** (Word, PowerPoint, PDF) — se ve la info, una vista previa y se descarga. No usa estas reglas.

---

## Cómo usarlo

1. Copiá el recuadro **Prompt para pegar**.
2. Al final, en “Actividad que quiero”, escribí el tema, el grado, las consignas, las palabras y los dibujos.
3. Pedile que te entregue **solo el HTML**, sin Python ni código para guardar archivos. Copiá desde `<!DOCTYPE html>` hasta `</html>` y guardalo como `ficha.html`.
4. Abrilo en el navegador, probá **Imprimir / PDF** y mirá que no se corte ninguna hoja.
5. Si está bien, se publica en el aula.

Si algo falla (se corta al imprimir, no entra en el celular, faltan dibujos), traé el HTML y se ajusta.

Se puede adjuntar *La tortilla de papas* (`actividades/la-tortilla-de-papas/ficha.html`) y decirle: “Usá este archivo como modelo de estructura y estilo.”

---

## Prompt para pegar

```
Necesito UNA sola actividad escolar imprimible, en UN solo archivo HTML.

Es para el aula de Lilian Coria. Se va a publicar en una web y se imprime o guarda como PDF desde el navegador.

REGLAS OBLIGATORIAS:

1. Un solo archivo: ficha.html. Sin CSS, JS ni imágenes afuera.
2. Completo: <!DOCTYPE html>, lang="es", charset UTF-8, viewport.
3. Estilos y scripts adentro del HTML. Dibujos en SVG inline. Nada de fotos por URL, nada de carpetas, nada de React ni librerías.
4. Cada hoja es A4: class="page", width 210mm, min-height 297mm.
5. Pueden ser las páginas que hagan falta (2, 5, 8, 12…). Cada ejercicio que no entre, va en otra .page. Nunca desbordar una hoja.
6. Textos en español, MAYÚSCULAS, para chicos. Tipografía Fredoka + Nunito (Google Fonts).
7. Colores: azul #2b6cb0, azul oscuro #1a4f8b, tinta #1f2a37, fondo hoja #fffef9.
8. Estructura:
   - barra arriba (.toolbar) con VOLVER AL AULA (href="./") e IMPRIMIR / PDF (window.print())
   - un div.vista > div.hojas
   - adentro, cada hoja: <section class="page">
9. Incluir este CSS de impresión:
   @page { size: A4 portrait; margin: 0; }
   al imprimir: ocultar la toolbar, sacar sombras y márgenes de .page, cada .page = 210mm x 297mm, overflow hidden, page-break-after: always.
   La última hoja: page-break-after: auto.
10. En pantalla, la ficha se tiene que ajustar al ancho del celular (escalar .hojas al ancho de la ventana y centrarla). Al imprimir, soltar esa escala. Si se abre el diálogo de imprimir, no volver a aplicar la escala.
11. Pie de página adentro de cada hoja (.pie), no colgando afuera.
12. Si hay clave de respuestas, que sea la última hoja y diga que es solo para la docente.
13. No inventar páginas de más. Que entre todo sin cortar renglones ni mandar el pie a otra hoja.
14. En el <title> y en un comentario al inicio, poner: título, grado, área y cantidad de páginas.
15. La respuesta tiene que ser SOLO el HTML. Nada de Python, nada de from pathlib, nada de Path, nada de html = r''' ... ''', nada de scripts para guardar el archivo, nada de /mnt/data/.
16. El primer renglón tiene que ser <!DOCTYPE html> y el último </html>. Sin texto antes ni después del código.
17. No lo envuelvas en un recuadro de otro lenguaje. Es un archivo HTML para copiar y guardar como ficha.html.

Después del HTML, en un mensaje aparte, decime en una lista:
- Título
- Grado
- Área
- Cantidad de páginas
- Qué incluye cada hoja

Actividad que quiero:
[acá escribís el tema, grado, consignas, palabras, dibujos]
```

---

## Ejemplo de pedido (lo que va abajo del prompt)

```
Primer grado. Prácticas del Lenguaje. Después de leer Caperucita.

Hojas que necesito:
- Portada con el título y espacio para nombre y fecha.
- Tarjetas: redondear lo que empieza con C (casa, capa, cesta) y un distractor.
- Completar el nombre LOBO (sílaba inicial) y CASA (sílaba final).
- Crucigrama corto con 4 palabras del cuento.
- Clave de respuestas para la docente.

Usá dibujos SVG simples. Que sean las páginas que hagan falta, ni una de más.
```

---

## Qué tiene que tener el archivo para publicarlo

- Un solo `ficha.html`.
- Barra con **Volver al aula** e **Imprimir / PDF**.
- Hojas `.page` de 210 mm × 297 mm.
- Impresión en A4, una sección = una hoja.
- Se ve completa en el celular, sin tener que achicar a mano.
- Datos para el catálogo: título, grado, área, cuántas páginas.

No hace falta que sean 8 páginas. *La tortilla de papas* tiene 8 porque esa actividad lo pide. La próxima puede tener 3 o 10.

---

## Si en vez de HTML ya tenés un Word o un PowerPoint

No uses este prompt. Eso se publica como archivo: se ve la información, una vista previa y se descarga. No se convierte a ficha HTML.
