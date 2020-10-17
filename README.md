# Manipulating Images Microservice (MIMS) v2
A microservice API to process images using Node.js (although you shouldn't really use Node for processing images).
This microservice uses about 500mb of ram when starting out and can be up to 900mb or more due to the number of requests you have.
A default of 3 processes is created (see `config.json`). Processes are indeed heavy. Only create more if you really need the concurency. 
You may need fewer or more depending on your use case. If that's the case then you must specify that when running
docker by changing the number of processes in your `config.json` file.

If your node version is less than 11.5 you must use `node --experimental-worker app.js` and install the 1 million dependencies (**use the Dockerfile and Docker!**)

**You can test a live instance here (you get a max of 10 requests per minute): `beta-mims.bongo.best`**

#### This microservice mainly uses:
`Jimp@latest` - oof this is bad \
`node-canvas@latest` \
`Sharp@latest`
`gm@latest`

___

### Installation
To install docker on linux: `curl -sSL https://get.docker.com/ | bash` \
Otherwise, look it up.

To build and run it I do something like so: \
`git clone https://github.com/jgoralcz/image-microservice` \
`cd image-microservice` \
`docker build -t mims .` \
`docker run -d -p 8443:8443 --restart=always --memory="2048m" --name mims mims`

___

### How To Use
To use this microservice you must make a POST request to the provided endpoints and make sure you have
the correct `args` provided. In other words, look into each file under `/src/endpoints` and look at the structure.

1) The `name` is the endpoint.
2) The `filepath` is the location of the file I use to read in the buffer (you don't need to worry about this unless making your own).
3) The `args` are the list of arguments that **MUST** be met in order to process your image. Otherwise you will get a `400 bad request`.
4) You will receive back a buffer of the image if success. Otherwise error messages will be returned.

### Examples

I use this with `request-promise`.
```$xslt
options = {
    method: 'POST',
    uri: 'http://localhost:9002/api/' + endpoint, //endpoint is the image (see below)
    encoding: null,
    headers: {
        'Content-type': 'application/json'
    },
    body: body,
    json: true
};
```
If you do not want a buffer and want a string (say the `ascii` endpoint), set your options to
```$xslt
const options =  {
    method: 'POST',
    uri: 'http://localhost:9002/api/ascii',
    body: body,
    json: true
};
```
_____
**Here are some examples with the body.**

1) The `hot` endpoint requires the `image_url` \
localhost:9002/api/hot
    ```$xslt
    POST /api/hot HTTP/1.1
    Host: localhost:9002
    Content-Type: application/json
    
    {"image_url": "https://pbs.twimg.com/media/DtwaeFtUwAAPbxk.jpg"}
    ```

2) The `hatkidsays` endpoint requires text \
localhost:9002/api/hatkidsays
    ```$xslt
    POST /api/hatkidsays HTTP/1.1
    Host: localhost:9002
    Content-Type: application/json
    
    {"text": "Make sure you brush your teeth!"}
    ```
3) The `halloweenify` endpoint requires an image url and a threshold. \
localhost:9002/api/halloweenify

    ```$xslt
    POST /api/halloweenify HTTP/1.1
    Host: localhost:9002
    Content-Type: application/json

    {"image_url": "https://pbs.twimg.com/media/DtwaeFtUwAAPbxk.jpg", "threshold": "1"}
    ```

___

## Pull Requests
If you would like to add your own fun creation, feel free to make a pull request!
My only request is to follow the current structure that is provided and make sure the endpoint is appropriate.


