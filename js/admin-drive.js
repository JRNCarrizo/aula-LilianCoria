(function () {
  var LS_TOKEN = "aula_drive_token";
  var LS_EXPIRA = "aula_drive_expira";
  var LS_CARPETA = "aula_drive_carpeta";
  var LS_CATALOGO = "aula_drive_catalogo";
  var LS_CUENTA = "aula_drive_cuenta";
  var LS_ITEMS = "aula_publicaciones";
  var SCOPE = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";

  function config() {
    return window.AULA_ADMIN || {};
  }

  function tokenVigente() {
    var token = sessionStorage.getItem(LS_TOKEN) || localStorage.getItem(LS_TOKEN);
    var expira = Number(localStorage.getItem(LS_EXPIRA) || 0);
    if (!token || Date.now() > expira - 60000) return "";
    return token;
  }

  function guardarToken(accessToken, expiresIn) {
    var segs = Number(expiresIn || 3600);
    sessionStorage.setItem(LS_TOKEN, accessToken);
    localStorage.setItem(LS_TOKEN, accessToken);
    localStorage.setItem(LS_EXPIRA, String(Date.now() + segs * 1000));
  }

  function api(ruta, opciones) {
    var token = tokenVigente();
    if (!token) return Promise.reject(new Error("Drive no está conectado"));
    opciones = opciones || {};
    opciones.headers = opciones.headers || {};
    opciones.headers.Authorization = "Bearer " + token;
    return fetch("https://www.googleapis.com" + ruta, opciones).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (txt) {
          throw new Error(txt || ("Error Drive " + res.status));
        });
      }
      if (res.status === 204) return null;
      var tipo = res.headers.get("content-type") || "";
      if (tipo.indexOf("application/json") !== -1) return res.json();
      return res.text();
    });
  }

  function listarApp(query) {
    var q = encodeURIComponent(query);
    return api("/drive/v3/files?spaces=drive&fields=files(id,name)&q=" + q);
  }

  window.AulaDrive = {
    conectado: function () {
      return Boolean(tokenVigente());
    },
    cuenta: function () {
      return localStorage.getItem(LS_CUENTA) || "";
    },
    catalogoId: function () {
      return localStorage.getItem(LS_CATALOGO) || "";
    },
    locales: function () {
      try {
        return JSON.parse(localStorage.getItem(LS_ITEMS) || "[]");
      } catch (e) {
        return [];
      }
    },
    guardarLocales: function (items) {
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
    },

    conectar: function () {
      var cfg = config();
      if (!cfg.googleClientId) {
        return Promise.reject(new Error("Falta el Client ID de Google en Ajustes."));
      }
      if (!window.google || !google.accounts || !google.accounts.oauth2) {
        return Promise.reject(new Error("No se pudo cargar Google. Recargá la página."));
      }

      var self = this;
      return new Promise(function (ok, mal) {
        var cliente = google.accounts.oauth2.initTokenClient({
          client_id: cfg.googleClientId,
          scope: SCOPE,
          callback: function (resp) {
            if (resp.error) {
              mal(new Error(resp.error));
              return;
            }
            guardarToken(resp.access_token, resp.expires_in);
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: "Bearer " + resp.access_token }
            })
              .then(function (r) { return r.ok ? r.json() : {}; })
              .then(function (info) {
                if (info.email) localStorage.setItem(LS_CUENTA, info.email);
                return self.prepararCarpeta();
              })
              .then(ok)
              .catch(ok);
          }
        });
        cliente.requestAccessToken({ prompt: tokenVigente() ? "" : "consent" });
      });
    },

    desconectar: function () {
      var token = tokenVigente();
      if (token && window.google && google.accounts && google.accounts.oauth2) {
        google.accounts.oauth2.revoke(token, function () {});
      }
      sessionStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_EXPIRA);
      localStorage.removeItem(LS_CUENTA);
    },

    prepararCarpeta: function () {
      var cfg = config();
      var nombre = cfg.carpetaDrive || "Aula Lilian Coria";
      var guardada = localStorage.getItem(LS_CARPETA);
      var self = this;
      if (guardada) {
        return api("/drive/v3/files/" + guardada + "?fields=id,name").then(function () {
          return self.prepararCatalogo();
        }).catch(function () {
          localStorage.removeItem(LS_CARPETA);
          return self.prepararCarpeta();
        });
      }
      return listarApp("name = '" + nombre.replace(/'/g, "\\'") + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false")
        .then(function (data) {
          if (data.files && data.files[0]) {
            localStorage.setItem(LS_CARPETA, data.files[0].id);
            return self.prepararCatalogo();
          }
          return api("/drive/v3/files?fields=id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nombre,
              mimeType: "application/vnd.google-apps.folder"
            })
          }).then(function (creada) {
            localStorage.setItem(LS_CARPETA, creada.id);
            return self.prepararCatalogo();
          });
        });
    },

    prepararCatalogo: function () {
      var carpeta = localStorage.getItem(LS_CARPETA);
      var self = this;
      var id = localStorage.getItem(LS_CATALOGO);
      if (id) {
        return api("/drive/v3/files/" + id + "?fields=id").then(function () { return id; })
          .catch(function () {
            localStorage.removeItem(LS_CATALOGO);
            return self.prepararCatalogo();
          });
      }
      return listarApp("name = 'catalogo-aula.json' and '" + carpeta + "' in parents and trashed = false")
        .then(function (data) {
          if (data.files && data.files[0]) {
            localStorage.setItem(LS_CATALOGO, data.files[0].id);
            return self.hacerPublico(data.files[0].id).then(function () { return data.files[0].id; });
          }
          var meta = {
            name: "catalogo-aula.json",
            parents: [carpeta],
            mimeType: "application/json"
          };
          var cuerpo = new Blob([JSON.stringify({ actividades: [] }, null, 2)], { type: "application/json" });
          return self.subirMultipart(meta, cuerpo).then(function (file) {
            localStorage.setItem(LS_CATALOGO, file.id);
            return self.hacerPublico(file.id).then(function () { return file.id; });
          });
        });
    },

    hacerPublico: function (id) {
      return api("/drive/v3/files/" + id + "/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "anyone", role: "reader" })
      }).catch(function () { return null; });
    },

    subirMultipart: function (metadata, blob) {
      var limite = "aula_limite_" + Date.now();
      var cuerpo = new Blob([
        "--" + limite + "\r\n" +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) + "\r\n" +
        "--" + limite + "\r\n" +
        "Content-Type: " + (blob.type || "application/octet-stream") + "\r\n\r\n",
        blob,
        "\r\n--" + limite + "--"
      ]);
      return api("/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webViewLink,webContentLink", {
        method: "POST",
        headers: { "Content-Type": "multipart/related; boundary=" + limite },
        body: cuerpo
      });
    },

    guardarLista: function (actividad, lista) {
      lista = (lista || []).filter(function (a) { return a.id !== actividad.id; });
      lista.unshift(actividad);
      this.guardarLocales(lista);
      try {
        localStorage.setItem("aula_ultima", JSON.stringify(actividad));
        sessionStorage.setItem("aula_ver", JSON.stringify(actividad));
      } catch (e) {}
      var catalogo = localStorage.getItem(LS_CATALOGO);
      if (!catalogo) return Promise.resolve(actividad);
      return this.actualizarJson(catalogo, { actividades: lista })
        .then(function () { return window.AulaDrive.hacerPublico(catalogo); })
        .catch(function () { return null; })
        .then(function () { return actividad; });
    },

    actualizarJson: function (id, objeto) {
      return api("/upload/drive/v3/files/" + id + "?uploadType=media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objeto)
      });
    },

    leerCatalogo: function () {
      var id = localStorage.getItem(LS_CATALOGO);
      if (!id || !tokenVigente()) {
        return Promise.resolve({ actividades: this.locales() });
      }
      return api("/drive/v3/files/" + id + "?alt=media").then(function (data) {
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch (e) { data = { actividades: [] }; }
        }
        return data && data.actividades ? data : { actividades: [] };
      }).catch(function () {
        return { actividades: window.AulaDrive.locales() };
      });
    },

    subirPortada: function (imagen) {
      var self = this;
      if (!imagen) return Promise.resolve("");
      var carpeta = localStorage.getItem(LS_CARPETA);
      return self.subirMultipart({
        name: "previa-" + Date.now() + "-" + (imagen.name || "foto.jpg"),
        parents: [carpeta]
      }, imagen).then(function (file) {
        return self.hacerPublico(file.id).then(function () {
          return "https://drive.google.com/uc?export=view&id=" + file.id;
        });
      });
    },

    publicar: function (actividad, archivo, portada) {
      var self = this;
      if (!this.conectado()) {
        return Promise.reject(new Error("Conectá Drive en Ajustes antes de publicar."));
      }
      return this.prepararCarpeta().then(function () {
        var carpeta = localStorage.getItem(LS_CARPETA);
        var meta = {
          name: archivo.name,
          parents: [carpeta]
        };
        return self.subirMultipart(meta, archivo).then(function (file) {
          return self.hacerPublico(file.id).then(function () {
            return api("/drive/v3/files/" + file.id + "?fields=id,name,mimeType,thumbnailLink,webViewLink,webContentLink");
          });
        }).then(function (file) {
          actividad.driveFileId = file.id;
          actividad.mimeType = file.mimeType;
          actividad.vistaPrevia = file.thumbnailLink || "";
          actividad.enlaceVer = file.webViewLink || ("https://drive.google.com/file/d/" + file.id + "/view");
          actividad.enlaceBajar = "https://drive.google.com/uc?export=download&id=" + file.id;
          actividad.archivoNombre = file.name;
          var seguir = portada
            ? self.subirPortada(portada).then(function (url) {
              if (url) actividad.vistaPrevia = url;
              return actividad;
            })
            : Promise.resolve(actividad);
          return seguir.then(function () {
            return self.leerCatalogo().then(function (cat) {
              return self.guardarLista(actividad, cat.actividades || []);
            });
          });
        });
      });
    },

    actualizar: function (actividad, archivo, portada) {
      var self = this;
      if (!this.conectado()) {
        return Promise.reject(new Error("Conectá Drive en Ajustes antes de guardar."));
      }
      return this.prepararCarpeta().then(function () {
        var seguir = Promise.resolve(actividad);
        if (archivo) {
          if (actividad.driveFileId) {
            seguir = api("/upload/drive/v3/files/" + actividad.driveFileId + "?uploadType=media&fields=id,name,mimeType,thumbnailLink,webViewLink,webContentLink", {
              method: "PATCH",
              headers: { "Content-Type": archivo.type || "text/html" },
              body: archivo
            });
          } else {
            var carpeta = localStorage.getItem(LS_CARPETA);
            seguir = self.subirMultipart({ name: archivo.name, parents: [carpeta] }, archivo);
          }
          seguir = seguir.then(function (file) {
            return self.hacerPublico(file.id).then(function () {
              return api("/drive/v3/files/" + file.id + "?fields=id,name,mimeType,thumbnailLink,webViewLink,webContentLink");
            });
          }).then(function (file) {
            actividad.driveFileId = file.id;
            actividad.mimeType = file.mimeType;
            actividad.vistaPrevia = file.thumbnailLink || actividad.vistaPrevia || "";
            actividad.enlaceVer = file.webViewLink || actividad.enlaceVer || "";
            actividad.enlaceBajar = "https://drive.google.com/uc?export=download&id=" + file.id;
            actividad.archivoNombre = file.name;
            return actividad;
          });
        }
        if (portada) {
          seguir = seguir.then(function () {
            return self.subirPortada(portada).then(function (url) {
              if (url) actividad.vistaPrevia = url;
              return actividad;
            });
          });
        }
        return seguir.then(function () {
          return self.leerCatalogo().then(function (cat) {
            return self.guardarLista(actividad, cat.actividades || []);
          });
        });
      });
    },

    eliminar: function (actividad) {
      var self = this;
      var id = actividad && actividad.id;
      if (!id) return Promise.reject(new Error("No se encontró esa actividad."));

      function sacarMemoria(lista) {
        self.guardarLocales(lista);
        try {
          var ultima = JSON.parse(localStorage.getItem("aula_ultima") || "null");
          if (ultima && ultima.id === id) {
            if (lista[0]) localStorage.setItem("aula_ultima", JSON.stringify(lista[0]));
            else localStorage.removeItem("aula_ultima");
          }
        } catch (e) {}
        try {
          ["aula_ver", "aula_editar"].forEach(function (clave) {
            var guardada = JSON.parse(sessionStorage.getItem(clave) || localStorage.getItem(clave) || "null");
            if (guardada && guardada.id === id) {
              sessionStorage.removeItem(clave);
              localStorage.removeItem(clave);
            }
          });
        } catch (e) {}
        return lista;
      }

      function idDeUrl(url) {
        var m = String(url || "").match(/[?&]id=([^&]+)/);
        return m ? decodeURIComponent(m[1]) : "";
      }

      function borrarArchivo(fileId) {
        if (!fileId) return Promise.resolve();
        return api("/drive/v3/files/" + fileId, { method: "DELETE" }).catch(function () { return null; });
      }

      var locales = sacarMemoria(self.locales().filter(function (a) { return a && a.id !== id; }));
      if (!this.conectado()) return Promise.resolve(locales);

      return this.leerCatalogo().then(function (cat) {
        var lista = sacarMemoria((cat.actividades || []).filter(function (a) { return a && a.id !== id; }));
        var catalogo = localStorage.getItem(LS_CATALOGO);
        var seguir = catalogo
          ? self.actualizarJson(catalogo, { actividades: lista })
              .then(function () { return self.hacerPublico(catalogo); })
              .catch(function () { return null; })
          : Promise.resolve();
        return seguir.then(function () {
          return borrarArchivo(actividad.driveFileId).then(function () {
            var portadaId = idDeUrl(actividad.vistaPrevia);
            if (portadaId && portadaId === actividad.driveFileId) return lista;
            return borrarArchivo(portadaId).then(function () { return lista; });
          });
        });
      });
    }
  };
})();
