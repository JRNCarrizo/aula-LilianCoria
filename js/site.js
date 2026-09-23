(function () {
  var root = document.body.getAttribute("data-root") || "";
  var actividades = (window.AULA_ACTIVIDADES || []).slice();

  function extrasLocales() {
    try { return JSON.parse(localStorage.getItem("aula_publicaciones") || "[]"); }
    catch (e) { return []; }
  }

  function fusionar(lista) {
    var vistos = {};
    var salida = [];
    lista.concat(actividades).forEach(function (item) {
      if (!item || !item.id || vistos[item.id]) return;
      vistos[item.id] = true;
      salida.push(item);
    });
    actividades = salida;
  }

  function ordenarLista() {
    var ultimaId = "";
    try {
      var ultima = JSON.parse(localStorage.getItem("aula_ultima") || "null");
      if (ultima && ultima.id) ultimaId = ultima.id;
    } catch (e) {}
    var publicadas = [];
    var fijas = [];
    actividades.forEach(function (item) {
      if (item.origen === "drive" || item.driveFileId) publicadas.push(item);
      else fijas.push(item);
    });
    publicadas.sort(function (a, b) {
      if (a.id === ultimaId) return -1;
      if (b.id === ultimaId) return 1;
      return 0;
    });
    actividades = publicadas.concat(fijas);
  }

  fusionar(extrasLocales());

  function pintarPie() {
    var anio = String(new Date().getFullYear());
    var home = root || "./";
    var caja = document.querySelector(".site-footer");
    if (!caja) {
      caja = document.createElement("footer");
      caja.className = "site-footer";
      document.body.appendChild(caja);
    }
    caja.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div class="footer-marca">' +
            '<a class="brand" href="' + home + '">' +
              '<span class="brand-mark">LC</span>' +
              '<span><span class="brand-kicker">Aula</span><span class="brand-name">Lilian Coria</span></span>' +
            "</a>" +
            '<p class="footer-lema">Material de clase para abrir, imprimir y volver a usar. Todas las áreas, todos los grados.</p>' +
          "</div>" +
          '<div>' +
            '<p class="footer-titulo">El sitio</p>' +
            '<nav class="footer-nav">' +
              '<a href="' + home + '">Inicio</a>' +
              '<a href="' + root + 'actividades/">Actividades</a>' +
              '<a href="' + root + 'sobre.html">El aula</a>' +
            "</nav>" +
          "</div>" +
          "<div>" +
            '<p class="footer-titulo">Docente</p>' +
            '<p class="footer-dato">Lilian Coria</p>' +
            '<p class="footer-dato">Recursos para el aula, listos para la clase.</p>' +
          "</div>" +
        "</div>" +
        '<div class="footer-copy">' +
          "<p>© " + anio + " Aula Lilian Coria. Todos los derechos reservados.</p>" +
          "<p>Hecho para la clase.</p>" +
        "</div>" +
      "</div>";
  }

  pintarPie();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  function soltar() {
    document.querySelectorAll(".is-press").forEach(function (el) {
      el.classList.remove("is-press");
    });
  }

  document.addEventListener("pointerdown", function (evento) {
    var boton = evento.target.closest(".btn, .filtro");
    if (boton) boton.classList.add("is-press");
  });
  document.addEventListener("pointerup", soltar);
  document.addEventListener("pointercancel", soltar);
  document.addEventListener("pointerleave", function (evento) {
    if (evento.target && evento.target.closest) {
      var boton = evento.target.closest(".is-press");
      if (boton) boton.classList.remove("is-press");
    }
  });

  var page = document.body.getAttribute("data-page");
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    if (link.getAttribute("data-nav") === page) {
      link.setAttribute("aria-current", "page");
    }
  });

  function hrefActividad(actividad) {
    if (actividad.driveFileId || actividad.origen === "drive") {
      return root + "actividades/ver.html?id=" + encodeURIComponent(actividad.id);
    }
    return root + "actividades/" + actividad.id + "/";
  }

  function etiquetaBoton(actividad) {
    if (actividad.tipo === "Archivo") return "Ver y descargar";
    return "Abrir ficha";
  }

  function tarjeta(actividad) {
    var extra = actividad.paginas ? actividad.paginas + " páginas" : (actividad.tipo || "Ficha");
    var portada = actividad.vistaPrevia
      ? '<img src="' + actividad.vistaPrevia + '" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:14px;margin-bottom:12px">'
      : "";
    return (
      '<article class="card-actividad">' +
        portada +
        '<p class="card-kicker">' + (actividad.kicker || actividad.tipo || "") + "</p>" +
        "<h3>" + actividad.titulo + "</h3>" +
        '<p class="card-resumen">' + (actividad.resumen || "") + "</p>" +
        '<ul class="card-meta">' +
          "<li>" + actividad.grado + "</li>" +
          "<li>" + actividad.area + "</li>" +
          "<li>" + extra + "</li>" +
        "</ul>" +
        '<a class="btn btn-terra" href="' + hrefActividad(actividad) + '">' + etiquetaBoton(actividad) + "</a>" +
      "</article>"
    );
  }

  var catalogo = document.querySelector("[data-catalogo]");
  var filtros = document.querySelector("[data-filtros]");
  var areaActiva = "todas";
  var gradoActivo = "todos";

  function pintarCatalogo() {
    if (!catalogo) return;
    var lista = actividades.filter(function (a) {
      var okArea = areaActiva === "todas" || a.area === areaActiva;
      var okGrado = gradoActivo === "todos" || a.grado === gradoActivo;
      return okArea && okGrado;
    });
    if (!lista.length) {
      catalogo.innerHTML = '<p class="vacio">Todavía no hay actividades publicadas con ese filtro.</p>';
    } else {
      catalogo.innerHTML = lista.map(tarjeta).join("");
    }
  }

  function unicos(clave) {
    var valores = [];
    actividades.forEach(function (a) {
      if (a[clave] && valores.indexOf(a[clave]) === -1) valores.push(a[clave]);
    });
    return valores;
  }

  function pintarFiltros() {
    if (!filtros) return;
    filtros.innerHTML =
      '<div class="fila-filtros">' +
        '<button type="button" class="filtro' + (areaActiva === "todas" ? " is-on" : "") + '" data-area="todas">Todas las áreas</button>' +
        unicos("area").map(function (area) {
          return '<button type="button" class="filtro' + (areaActiva === area ? " is-on" : "") + '" data-area="' + area + '">' + area + "</button>";
        }).join("") +
      "</div>" +
      '<div class="fila-filtros">' +
        '<button type="button" class="filtro' + (gradoActivo === "todos" ? " is-on" : "") + '" data-grado="todos">Todos los grados</button>' +
        unicos("grado").map(function (grado) {
          return '<button type="button" class="filtro' + (gradoActivo === grado ? " is-on" : "") + '" data-grado="' + grado + '">' + grado + "</button>";
        }).join("") +
      "</div>";
  }

  if (filtros) {
    filtros.addEventListener("click", function (evento) {
      var boton = evento.target.closest("[data-area], [data-grado]");
      if (!boton) return;
      if (boton.hasAttribute("data-area")) {
        areaActiva = boton.getAttribute("data-area");
      } else {
        gradoActivo = boton.getAttribute("data-grado");
      }
      pintarFiltros();
      pintarCatalogo();
    });
  }

  function ultimaActividad() {
    try {
      var ultima = JSON.parse(localStorage.getItem("aula_ultima") || "null");
      if (ultima && ultima.id) {
        return actividades.find(function (a) { return a.id === ultima.id; }) || ultima;
      }
    } catch (e) {}
    var publicada = actividades.find(function (a) { return a.origen === "drive" || a.driveFileId; });
    return publicada || actividades[0];
  }

  function pintarDestacada() {
    var item = ultimaActividad();
    if (!item) return;
    var href = hrefActividad(item);
    document.querySelectorAll("[data-ultima]").forEach(function (enlace) {
      enlace.setAttribute("href", href);
    });
    var caja = document.querySelector("[data-destacada]");
    if (!caja) return;
    var extra = item.paginas ? item.paginas + " páginas" : (item.tipo || "Ficha");
    caja.innerHTML =
      '<p class="ficha-cinta">Ficha de clase</p>' +
      '<p class="eyebrow">Última actividad</p>' +
      "<h2>" + item.titulo + "</h2>" +
      "<p>" + item.resumen + "</p>" +
      '<p class="ficha-linea">' + item.grado + " · " + item.area + " · " + extra + "</p>" +
      '<div class="acciones">' +
        '<a class="btn btn-terra" href="' + href + '">Abrir ficha</a>' +
      "</div>";
  }

  function refrescar() {
    ordenarLista();
    pintarFiltros();
    pintarCatalogo();
    pintarDestacada();
  }

  refrescar();

  if (window.AulaCatalogo) {
    AulaCatalogo.cargar().then(function (lista) {
      var antes = actividades.map(function (a) { return a.id; }).join("|");
      fusionar(lista);
      ordenarLista();
      var despues = actividades.map(function (a) { return a.id; }).join("|");
      if (antes !== despues) refrescar();
    }).catch(function () {});
  }

  document.addEventListener("click", function (evento) {
    var enlace = evento.target.closest("a[href*='ver.html']");
    if (!enlace || !window.AulaCatalogo) return;
    var id = "";
    try { id = new URL(enlace.href, location.href).searchParams.get("id") || ""; } catch (e) {}
    var item = actividades.find(function (a) { return a.id === id; });
    if (item) AulaCatalogo.recordar(item);
  });
})();
