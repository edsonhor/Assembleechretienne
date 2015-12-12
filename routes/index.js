var express = require('express');
var passport= require('passport');
var Strategy= require('passport-local').Strategy;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post ('/onboarding', function( req, res ){
        if(!req.body) return res.sendStatus(400)
        res.json( req.body);
        });

router.get ('/test', function( req, res ){
           res.send('We GOT THE PAYLOAD');
        });

module.exports = router;
