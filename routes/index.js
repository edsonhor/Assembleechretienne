var express = require('express');
var passport= require('passport');
var Strategy= require('passport-local').Strategy;
var router = express.Router();

 // An object of options to indicate where to post to
  var post_to_validate_user = {
      host: 'http://www.assembleechretienne.com/',
      port: '8080',
      path: '/AssembleeChretienneAPI/webapi/onboarding',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
         }
  };


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post ('/onboarding', function( req, res ){
        if(!req.body) return res.sendStatus(400)
        
	var email= req.body.username;
	
	res.json(email);
        });

router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });

module.exports = router;
