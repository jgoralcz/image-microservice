# Manipulating Images Microservice (MIMS)
A microservice API to process images using Node.js (although you shouldn't really use Node for processing images).
This microservice uses about 500mb of ram when starting out and can be up to 900mb or more due to the number of requests you have.
A default of 3 processes is created. Processes are indeed heavy. Only create more if you really need the concurency. 
As a result, we are patiently waiting for both sharp and node-canvas to support worker-threads. 
You may need fewer or more depending on your use case. If that's the case then you must specify that when running
docker by inputting a number. Example (in the dockerfile): `CMD ["node", "./src/server.js", "10"]` will spawn 10 child processes
 (hopefully worker threads in the future).

If your node version is less than 11.5 you must use `node --experimental-worker app.js` (unless you use the dockerfile)

#### This microservice mainly uses:
`Jimp@latest` - oof this is bad \
`node-canvas@latest` \
`Sharp@latest`

___

### Installation
To install docker on linux: `curl -sSL https://get.docker.com/ | bash`
Otherwise, look it up.

To build and run it I do something like so: \
`git clone https://github.com/jgoralcz/image-microservice`
`cd image-microservice`
`docker build -t image_mims .` \
`docker run -d -p 9002:9002 --restart=always --memory="2048m" --name container_mims image_mims`

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

___

## After thoughts: 
Processes are more or less a hack due to node-canvas not support worker threads.
I previously used worker threads, but I seriously do not like Jimp anymore due to its flaws.
Canvas and Sharp are much faster (maybe 200% faster?).
If you have the option in the future (when worker threads are hopefully supported by canvas), use canvas.
Canvas (and Sharp) do not block the thread and use an external library to process images, making it much faster.
As a result, the next steps are to wait for worker threads. Modifying the code wouldn't be that much work, it's just a
waiting game until these libraries support it. We would save about 1/3 ram usage.


