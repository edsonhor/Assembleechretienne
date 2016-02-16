(function(app) {
  document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(app.RegistrationFormComponent);
  });
})(window.app || (window.app = {}));