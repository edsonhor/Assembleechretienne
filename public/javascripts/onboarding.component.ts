import {Component} from 'angular2/core';
import {User} from './User';
import {RestService} from './rest.service';
import {OnInit} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';

@Component({
    selector: 'my-app',
    template:`
    <div>
      <div>{{errorMessage}}</div>
   </div>
  <form class="ui form onboarding" enctype="multipart/form-data"  *ngIf="active" (ngSubmit)="onSubmit(onbordingForm)" #onbordingForm="ngForm">
  
  <div class="field">
    <label>Email</label>
    <input  [(ngModel)]="email" placeholder="email" name="email" type="email" required (blur)="validateEmail($event)"
    ngControl="email" >
  </div>
    
  <div class="field">
    <label>Nom d'Utilisateur</label>
    <input [(ngModel)]="username" placeholder="username" name="username" type="text" minlength="4" required  ngControl="username">
  </div>
  
  <div class="field">
    <label>Password</label>
    <input [(ngModel)]="password" type="password" name="password" minlength="4" required ngControl="password" (keyup)="validatePassword1($event)">
  </div>
  
  <div class="field">
    <label>Retapez Password</label>
    <input [(ngModel)]="password2" type="password" name="password2" minlength="4" required ngControl="password2" (keyup)="validatePassword2($event)">
  </div>
  
  <button  class="ui blue submit button" type="submit" [disabled]="!onbordingForm.form.valid">Submit</button>
 <div class="ui error message"></div>
  </form>
  `,
  styles: [`
  
input.ng-invalid.ng-touched {
  background: #fff6f6; /* red */
}

.ui.form.onboarding{
    width: 350px;
}
  
  `],
  providers: [RestService , HTTP_PROVIDERS]
})
export class OnboardingComponent implements OnInit{ 
  
  public active=true;
  public errorMessage: string='';
  public email: string = '';
  public username: string = '';
  public password:  string='';
  public password2: string ='';
  public successMessage:string='';
  public isformvalid:boolean =false;
  
   constructor(private _restService: RestService) { 
      //  this.heroes = this._heroService.getHeroes();
   }
   
 
  
  ngOnInit() {

  }
  
  onSubmit(onbordingForm){
      if(onbordingForm.value.password != onbordingForm.value.password2){
          this.errorMessage="les mots de pass sont differentes. Entree let mot the pass correctement"
          return;
      }
      var success;
      var failure;
      this._restService.onboarding(this).subscribe(
          data  => this.sussesfullOnboarding(data),
          error => this.failureOnboarding(error)
      )
      
      if(this.successMessage){
          this.active=false;
      }
  }
  
validateEmail(event:any) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(event.target.value)){
        event.target.className="ng-pristine ng-invalid ng-touched";
        
    }else{
        event.target.className="ng-touched ng-dirty ng-valid"
    }
    
}

validatePassword1(event:any) {
    if(this.password2 !='' && event.target.value != this.password2){
         event.target.className="ng-pristine ng-invalid ng-touched";
    }
    else{
        event.target.className="ng-touched ng-dirty ng-valid";
    }
  }
   
   validatePassword2(event:any) 
   {
    if(this.password !='' && event.target.value != this.password){
         event.target.className="ng-pristine ng-invalid ng-touched";
    }
    else{
        event.target.className="ng-touched ng-dirty ng-valid";
    }
   }
   
   sussesfullOnboarding(data){
     var quickvalidation=data;
     if(quickvalidation.error !=""){
         this.errorMessage=quickvalidation.error;
     }
     else{
          $('.ui.modal').modal('hide');
     }
       
   }
   
   failureOnboarding(error){
       var quickvalidation=JSON.stringify(error);
   }
}
