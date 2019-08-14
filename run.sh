if [ ! -d ./image-microservice ]; then
  if [ -x "$(command -v git)" ]; then
    echo "cloning repo..."
    git clone https://github.com/jgoralcz/image-microservice.git
    echo "done cloning repo..."
  else
    echo "You need to somehow clone the link to use it: https://github.com/jgoralcz/image-microservice"
  fi
fi
# enter our microservice
cd image-microservice || exit
# check for docker
if [ -x "$(command -v docker)" ]; then
  # check if container already exists
  if [ ! "$(docker ps -q -f name=container_mims)" ]; then
    # cleanup
    if [ "$(docker ps -aq -f status=exited -f name=container_mims)" ]; then
      docker rm container_mims
    fi
    # kill then clean up
    else
      docker kill container_mims
      docker rm container_mims
  fi
  docker build -t image_mims .
  docker run -d -p 9002:9002 -m 2GB --name container_mims image_mims
else
  echo "!!!!YOU MUST INSTALL DOCKER!!!!"
  echo "To install docker on debian or ubuntu: curl -sSL https://get.docker.com/ | bash"
fi

