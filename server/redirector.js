const express = require('express');

var app = express();
app.listen(80);
app.use(function(req,res,next){
	if(!req.secure){
		return res.redirect(['https://',req.get('Host'),req.url].join(''));
	}
	next();
});
