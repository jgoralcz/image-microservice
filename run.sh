if [ ! -d ./src ]; then
  cd ..
  if [ -x "$(command -v git)" ]; then
    echo "cloning repo..."
    git clone https://github.com/jgoralcz/image-microservice.git
    # enter our microservice
    cd image-microservice || exit
    echo "done cloning repo..."
  else
    echo "You need to clone the repo to use this microservice: https://github.com/jgoralcz/image-microservice"
  fi
fi
ls
# check for docker
if [ -x "$(command -v docker)" ]; then
  # check if container already exists
  if [ ! "$(docker ps -q -f name=container_mims)" ]; then
    # cleanup
    if [ "$(docker ps -aq -f status=exited -f name=container_mims)" ]; then
      echo "removing previous container mims containers..."
      docker rm container_mims
    fi
    # kill then clean up
    else
      echo "cleaning previous container mims containers..."
      docker kill container_mims
      docker rm container_mims
  fi
  docker build -t image_mims .
  docker run -d -p 9002:9002 -m 2GB --name container_mims image_mims
else
  echo "!!!!YOU MUST INSTALL DOCKER!!!!"
  echo "To install docker on debian or ubuntu: curl -sSL https://get.docker.com/ | bash"
fi

