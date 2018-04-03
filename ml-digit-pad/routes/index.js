var config = require('../lib/config');
var utils = require('../lib/utils');
var request = require('request');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const wml_credentials = new Map();

wml_credentials.set("url", config.wml_credentials[0].url);
wml_credentials.set("username", config.wml_credentials[0].username);
wml_credentials.set("password", config.wml_credentials[0].password);

function apiGet(url, username, password, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	const tokenHeader = "Basic " + btoa((username + ":" + password));
	const tokenUrl = url + "/v3/identity/token";

	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("GET", tokenUrl);
	oReq.setRequestHeader("Authorization", tokenHeader);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send();
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}

	exports.index = function(req, res, next) {
		console.log("index");
		res.render('index', {
			title : config.appname,
			description : config.description
		});
	};

function score (wml_url, wml_username, wml_password, scoring_url, data, callback) {
	apiGet(wml_url, wml_username, wml_password,
		function (res) {
	        let parsedGetResponse;
	        try {
	            parsedGetResponse = JSON.parse(this.responseText);
	        } catch(ex) {
	            // TODO: handle parsing exception
	        }
	        if (parsedGetResponse && parsedGetResponse.token) {
	            const token = parsedGetResponse.token;
	            const wmlToken = "Bearer " + token;

							var payload = '{"values":[' + JSON.stringify(data) + ']}';

	            apiPost(scoring_url, wmlToken, payload, function (resp) {
	                let parsedPostResponse;
	                try {
	                    parsedPostResponse = JSON.parse(this.responseText);
	                } catch (ex) {
	                    // TODO: handle parsing exception
	                }
	                console.log("Scoring response");
	                console.log(parsedPostResponse);
									callback && callback(null, parsedPostResponse);
	            }, function (error) {
	                console.log(error);
	            });
	        } else {
	            console.log("Failed to retrieve Bearer token");
	        }
		}, function (err) {
			console.log(err);
		});
}

function split(arr, n) {
	var arr1 = [];
	for (var i = 0; i < arr.length; i++) {
		var ele = [];
		ele[0] = arr[i];
		arr1[i] = ele;
	}

	var res = [];
	while (arr1.length) {
		res.push(arr1.splice(0, n));
	}
	return res;
}

exports.predict = function(req, res, next) {
	console.log("predict");

	var wml_url = wml_credentials.get("url");
	var wml_username = wml_credentials.get("username");
	var wml_password =wml_credentials.get("password");

	var credential = req.body.credential;
	if (credential) {
		credential_input = JSON.parse(credential);
		wml_url = credential_input.url;
		wml_username = credential_input.username;
		wml_password = credential_input.password;
	}

	var scoringUrl = config.scoring_url;
	var scoringUrl_input = req.body.scoring_url;
	if (scoringUrl_input) {
		scoringUrl = scoringUrl_input;
		console.log("New scoring endpoint: ", scoringUrl);
	}

	var raw = req.body.content;
	var buffer = new Buffer(raw, 'base64');

	var sharp = require('sharp');

	sharp(buffer)
		.resize(28, 28)
  	.greyscale()
		.raw()
		.toBuffer(function(err, data) {
			var floatArray = []
			for (var i = 0; i < data.length; i++)	{
				floatArray[i] =  data[i] / 255;
			}

			var scoringData = split(floatArray, 28);
			var scoringUrl = config.scoring_url;

			score(wml_url, wml_username, wml_password, scoringUrl, scoringData, function (err, score) {
				var largest = Math.max.apply(Math, score.values[0]);
				var indexofLargest = score.values[0].indexOf(largest);
				var result = "[" + indexofLargest + "] (probability: " + largest + ")"

		    res.json({error: err, result: result});
			});
	});
};
