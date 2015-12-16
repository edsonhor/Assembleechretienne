var querystring = require('querystring');
var express = require('express');
var passport= require('passport');
var Strategy= require('passport-local').Strategy;
var router = express.Router();
var http= require('http');
var console = require('console').Console;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post ('/onboarding', function( req, res ){

        if(!req.body) return res.sendStatus(400)
       


var incoming_request =JSON.stringify({
                    username: req.body.username,
                    email: req.body.Email,
                    password: "test"
});

      // An object of options to indicate where to post to
      var option_to_validate_user = {
      host: 'www.assembleechretienne.com',
      port: '8080',
      path: '/AssembleeChretienneAPI/webapi/onboarding',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length':incoming_request.length
         }
      };

     var request = http.request(option_to_validate_user, function(resp) {

               var debuginfo={
			status: "",
			header:"",
			eom:"",
			body:"",
			error:""
			};
  	       debuginfo.status= resp.statusCode;
 	       debuginfo.header= JSON.stringify(resp.headers);
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                debuginfo.body +=chunk;
               });
               resp.on('end', function() {
               res.json(debuginfo);
               })
              });
      
           request.on('error', function(e) {
           debuginfo.error='problem with request: ' + e.message;
           });

// write data to request body
             request.write(incoming_request);
             request.end();
        });



router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });

module.exports = router;
