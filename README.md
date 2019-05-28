# image-microservice
a microservice api to process image using node js (although you shouldn't really use node for processing images)

If your node version is less than 11.5 you must use `node --experimental-worker index.js`

node-canvas version 1.6.13
Jimp@latest
Sharp@latest

To install docker on linux: `curl -sSL https://get.docker.com/ | bash`
Otherwise, look it up.


P.S.: Don't use jimp. Despite this microservice providing workers using jimp, canvas and sharp are much faster (maybe 40$ faster?).
If you have the option, use canvas.