## Handwritten Digit Image Recognition using Neural Nets

1. Create a neural nets training definition using the "Single Convolution layer on MNIST" sample in SPSS Modeler in IBM Watson Studio

The sample is to classify MNIST data - hand written digits. The data set consists of 60,000 training and 10,000 test examples of grayscale 28x28 images.

![](https://github.com/mlhubca/app/blob/master/ml-digit-pad/images/model.png)

2. Train and deploy the neural nets model in Experiment in Watson Studio

3. Use the "ml-digit-pad" app to score the model
  - Download this app
  - Configure the app with Watson Machine Learning service credential and the scoring endpoint of the deployed model
  - Star the app using CLI command "npm start" (assuming you already have node js environment setup.

![](https://github.com/mlhubca/app/blob/master/ml-digit-pad/images/pad.png)

### References
- Documentation for Experiments/Deep Learning etc: https://datascience.ibm.com/docs/content/analyze-data/xs-overview.html?context=analytics
