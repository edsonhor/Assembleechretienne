import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {Headers, RequestOptions} from '@angular/http';
import {User}     from './User';
import {OnboardingComponent} from './onboarding.component'
import 'rxjs/Rx';


@Injectable()
export class RestService {
   
    constructor (private http: Http) {}
    
  private _onboardingUrl = 'https://www.assembleechretienne.com:8000/onboarding';  // URL to web api
  
  

  
  
  

  private handleError (error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
  
   
   
   onboarding (OnboardingComponent: OnboardingComponent) : Observable<any>  {

    let body = JSON.stringify(OnboardingComponent);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._onboardingUrl, body, options)
                                .map(res => res.json())
                                  .catch(this.handleError)
    
    ;
  }
  
    getHeroes() {
         return 'test'
  }
}