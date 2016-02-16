(function(app) {
  app.registration = registration;
  function registration(Email, Username, Password1, Password2) {
    this.email = Email;
    this.username = Username;
    this.password1 = Password1;
    this.password2 = Password2;
  }
})(window.app || (window.app = {}));