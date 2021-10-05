FROM ubuntu:18.04

ENV TZ=America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install --force-yes -yy
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

# node canvas
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

# webp support graphicsmagick
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:rwky/graphicsmagick -y && apt-get update -y && apt-get install graphicsmagick -y 
RUN apt-get install libgraphicsmagick3 -y
RUN apt-get update -y && apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat

# imagemagick
RUN apt-get update -y && apt-get install -y imagemagick

# the following is taken from: https://github.com/lovell/sharp/issues/955
RUN apt-get update -y && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*

# libjasper-dev
RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" | tee /etc/apt/sources.list.d/xenial.list
RUN apt update && apt install libjasper1 libjasper-dev -y
RUN rm /etc/apt/sources.list.d/xenial.list
RUN apt update

RUN apt-get update && apt-get install -y \ 
  wget \
  build-essential \ 
  cmake \ 
  git \
  unzip \ 
  pkg-config \
  python-dev \ 
  python-opencv \ 
  libopencv-dev \ 
  ffmpeg  \ 
  libpng-dev \ 
  libtiff-dev \ 
  libjasper-dev \ 
  libgtk2.0-dev \ 
  python-numpy \ 
  python-pycurl \ 
  libatlas-base-dev \
  gfortran \
  webp \ 
  python-opencv \ 
  qt5-default \
  libvtk6-dev \ 
  zlib1g-dev

RUN apt-get clean

# Install Open CV - Warning, this takes absolutely forever
RUN mkdir -p ~/opencv cd ~/opencv && \
  wget https://github.com/Itseez/opencv/archive/3.0.0.zip && \
  unzip 3.0.0.zip && \
  rm 3.0.0.zip && \
  mv opencv-3.0.0 OpenCV && \
  cd OpenCV && \
  mkdir build && \ 
  cd build && \
  cmake \
  -DWITH_QT=ON \ 
  -DWITH_OPENGL=ON \ 
  -DFORCE_VTK=ON \
  -DWITH_TBB=ON \
  -DWITH_GDAL=ON \
  -DWITH_XINE=ON \
  -DBUILD_EXAMPLES=ON .. && \
  make -j4 && \
  make install && \ 
  ldconfig

CMD ["/bin/bash"]


