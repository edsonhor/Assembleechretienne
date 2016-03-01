import {Component} from '/angular2/core';

@Component({
    selector: 'my-app',
    template: '<h1>{{title}}</h1><h2>{{hero}} </h2>'
})
export class AppComponent { 
  public email = '';
  public username = '';
  public password='';
  public password2='';
}
