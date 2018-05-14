var config = require('../lib/config');
var utils = require('../lib/utils');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const wml_credentials = new Map();

const modelInfo = require('../config/model.json');
const schema = modelInfo['model-schema'].map(obj => obj.name);
const products = modelInfo['model-input'];

wml_credentials.set("url", config.wml_credentials[0].url);
wml_credentials.set("username", config.wml_credentials[0].username);
wml_credentials.set("password", config.wml_credentials[0].password);

function apiGet(url, username, password, loadCallback, errorCallback) {
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

function apiPost(scoring_url, token, payload, loadCallback, errorCallback) {
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
    title: config.appname,
    description: config.description,
    products: products,
    schema: schema
  });
};

function score(wml_url, wml_username, wml_password, scoring_url, data, callback) {
  apiGet(wml_url, wml_username, wml_password,
    function(res) {
      let parsedGetResponse;
      try {
        parsedGetResponse = JSON.parse(this.responseText);
      } catch (ex) {
        // TODO: handle parsing exception
      }
      if (parsedGetResponse && parsedGetResponse.token) {
        const token = parsedGetResponse.token;
        const wmlToken = "Bearer " + token;

				//console.log(token);

				console.log(scoring_url);

        apiPost(scoring_url, wmlToken, data, function(resp) {
          let parsedPostResponse;
          try {
            parsedPostResponse = JSON.parse(this.responseText);
          } catch (ex) {
            // TODO: handle parsing exception
          }
          console.log("Scoring response");
          console.log(parsedPostResponse);
          callback && callback(null, parsedPostResponse);
        }, function(error) {
          console.log(error);
        });
      } else {
        console.log("Failed to retrieve Bearer token");
      }
    },
    function(err) {
      console.log(err);
    });
}

function compare(a,b) {
  if (a.score < b.score)
    return 1;
  if (a.score > b.score)
    return -1;
  return 0;
}

exports.predict = function(req, res, next) {
  console.log("predict");

  var wml_url = wml_credentials.get("url");
  var wml_username = wml_credentials.get("username");
  var wml_password = wml_credentials.get("password");

  var scoringUrl = config.scoring_url;
	var product_id = req.body.product_id;

	let scoringData = JSON.stringify({
		values: [products[product_id].features],
		fields: schema
	});

  score(wml_url, wml_username, wml_password, scoringUrl, scoringData, function(err, score) {

		var result = [];

		var index = score.fields.indexOf('probability');
		var probability = score.values[0][index];

		index = score.fields.indexOf('nodeADP_classes');
    var nodeADP_classes = score.values[0][index];

    for (var i = 0; i < score.values[0][index].length; i++) {
      let item = {};
      item["class"] = nodeADP_classes[i];
      item["score"] = probability[i];

      result.push(item);
    }

    result.sort(compare);
		console.log(result);

    res.json({
      error: err,
      result: result
    });
  });
};
