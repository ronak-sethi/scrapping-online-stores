/**
 * 
 */

var mongoDb = require('./db.js'),
	db = mongoDb.getDb(),
	util = require('./util.js'),
	request = require('request'),
	cheerio = require('cheerio'),
	ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';

var searchIndex = 0;
var noOfSites = 3;
var dataObj = null;

var details_fn = function (req, res) {
	
    db.collection('scraper').find({"city":req.params.city}).toArray(function (err, result) {
        var obj = {};
        if (err) {
            //throw err;
            obj.code = err.appCode;
            obj.data = err;console.log("errorrrrr");
            util.sendResponse(res, obj);
        } else {
        	console.log("----->"+JSON.stringify(result));
        	obj.data = result;
        	obj.code = 200;
        	util.sendResponse(res, obj);
        }
    });
};

var addCustomer = function (req, res) {
	var body = ""; // request body
	var jsonData;

	req.on('data', function(data) {
		body += data.toString(); // convert data to string and append it to request body
	});

	req.on('end', function() {
		jsonData = JSON.parse(body); // request is finished receiving data, parse it

		db.collection('scraper').insert(jsonData, function (err, result) {
			var obj = {};
			if (err) {
				//throw err;
				obj.code = err.appCode;
				obj.data = err;console.log("errorrrrr");
				util.sendResponse(res, obj);
			} else {
				console.log("ADDED-->"+JSON.stringify(result));
				obj.data = result;
				obj.code = 200;
				util.sendResponse(res, obj);
			}
		});
		
	});
};


var searchQuery = function (req, res) {
	searchIndex = 0;
	dataObj = {};
	
	var siteUrl = "http://www.flipkart.com/books/pr?sid=bks&q="+req.params.q;
	console.log(siteUrl);
	request({headers : { "User-Agent" : ua}, url: siteUrl}, function (error, response, body) {
		  if (!error && response.statusCode==200) {
			console.log("traversing through..");
		    var $ = cheerio.load(body);
		    var obj = {};
		    var prodArr = [];
			var count = $('.product-unit').length
			if(count > 0){
				$('.product-unit').each(function(){
					var prodObj = {};
					prodObj.pid = $(this).attr('data-pid');
					prodObj.imgurl = $(this).children().children().children().attr('data-src');
					prodObj.title = $(this).children('.pu-details').children().children().attr('title');
					if($(this).children('.pu-details').children('.pu-price').children('.pu-discount').children('.pu-old').text().trim() != ''){
						prodObj.oldprice = parseInt($(this).children('.pu-details').children('.pu-price').children('.pu-discount').children('.pu-old').text().trim().match(/\d+$/)[0]);
						prodObj.discount = $(this).children('.pu-details').children('.pu-price').children('.pu-discount').children('.pu-off-per').text().trim();
					}
					if($(this).children('.pu-details').children('.pu-price').children('.pu-border-top').children('.pu-final').text().trim().match(/\d+$/) != null)
						prodObj.price = parseInt($(this).children('.pu-details').children('.pu-price').children('.pu-border-top').children('.pu-final').text().trim().match(/\d+$/)[0]);
					prodArr.push(prodObj);
					if (!--count){
						console.log("traversing through..1!");
						gotAllSiteData(prodArr);
					};
				})
				
			}else{
				console.log("count-0 in flpkart");
				gotAllSiteData(prodArr);
			}
		  }
	});
	
	var siteUrl1 = "http://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dstripbooks&field-keywords="+req.params.q;
	console.log(siteUrl1);
	request({headers : { "User-Agent" : ua}, url: siteUrl1}, function (error, response, body) {
		if (!error && response.statusCode==200) {
			console.log("traversing through..");
			var $ = cheerio.load(body);
			var obj = {};
			var prodArr = [];
			var count1 = $('.s-item-container').length
			if(count1 > 0){
				$('.s-item-container').each(function(){
					var prodObj = {};
					
					prodObj.url = $(this).children().children().children('.a-col-left').children().children().children().attr('href');
					prodObj.imgurl = $(this).children().children().children('.a-col-left').children().children().children().children().attr('src');
					
					prodObj.title = $(this).children().children().children('.a-col-right').children('.a-spacing-small').children().children().text();
					var authorIndex = parseInt(prodObj.title.search(/by /));
					var titleLen = prodObj.title.length;
					prodObj.author = prodObj.title.substring(authorIndex+3, titleLen);
					prodObj.title = prodObj.title.substring(0, authorIndex);
					
					var price = $(this).children().children().children('.a-col-right').children().last().children().first().children().next().children().children().text();
					var alphaIndex = parseInt(price.search(/[a-zA-Z]/));
					var alphaStartIndex = parseInt(price.search(/[0-9]/));
					if(alphaIndex > -1){
						price = price.substring(alphaStartIndex-1, alphaIndex).trim();
					}
					prodObj.price = parseInt(price.replace(",",""));
					
					//prodObj.oldprice = $(this).children().children().children('.a-col-right').children().last().children().first().children().next().next().children().last().text().trim().match(/\d+$/)[0];
					//prodObj.discount = $(this).children().children().children('.a-col-right').children().last().children().children().next().next().text().trim().match(/\d+$/)[0];
					
					prodArr.push(prodObj);
					
					if (!--count1){
						console.log("traversing through..2!");
						gotAllSiteData(prodArr);
					};
				});
			}else{
				console.log("count-0 in amazon");
				gotAllSiteData(prodArr);
			}
		}
	});
	
	var siteUrl2 = "http://www.snapdeal.com/search?keyword="+req.params.q+"&vertical=p&noOfResults=24&foundInAll=true&categoryUrl=books&sort=rlvncy";
	console.log(siteUrl2);
	request({headers : { "User-Agent" : ua}, url: siteUrl2}, function (error, response, body) {
		if (!error && response.statusCode==200) {
			console.log("traversing through..");
			var $ = cheerio.load(body);
			var obj = {};
			var prodArr = [];
			var count2 = $('.product-tuple-listing').length
			if(count2 > 0){
				$('.product-tuple-listing').each(function(){
					var prodObj = {};
					
					prodObj.url = $(this).children('.product-tuple-image').children('.dp-widget-link').attr('href');
					prodObj.imgurl = $(this).children('.product-tuple-image').children('.dp-widget-link').children().next().children('.product-image').attr('src');
					prodObj.title = $(this).children('.product-tuple-description').children('.title-section-expand').children('.dp-widget-link').children().attr('title');
					if(!prodObj.imgurl){
						prodObj.imgurl = $(this).children('.product-tuple-image').children('.dp-widget-link').closest('picture').children('.product-image').attr('srcset');
					  if(!prodObj.title){
						prodObj.title = $(this).children('.product-tuple-image').children('.dp-widget-link').closest('picture').children('.product-image').attr('title');
					  }
					}
										
					var price = $(this).children('.product-tuple-description').closest('.product-price').attr('data-price');
					prodObj.price = parseInt(price);
										
					//prodObj.oldprice = $(this).children().children().children('.a-col-right').children().last().children().first().children().next().next().children().last().text().trim().match(/\d+$/)[0];
					//prodObj.discount = $(this).children().children().children('.a-col-right').children().last().children().children().next().next().text().trim().match(/\d+$/)[0];
					
					prodArr.push(prodObj);
					
					if (!--count2){
						console.log("traversing through..3!");
						gotAllSiteData(prodArr);
					};
				});
			}else{
				console.log("count-0 in snpdeal");
				gotAllSiteData(prodArr);
			}
		}
	});
	
	function gotAllSiteData(prodArr){
		//console.log("1,.1,.1,.1,1.,1.,1........"+ searchIndex);
		dataObj[searchIndex] = prodArr;
		searchIndex = 1 + searchIndex;
		if(noOfSites == searchIndex){
			console.log("data sent.."+searchIndex);
			searchIndex = 0;
			var obj = {};
			obj.data = dataObj;
			obj.code = 200;
			util.sendResponse(res, obj);
		}
	}
};



module.exports = function () {
    var express = require('express');
    var app = express();

    // Router mapping.
    app.get('/getDetails/:city', details_fn);
    app.get('/searchQuery/:q', searchQuery);
    
    app.post('/addCutomer', addCustomer);

    return app;
}();