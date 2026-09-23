(function () {
  function leerJson(clave, vacio) {
    try {
      return JSON.parse(localStorage.getItem(clave) || JSON.stringify(vacio));
    } catch (e) {
      return vacio;
    }
  }

  function limpio(valor) {
    return String(valor || "").toLowerCase().replace(/\.html?$/i, "").replace(/[^a-z0-9]+/g, "");
  }

  function coincide(item, id) {
    if (!item || !id) return false;
    if (item.id === id) return true;
    if (item.archivoNombre === id) return true;
    var pedido = limpio(id);
    if (!pedido) return false;
    return limpio(item.id) === pedido ||
      limpio(item.archivoNombre) === pedido ||
      limpio(item.titulo) === pedido;
  }

  function locales() {
    var lista = (window.AULA_ACTIVIDADES || []).concat(leerJson("aula_publicaciones", []));
    var ultima = leerJson("aula_ultima", null);
    if (ultima && ultima.id && !lista.some(function (a) { return a && a.id === ultima.id; })) {
      lista.unshift(ultima);
    }
    try {
      var recuerdo = JSON.parse(sessionStorage.getItem("aula_ver") || "null");
      if (recuerdo && recuerdo.id && !lista.some(function (a) { return a && a.id === recuerdo.id; })) {
        lista.unshift(recuerdo);
      }
    } catch (e) {}
    return lista;
  }

  function catalogoId() {
    var cfg = window.AULA_PUBLICACIONES_CONFIG || {};
    return cfg.catalogFileId || localStorage.getItem("aula_drive_catalogo") || "";
  }

  function tokenDrive() {
    return sessionStorage.getItem("aula_drive_token") || localStorage.getItem("aula_drive_token") || "";
  }

  function bajarCatalogo() {
    var id = catalogoId();
    if (!id) return Promise.resolve([]);
    var token = tokenDrive();
    var key = (window.AULA_PUBLICACIONES_CONFIG || {}).apiKey || "";
    var url = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media";
    var opts = {};
    if (token) {
      opts.headers = { Authorization: "Bearer " + token };
    } else if (key) {
      url += "&key=" + encodeURIComponent(key);
    } else {
      return Promise.resolve([]);
    }
    return fetch(url, opts)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        return (data && data.actividades) || [];
      })
      .catch(function () { return []; });
  }

  window.AulaCatalogo = {
    coincide: coincide,
    locales: locales,
    recordar: function (item) {
      if (!item || !item.id) return;
      try { sessionStorage.setItem("aula_ver", JSON.stringify(item)); } catch (e) {}
    },
    cargar: function () {
      return bajarCatalogo().then(function (lista) {
        if (lista.length) {
          try { localStorage.setItem("aula_publicaciones", JSON.stringify(lista)); } catch (e) {}
        }
        return locales();
      });
    },
    bajarHtml: function (fileId) {
      if (!fileId) return Promise.reject(new Error("Falta el archivo"));
      var token = tokenDrive();
      var key = (window.AULA_PUBLICACIONES_CONFIG || {}).apiKey || "";
      var url = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media";
      var opts = {};
      if (token) {
        opts.headers = { Authorization: "Bearer " + token };
      } else if (key) {
        url += "&key=" + encodeURIComponent(key);
      } else {
        return Promise.reject(new Error("Conectá Drive en el panel para abrir la ficha."));
      }
      return fetch(url, opts).then(function (res) {
        if (!res.ok) throw new Error("No se pudo abrir el archivo.");
        return res.text();
      });
    },
    buscar: function (id) {
      return this.cargar().then(function (lista) {
        var hallada = id && lista.find(function (a) { return coincide(a, id); });
        if (hallada) return hallada;
        try {
          var recuerdo = JSON.parse(sessionStorage.getItem("aula_ver") || "null");
          if (recuerdo && recuerdo.titulo) return recuerdo;
        } catch (e) {}
        var ultima = leerJson("aula_ultima", null);
        if (ultima && ultima.titulo) return ultima;
        var publicadas = lista.filter(function (a) {
          return a && (a.origen === "drive" || a.driveFileId);
        });
        if (publicadas.length === 1) return publicadas[0];
        return publicadas[0] || lista[0] || null;
      });
    }
  };
})();
