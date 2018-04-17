var config = require('../lib/config');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

const modelInfo = require('../config/model.json');
const products = modelInfo['model-input'];

exports.index = function(req, res, next) {
  console.log("index");

  res.render('index', {
    title: config.appname,
    description: config.description,
    products: products
  });
};

function compare(a,b) {
  if (a.score < b.score)
    return 1;
  if (a.score > b.score)
    return -1;
  return 0;
}

exports.predict = function(req, res, next) {
  console.log("predict");

  var product_id = req.body.product_id;
  var image_file = "." + products[product_id].img;

  var visual_recognition = new VisualRecognitionV3({
    version_date: '2016-05-20',
    api_key: config.service_credentials[0].api_key,
  });

  let parameters = {
    classifier_ids: [config.model_id],
    threshold: 0
  };

  var params = {
    images_file: fs.createReadStream(image_file),
    parameters: parameters
  };

  visual_recognition.classify(params, function(err, response) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    } else {
      console.log(JSON.stringify(response, null, 2));
			let result;
			if (response.images[0].classifiers[0].classes.length > 0) {
       	result = response.images[0].classifiers[0].classes;
			} else {
				result = {"class": "Unknown", "score": 0};
			}

      result.sort(compare);
      console.log(result);
      return res.status(200).send(result);
    }
  });
};
