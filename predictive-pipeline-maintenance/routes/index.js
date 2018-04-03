var config = require('../lib/config');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

exports.index = function(req, res, next) {
  console.log("index");
  res.render('index', {
    title: config.appname,
    description: config.description
  });
};

exports.predict = function(req, res, next) {
  console.log("predict");
};

exports.upload = function(req, res, next) {
  console.log("upload");
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(422).json({
      error: 'The uploaded file must be an image'
    });
  }

  var image_file = req.file.path;
  console.log(image_file);

  var visual_recognition = new VisualRecognitionV3({
    version_date: '2016-05-20',
    api_key: config.service_credentials[0].api_key,
  });

  let parameters = {
    classifier_ids: [config.model_id],
    threshold: 0.6
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
       	result = response.images[0].classifiers[0].classes[0];
			} else {
				result = {"class": "Unknown", "score": 0};
			}
      result.file = req.file;

      return res.status(200).send(result);
    }
  });
};
