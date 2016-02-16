(function(app) {
  app.AppComponent =
    ng.core.Component({
      selector: 'registration',
     // template: '<h1>registration</h1>',
	 template:
  '<p>My name: {{ myName }}</p>' +
  '<p>Friends:</p>' +
  '<ul>' +
  '<li *ngFor="#name of names">' +
  '{{ name }}' +
  '</li>' +
  '</ul>'
    })
    .Class({
      constructor: function() {
		   this.myName = "Alice";
		   this.names = ["Aarav", "Martín", "Shannon", "Ariana", "Kai"];
	  }
    });
})(window.app || (window.app = {})); 
