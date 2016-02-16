(function(app) {
  app.RegistrationFormComponent = ng.core
    .Component({
      selector: 'registration-form',
      templateUrl: 'javascripts/temporaryregistrationform.html'
    })
    .Class({
      constructor: function() {
        this.powers = ['Really Smart', 'Super Flexible',
          'Super Hot', 'Weather Changer'
        ];
        this.model = new app.registration(18, 'Dr IQ', this.powers[0],
          'Chuck Overstreet');
        this.submitted = false;
      },
      onSubmit: function() {
        this.submitted = true;
      },
      // TODO: Remove this when we're done
      diagnostic: function() {
        return JSON.stringify(this.model);
      },
    });
})(window.app || (window.app = {})); 