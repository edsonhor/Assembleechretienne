var querystring = require('querystring');
var express = require('express');
var passport= require('passport');
var Strategy= require('passport-local').Strategy;
var router = express.Router();
var http= require('http');
var console = require('console').Console;
var Redis = require('ioredis');
var jwt= require('jsonwebtoken');
var cookieParser = require('cookie-parser');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/*Setting up passport */

passport.use(new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
function(email, password, cb) {

 var requestdata="{\"email\" : "+ "\"" +  email +  "\"" +   " ,\"password\" : " + "\"" + password  +"\""+ " }";
 
   // An object of options to indicate where to post validation credential
      var option_to_validate_user = {
      host: 'www.assembleechretienne.com',
      port: '8080',
      path: '/api/webapi/onboarding/validate',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length':requestdata.length
         }
      };
var user;

 var request = http.request(option_to_validate_user, function(resp) {
		      var data="";
           resp.setEncoding('utf8');
           resp.on('data', function (chunk) {
               data +=chunk;
               });
               resp.on('end', function() {
               user= JSON.parse(data);
	       user['email']=email;     
            if(user.authentication == "false"){
            return  cb(null,false,{message:"Incorrect username or password"});
              }
              if(user.authentication == "true"){
             return  cb(null,user);
               }
		})
              });

        request.write(requestdata);
        request.end();

           request.on('error', function(e) {
           var  error='problem with request: ' + e.message;
           });
	}));

// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.email);
});

passport.deserializeUser(function(email, cb) {
     	// Try to hit the Redis cache to see if the session data is available there
	var redis = new Redis();
	redis.get(email, function (err, result) {
        // if the data is not in the cache the get it from the database. 
	// the database will add it to the cache so next time it's available there
       var resulttest= result;
	if (resulttest){
	
	}

       });


        var user={"name":"test","id":"12345"};
	cb(null, user);
  });



router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });


/* User Registration */

router.post ('/onboarding', function( req, res ){
 if(!req.body) return res.sendStatus(400)
var incoming_request =JSON.stringify({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
});

      // An object of options to indicate where to post to
      var option_to_validate_user = {
      host: 'localhost',
      port: '8080',
      path: '/api/webapi/onboarding',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length':incoming_request.length
         }
      };

 var response_to_javascript={
			status: "", // can be valid or invalid
			body:"",    // I am thinking of creating an object and save the value
			error:""
			};
            
     var request = http.request(option_to_validate_user, function(response_from_java_service) {
  	       response_to_javascript.status= response_from_java_service.statusCode;
 	     
         response_from_java_service.setEncoding('utf8');
                
         response_from_java_service.on('data', function (chunk) {
                response_to_javascript.body +=chunk;
               });
              
         response_from_java_service.on('end', function() {

               var response_from_java_obj = JSON.parse(response_to_javascript.body);
               if( response_from_java_obj.onboarding === "successful")
               {
                 response_from_java_obj.expiresIn="5m";
                 var token=jwt.sign(response_from_java_obj, 'my name is edson');
                 res.cookie('Auth', token,{ maxAge: 900000, httpOnly: true });                  
               }     
                res.json(response_from_java_obj);    

    //          res.json(response_to_javascript);
               })
              });
      
           request.on('error', function(e) {
           response_to_javascript.error='problem with request: ' + e.message;
           res.json(response_to_javascript);
           });

// write data to request body
             request.write(incoming_request);
             request.end();
        });



router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'secret';
opts.issuer = "edson";
opts.audience = "this.is.the.audience";




passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    if(jwt_payload.email=='edson.philippe@ufl.edu'){
      return done(null, {"username":"Edson", "lastname":"philippe","message":"edson is the best"})
    }
    else
    {
      return done(null, false, {message:"incorrect username or password"})
    }
}));


router.post("/jwttest", function(req,res){

});














module.exports = router;
