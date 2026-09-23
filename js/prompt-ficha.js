(function () {
  var REGLAS =
    "Necesito UNA sola actividad escolar imprimible, en UN solo archivo HTML.\n" +
    "\n" +
    "Es para el aula de Lilian Coria. Se va a publicar en una web y se imprime o guarda como PDF desde el navegador.\n" +
    "\n" +
    "REGLAS OBLIGATORIAS:\n" +
    "\n" +
    "1. Un solo archivo: ficha.html. Sin CSS, JS ni imágenes afuera.\n" +
    "2. Completo: <!DOCTYPE html>, lang=\"es\", charset UTF-8, viewport.\n" +
    "3. Estilos y scripts adentro del HTML. Dibujos en SVG inline. Nada de fotos por URL, nada de carpetas, nada de React ni librerías.\n" +
    "4. Cada hoja es A4: class=\"page\", width 210mm, min-height 297mm.\n" +
    "5. Pueden ser las páginas que hagan falta (2, 5, 8, 12…). Cada ejercicio que no entre, va en otra .page. Nunca desbordar una hoja.\n" +
    "6. Textos en español, MAYÚSCULAS, para chicos. Tipografía Fredoka + Nunito (Google Fonts).\n" +
    "7. Colores: azul #2b6cb0, azul oscuro #1a4f8b, tinta #1f2a37, fondo hoja #fffef9.\n" +
    "8. Estructura:\n" +
    "   - barra arriba (.toolbar) con VOLVER AL AULA (href=\"./\") e IMPRIMIR / PDF (window.print())\n" +
    "   - un div.vista > div.hojas\n" +
    "   - adentro, cada hoja: <section class=\"page\">\n" +
    "9. Incluir este CSS de impresión:\n" +
    "   @page { size: A4 portrait; margin: 0; }\n" +
    "   al imprimir: ocultar la toolbar, sacar sombras y márgenes de .page, cada .page = 210mm x 297mm, overflow hidden, page-break-after: always.\n" +
    "   La última hoja: page-break-after: auto.\n" +
    "10. En pantalla, la ficha se tiene que ajustar al ancho del celular (escalar .hojas al ancho de la ventana y centrarla). Al imprimir, soltar esa escala. Si se abre el diálogo de imprimir, no volver a aplicar la escala.\n" +
    "11. Pie de página adentro de cada hoja (.pie), no colgando afuera.\n" +
    "12. Si hay clave de respuestas, que sea la última hoja y diga que es solo para la docente.\n" +
    "13. No inventar páginas de más. Que entre todo sin cortar renglones ni mandar el pie a otra hoja.\n" +
    "14. En el <title> y en un comentario al inicio, poner: título, grado, área y cantidad de páginas.\n" +
    "15. La respuesta tiene que ser SOLO el HTML. Nada de Python, nada de from pathlib, nada de Path, nada de html = r''' ... ''', nada de scripts para guardar el archivo, nada de /mnt/data/.\n" +
    "16. El primer renglón tiene que ser <!DOCTYPE html> y el último </html>. Sin texto antes ni después del código.\n" +
    "17. No lo envuelvas en un recuadro de otro lenguaje. Es un archivo HTML para copiar y guardar como ficha.html.\n" +
    "\n" +
    "Después del HTML, en un mensaje aparte, decime en una lista:\n" +
    "- Título\n" +
    "- Grado\n" +
    "- Área\n" +
    "- Cantidad de páginas\n" +
    "- Qué incluye cada hoja\n" +
    "\n" +
    "Actividad que quiero:\n" +
    "(Reemplazá la línea de abajo, sacá los corchetes. No escribas adentro.)\n" +
    "\n" +
    "[vacío]";

  window.AulaPrompt = {
    reglas: REGLAS,
    armar: function () {
      return REGLAS + "\n";
    },
    copiar: function (texto) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texto);
      }
      return new Promise(function (ok, mal) {
        var caja = document.createElement("textarea");
        caja.value = texto;
        caja.setAttribute("readonly", "");
        caja.style.position = "fixed";
        caja.style.left = "-9999px";
        document.body.appendChild(caja);
        caja.select();
        try {
          document.execCommand("copy");
          ok();
        } catch (e) {
          mal(e);
        }
        document.body.removeChild(caja);
      });
    }
  };
})();
