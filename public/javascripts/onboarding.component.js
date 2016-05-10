"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var rest_service_1 = require('./rest.service');
var http_1 = require('@angular/http');
var OnboardingComponent = (function () {
    function OnboardingComponent(_restService) {
        this._restService = _restService;
        this.active = true;
        this.errorMessage = '';
        this.email = '';
        this.username = '';
        this.password = '';
        this.password2 = '';
        this.successMessage = '';
        this.isformvalid = false;
        //  this.heroes = this._heroService.getHeroes();
    }
    OnboardingComponent.prototype.ngOnInit = function () {
    };
    OnboardingComponent.prototype.onSubmit = function (onbordingForm) {
        var _this = this;
        if (onbordingForm.value.password != onbordingForm.value.password2) {
            this.errorMessage = "les mots de pass sont differentes. Entree let mot the pass correctement";
            return;
        }
        var success;
        var failure;
        this._restService.onboarding(this).subscribe(function (data) { return _this.sussesfullOnboarding(data); }, function (error) { return _this.failureOnboarding(error); });
        if (this.successMessage) {
            this.active = false;
        }
    };
    OnboardingComponent.prototype.validateEmail = function (event) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(event.target.value)) {
            event.target.className = "ng-pristine ng-invalid ng-touched";
        }
        else {
            event.target.className = "ng-touched ng-dirty ng-valid";
        }
    };
    OnboardingComponent.prototype.validatePassword1 = function (event) {
        if (this.password2 != '' && event.target.value != this.password2) {
            event.target.className = "ng-pristine ng-invalid ng-touched";
        }
        else {
            event.target.className = "ng-touched ng-dirty ng-valid";
        }
    };
    OnboardingComponent.prototype.validatePassword2 = function (event) {
        if (this.password != '' && event.target.value != this.password) {
            event.target.className = "ng-pristine ng-invalid ng-touched";
        }
        else {
            event.target.className = "ng-touched ng-dirty ng-valid";
        }
    };
    OnboardingComponent.prototype.sussesfullOnboarding = function (data) {
        var quickvalidation = data;
        if (quickvalidation.error != "") {
            this.errorMessage = quickvalidation.error;
        }
        else {
            $('.ui.modal').modal('hide');
        }
    };
    OnboardingComponent.prototype.failureOnboarding = function (error) {
        var quickvalidation = JSON.stringify(error);
    };
    OnboardingComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n    <div>\n      <div>{{errorMessage}}</div>\n   </div>\n  <form class=\"ui form onboarding\" enctype=\"multipart/form-data\"  *ngIf=\"active\" (ngSubmit)=\"onSubmit(onbordingForm)\" #onbordingForm=\"ngForm\">\n  \n  <div class=\"field\">\n    <label>Email</label>\n    <input  [(ngModel)]=\"email\" placeholder=\"email\" name=\"email\" type=\"email\" required (blur)=\"validateEmail($event)\"\n    ngControl=\"email\" >\n  </div>\n    \n  <div class=\"field\">\n    <label>Nom d'Utilisateur</label>\n    <input [(ngModel)]=\"username\" placeholder=\"username\" name=\"username\" type=\"text\" minlength=\"4\" required  ngControl=\"username\">\n  </div>\n  \n  <div class=\"field\">\n    <label>Password</label>\n    <input [(ngModel)]=\"password\" type=\"password\" name=\"password\" minlength=\"4\" required ngControl=\"password\" (keyup)=\"validatePassword1($event)\">\n  </div>\n  \n  <div class=\"field\">\n    <label>Retapez Password</label>\n    <input [(ngModel)]=\"password2\" type=\"password\" name=\"password2\" minlength=\"4\" required ngControl=\"password2\" (keyup)=\"validatePassword2($event)\">\n  </div>\n  \n  <button  class=\"ui blue submit button\" type=\"submit\" [disabled]=\"!onbordingForm.form.valid\">Submit</button>\n <div class=\"ui error message\"></div>\n  </form>\n  ",
            styles: ["\n  \ninput.ng-invalid.ng-touched {\n  background: #fff6f6; /* red */\n}\n\n.ui.form.onboarding{\n    width: 350px;\n}\n  \n  "],
            providers: [rest_service_1.RestService, http_1.HTTP_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [rest_service_1.RestService])
    ], OnboardingComponent);
    return OnboardingComponent;
}());
exports.OnboardingComponent = OnboardingComponent;
//# sourceMappingURL=onboarding.component.js.map