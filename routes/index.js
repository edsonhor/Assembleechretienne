var express = require('express');
<<<<<<< HEAD
var passport= require('passport');
var Strategy= require('passport-local').Strategy;
=======
>>>>>>> e4a270a9f3b44722380f9e0558ee7345ec74d4e3
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

<<<<<<< HEAD

router.post ('/onboarding', function( req, res ){
        if(!req.body) return res.sendStatus(400)
        res.json( req.body);
        });

router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });

=======
>>>>>>> e4a270a9f3b44722380f9e0558ee7345ec74d4e3
module.exports = router;
