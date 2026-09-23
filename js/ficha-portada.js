(function () {
  function esc(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function lineas(valor) {
    if (Array.isArray(valor)) {
      return valor.map(function (item) { return String(item || "").trim(); }).filter(Boolean);
    }
    return String(valor || "").split(/\r?\n/).map(function (item) {
      return item.replace(/^[-•]\s*/, "").trim();
    }).filter(Boolean);
  }

  function chips(item) {
    var lista = [item.grado, item.area];
    if (item.paginas) lista.push(item.paginas + " páginas");
    lista.push(item.tipo === "Archivo" ? "Archivo" : "Imprimible");
    return lista.filter(Boolean).map(function (chip) {
      return '<span class="chip">' + esc(chip) + "</span>";
    }).join(" ");
  }

  function botones(item, opts) {
    opts = opts || {};
    if (opts.sinBotones) {
      var etiqueta = item.tipo === "Archivo" ? "Descargar el archivo" : "Abrir e imprimir la ficha";
      return '<div class="acciones">' +
        '<span class="btn btn-terra">' + etiqueta + "</span>" +
        '<span class="btn btn-ghost">Volver al listado</span>' +
        "</div>";
    }
    var esHtml = item.tipo !== "Archivo";
    var hrefFicha = esHtml
      ? ("abrir.html?id=" + encodeURIComponent(item.id || "") + (item.driveFileId ? "&file=" + encodeURIComponent(item.driveFileId) : ""))
      : "";
    var abrir = esHtml
      ? '<a class="btn btn-terra" href="' + esc(hrefFicha) + '">Abrir e imprimir la ficha</a>'
      : "";
    var bajar = !esHtml && item.enlaceBajar
      ? '<a class="btn btn-terra" href="' + esc(item.enlaceBajar) + '">Descargar el archivo</a>'
      : "";
    return '<div class="acciones">' + abrir + bajar +
      '<a class="btn btn-ghost" href="./">Volver al listado</a></div>';
  }

  window.AulaPortada = {
    EJEMPLO: {
      kicker: "Después de leer",
      titulo: "La tortilla de papas",
      resumen: "Actividades para primer grado a partir del cuento de Sandra Siemens y Claudia Degliuomini. Letras iniciales, escritura de nombres, y un crucigrama que pide atender el género y el número.",
      grado: "1.º",
      area: "Prácticas del Lenguaje",
      paginas: 8,
      tipo: "Ficha HTML",
      incluye: [
        "Ocho tarjetas para redondear lo que empieza con T, N, L, A, P, S, H y M.",
        "Completar nombres: sílaba inicial, sílaba final o consonantes.",
        "Escritura de lo que compró Sebastiana, al modo de EyA, páginas 166 y 167.",
        "Crucigrama con imágenes y pistas.",
        "Clave de respuestas, solo para la docente."
      ],
      uso: "Abrir la ficha, imprimir las hojas o guardarlas como PDF desde el navegador. La última página no se entrega a los chicos.",
      notaKicker: "Cuento de partida",
      notaTitulo: "Sebastiana y Nicolasa",
      notaTexto: "Las propuestas siguen las compras, los nombres y las palabras del cuento: tomates, naranjas, lirios, aceitunas, panes, papas, huevos y mesa.",
      docente: "Lilian Coria"
    },

    lineas: lineas,

    cabeza: function (item) {
      return '<p class="eyebrow">' + esc(item.kicker || item.tipo || "Actividad") + "</p>" +
        "<h1>" + esc(item.titulo || "Sin título") + "</h1>" +
        "<p>" + esc(item.resumen || "") + "</p>" +
        "<p>" + chips(item) + "</p>";
    },

    cuerpo: function (item, opts) {
      opts = opts || {};
      var items = lineas(item.incluye);
      var lista = items.length
        ? '<ul class="lista-incluida">' + items.map(function (li) {
          return "<li>" + esc(li) + "</li>";
        }).join("") + "</ul>"
        : "<p>Todavía no se cargó qué incluye.</p>";
      var uso = item.uso || (item.tipo === "Archivo"
        ? "Descargá el Word, PowerPoint o PDF y usalo en clase."
        : "Abrir la ficha, imprimir las hojas o guardarlas como PDF desde el navegador.");
      var notaKicker = item.notaKicker || "Nota";
      var notaTitulo = item.notaTitulo || "";
      var notaTexto = item.notaTexto || "";
      var docente = item.docente || "Lilian Coria";
      return '<div class="card-uso">' +
        "<h2>Qué incluye</h2>" + lista +
        "<h2>Cómo usarla</h2>" +
        "<p>" + esc(uso) + "</p>" +
        botones(item, opts) +
        "</div>" +
        '<aside class="aside-box">' +
        '<p class="eyebrow" style="color:#9ee8f5">' + esc(notaKicker) + "</p>" +
        (notaTitulo ? "<h2>" + esc(notaTitulo) + "</h2>" : "") +
        (notaTexto ? "<p>" + esc(notaTexto) + "</p>" : "") +
        "<p>Docente: " + esc(docente) + ".</p>" +
        "</aside>";
    }
  };
})();
