
var express = require('express');
var port = 3000;
var path = require("path");

// Create a new express app
var app = express();


app.use('/webscrapeservices', require(__dirname+'/Script/homepage'));


// Everything is set. Listen on the port.

app.listen(port);

console.log('scraping is running on port ' + port);