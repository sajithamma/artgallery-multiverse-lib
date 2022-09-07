# 3D gallery using THREEJS with Multiverse Library
## Using a GLB file, get all image position and map html image to 3D canvas

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://github.com/sajithamma)


# Screenshot
![alt Screenshot](/screenshot.gif)

```javascript

let multiverse = new Multiverse(document.body, false);
multiverse.setupDefaultCamera({ position: { x: 1, y: 1, z: 1 } });
multiverse.enableOrbitControl();
multiverse.loadHDR('royal_esplanade_1k.hdr', '/assets/');
multiverse.loadGltf('art.glb', '/assets/', { switchCamera: true }, ()=>{
multiverse.retrieveScreenMeshs("Picture");
mapAllImages(multiverse);

```

# How to Run

It is plain html, it should work if you just open in browser.

However recommended any of the following.

## Run using http-server npm package https://www.npmjs.com/package/http-server

```bash

npm install --global http-server
http-server

```
## Using live-server https://www.npmjs.com/package/live-server

```bash

npm install --global live-server
live-server

```

### Or using Python SimpleHTTPServer (Google it)








