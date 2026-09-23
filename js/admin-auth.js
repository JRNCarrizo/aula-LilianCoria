(function () {
  var CLAVE = "aula_sesion";

  window.AulaAuth = {
    haySesion: function () {
      return sessionStorage.getItem(CLAVE) === "ok";
    },
    entrar: function (password) {
      var esperada = (window.AULA_ADMIN && window.AULA_ADMIN.password) || "";
      if (!password || password !== esperada) return false;
      sessionStorage.setItem(CLAVE, "ok");
      return true;
    },
    salir: function () {
      sessionStorage.removeItem(CLAVE);
    },
    pedir: function () {
      if (this.haySesion()) return true;
      window.location.href = "/admin/";
      return false;
    }
  };
})();
