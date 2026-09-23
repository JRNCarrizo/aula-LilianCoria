/**
 * Datos públicos para leer el catálogo que está en Drive.
 * El API Key NO es la clave del panel. El Client ID y la contraseña van en admin-config.js.
 */
window.AULA_PUBLICACIONES_CONFIG = {
  apiKey: "AIzaSyAOxnWCakYqpyOBsktiixkHY-PMPLZbFIo",
  catalogFileId: ""
};

(function () {
  var cfg = window.AULA_PUBLICACIONES_CONFIG;
  if (!cfg.catalogFileId) {
    try {
      cfg.catalogFileId = localStorage.getItem("aula_drive_catalogo") || "";
    } catch (e) {}
  }
})();
