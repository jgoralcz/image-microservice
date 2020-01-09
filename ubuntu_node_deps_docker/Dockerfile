FROM ubuntu:14.04

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install --force-yes -yy
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs

# node canvas
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

# graphicsmagick
RUN apt-get update -y && apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat

# imagemagick
RUN apt-get update -y && apt-get install -y imagemagick

# the following is taken from: https://github.com/lovell/sharp/issues/955
RUN apt-get update -y && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*

# Change memory allocator to avoid "leaks"
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

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
  libav-tools  \ 
  libjpeg-dev \ 
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


