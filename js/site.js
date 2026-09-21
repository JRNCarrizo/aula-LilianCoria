(function () {
  var root = document.body.getAttribute("data-root") || "";
  var actividades = window.AULA_ACTIVIDADES || [];

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  function soltar() {
    document.querySelectorAll(".is-press").forEach(function (el) {
      el.classList.remove("is-press");
    });
  }

  document.addEventListener("pointerdown", function (evento) {
    var boton = evento.target.closest(".btn, .nav a, .filtro, .brand");
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

  function hrefActividad(id) {
    return root + "actividades/" + id + "/";
  }

  function tarjeta(actividad) {
    return (
      '<article class="card-actividad">' +
        '<p class="card-kicker">' + actividad.kicker + "</p>" +
        "<h3>" + actividad.titulo + "</h3>" +
        '<p class="card-resumen">' + actividad.resumen + "</p>" +
        '<ul class="card-meta">' +
          "<li>" + actividad.grado + "</li>" +
          "<li>" + actividad.area + "</li>" +
          "<li>" + actividad.paginas + " páginas</li>" +
        "</ul>" +
        '<a class="btn btn-terra" href="' + hrefActividad(actividad.id) + '">Abrir actividad</a>' +
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

  if (filtros) {
    var areas = unicos("area");
    var grados = unicos("grado");
    filtros.innerHTML =
      '<div class="fila-filtros">' +
        '<button type="button" class="filtro is-on" data-area="todas">Todas las áreas</button>' +
        areas.map(function (area) {
          return '<button type="button" class="filtro" data-area="' + area + '">' + area + "</button>";
        }).join("") +
      "</div>" +
      '<div class="fila-filtros">' +
        '<button type="button" class="filtro is-on" data-grado="todos">Todos los grados</button>' +
        grados.map(function (grado) {
          return '<button type="button" class="filtro" data-grado="' + grado + '">' + grado + "</button>";
        }).join("") +
      "</div>";
    filtros.addEventListener("click", function (evento) {
      var boton = evento.target.closest("[data-area], [data-grado]");
      if (!boton) return;
      if (boton.hasAttribute("data-area")) {
        areaActiva = boton.getAttribute("data-area");
        filtros.querySelectorAll("[data-area]").forEach(function (el) {
          el.classList.toggle("is-on", el === boton);
        });
      } else {
        gradoActivo = boton.getAttribute("data-grado");
        filtros.querySelectorAll("[data-grado]").forEach(function (el) {
          el.classList.toggle("is-on", el === boton);
        });
      }
      pintarCatalogo();
    });
  }

  if (catalogo) pintarCatalogo();

  var destacada = document.querySelector("[data-destacada]");
  if (destacada) {
    var item = actividades.find(function (a) { return a.destacada; }) || actividades[0];
    if (item) {
      destacada.innerHTML =
        '<p class="eyebrow">Actividad disponible</p>' +
        "<h2>" + item.titulo + "</h2>" +
        "<p>" + item.resumen + "</p>" +
        '<p class="ficha-linea">' + item.grado + " · " + item.area + " · " + item.tipo + "</p>" +
        '<div class="acciones">' +
          '<a class="btn btn-terra" href="' + hrefActividad(item.id) + '">Ver la actividad</a>' +
          '<a class="btn btn-ghost" href="' + root + 'actividades/">Todas las actividades</a>' +
        "</div>";
    }
  }
})();
