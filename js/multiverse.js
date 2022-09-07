/**
 * 
 * Basic Scene Init
 * @author Sajith Amma
 * 
 */



class Multiverse {


    //To setup a multiverse under a html DOM
    constructor(DOM, RGB = true) {

        this.basicSceneSetup(DOM, RGB);

        window.addEventListener('resize', this.onWindowResize);

        //Handle click in any object
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.objectClickCallbacks = [];
        //handle click ends


        document.addEventListener('mousemove', this.onDocumentMouseMove, false);

    }



    //init basic scenes, camera, light
    basicSceneSetup = (DOM, RGB) => {


        //Initlaise default camera, we don't use this.
        this.camera = new THREE.PerspectiveCamera();

        //Init our scene
        this.scene = new THREE.Scene();

        //default light color
        this.lightColor = 0xffffff;

        //Bring  light
        this.light = new THREE.PointLight(this.lightColor, 1.2);

        this.GLTFLoader = new THREE.GLTFLoader();

        //Set up the renderor
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure = 1;

        if (RGB)
            this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.renderer.shadowMap.enabled = true;

        this.scene.add(this.light);


        //init controls and DOM
        this.controls = false;
        this.DOM = DOM;

        this.attachDom(this.DOM);

        this.run();

    }

    //Resize the canvas and camera based on window resize.
    onWindowResize = () => {

        this.camera.aspect = this.DOM.offsetWidth / this.DOM.offsetHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.DOM.offsetWidth, this.DOM.offsetHeight);

        this.run();
    }

    /** Function to handle click event in any object */
    onDocumentMouseDown = (event) => {

        event.preventDefault();

        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.scene.children);

        for (var i = 0; i < intersects.length; i++) {

            //intersects[i].object.material.color.set(0xff0000);
            //console.log(intersects[i].object.name);

            if (this.objectClickCallbacks[intersects[i].object.name]) {

                this.objectClickCallbacks[intersects[i].object.name]();
            }

            //Write click handler here to decide what to do on each object click.
        }

        this.run();

    }

    /** Function to handle click event in any object */
    onDocumentMouseMove = (event) => {

        event.preventDefault();

        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.scene.children);

        for (var i = 0; i < intersects.length; i++) {

            //intersects[i].object.material.color.set(0xff0000);

            if (this.objectClickCallbacks[intersects[i].object.name]) {

                document.body.style.cursor = "pointer";


            } else {

                document.body.style.cursor = "auto";
            }

            //Write click handler here to decide what to do on each object click.
        }

        this.run();

    }


    //To register a callback function on any object click with object name
    registerClickCallback = (objectName, callback) => {

        this.objectClickCallbacks[objectName] = callback;

    }

    //To change the light color
    changeLightColor = (color) => {

        this.light.color = new THREE.Color(color);
    }

    loadHDR = (filename, path) => {


        this.RGBE = new THREE.RGBELoader();

        this.RGBE.setPath(path);

        this.RGBE.load(filename, (texture, textureData) => {


            texture.mapping = THREE.EquirectangularReflectionMapping;

            this.scene.background = texture;
            this.scene.environment = texture;

            this.run();

        });

    }

    loadGltf = (filename, path, options, callback = () => { }) => {


        this.GLTFLoader.setPath(path)



        this.GLTFLoader.load(

            filename,

            //Loading success
            (gltf) => {



                this.gltf = gltf;
                this.scene.add(this.gltf.scene);
                this.run();


                //to save all camera reference from the GLTF
                this.gltfCameras = [];

                for (let i = 0; i < gltf.cameras.length; i++) {

                    let attachedCamera = gltf.cameras[i];
                    let gltfCamera = new THREE.PerspectiveCamera();

                    //For every camera, copy the info and copy to new camera

                    //gltfCamera.position.copy(attachedCamera.parent.position);
                    gltfCamera.position.x = attachedCamera.parent.position.x;
                    gltfCamera.position.y = attachedCamera.parent.position.y;
                    gltfCamera.position.z = attachedCamera.parent.position.z;

                    gltfCamera.filmGauge = attachedCamera.filmGauge;
                    gltfCamera.focus = attachedCamera.focus;
                    gltfCamera.aspect = attachedCamera.aspect;

                    gltfCamera.fov = attachedCamera.fov;
                    gltfCamera.far = attachedCamera.far;
                    gltfCamera.near = attachedCamera.near;
                    gltfCamera.up.copy(attachedCamera.up);


                    gltfCamera.updateProjectionMatrix();

                    this.gltfCameras.push(gltfCamera);
                }


                //IF swithc camera is enabled, set the first camera as the default
                if (options.switchCamera && this.gltfCameras.length > 0) {

                    this.switchCamera(this.gltfCameras[0]);

                }

                callback();


            },

            //progress function
            (xhr) => {

                //console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            }
            ,

            //load error
            (error) => {

                console.log(error);
            }
        )

    }


    //Connect 3D world to HTML as canvas
    attachDom = (DOM) => {

        this.DOM = DOM;
        this.renderer.setSize(DOM.offsetWidth, DOM.offsetHeight);
        DOM.appendChild(this.renderer.domElement);


    }

    //To run the multiverse world
    run = () => {

        this.animate();


    }

    animate = () => {

        requestAnimationFrame(this.animate);

        TWEEN.update();

        if (this.controls)
            this.controls.update();


        this.renderer.render(this.scene, this.camera);

    }

    enableOrbitControl = () => {

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    setupDefaultCamera = (options) => {


        this.camera.fov = options.fov || 45;
        this.camera.aspect = options.aspectratio || this.DOM.offsetWidth / this.DOM.offsetHeight;
        this.camera.near = options.near || 0.25;
        this.camera.far = options.far || 20;

        if (options.position) {
            this.camera.position.set(

                options.position.x || 1,
                options.position.y || 1,
                options.position.z || 1);
        }

        this.camera.updateProjectionMatrix();

    }

    switchCamera = (nextCamera) => {

        this.camera = nextCamera;
        this.camera.updateProjectionMatrix();
        this.enableOrbitControl();

        this.run();
    }


    tweenCameraPosition = (camera, position, duration) => {

        new TWEEN.Tween(camera.position).to({
            x: position[0],
            y: position[1],
            z: position[2]
        }, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    tweenCameraRotation = (camera, rotation, duration) => {

        new TWEEN.Tween(camera.rotation).to({
            x: rotation[0],
            y: rotation[1],
            z: rotation[2]
        }, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    /**
     * Get all screenable mesh, based on a string prefix or suffix
     */
    retrieveScreenMeshs = (identifier = 'Screen', identifier_type = 'prefix') => {

        this.screens = [];

        //Iterate all child
        this.gltf.scene.traverse((child) => {


            if (child instanceof THREE.Mesh) {

                //Match the screen name with prefix

                if (identifier_type == 'prefix') {

                    if (child.name.startsWith(identifier)) {

                        this.screens.push(child);
                    }
                }
                else if (identifier_type == "suffix") {

                    if (child.name.endsWith(identifier)) {

                        this.screens.push(child);
                    }
                }

                else if (identifier_type == "exact") {

                    if (child.name == (identifier)) {

                        this.screens.push(child);
                    }
                }



            }


        });

        return this.screens;
    }


    //To assign a video texture to a screen mesh
    assignVideoTexture = (screenMesh, videoDom, repeat = false, offset = false) => {

        let texture = new THREE.VideoTexture(videoDom);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        if (repeat)
            texture.repeat.set(repeat.x, repeat.y);

        if (offset) {
            texture.offset.x = offset.x;
            texture.offset.y = offset.y;
        }


        let material = new THREE.MeshLambertMaterial({

            map: texture,
            side: THREE.DoubleSide,

        });

        screenMesh.material = material;
        videoDom.play();
        this.run();


    }

    assignImageTexture = (screenMesh, imageSrc, type = "url") => {


        let loader = new THREE.TextureLoader();
        let texture = loader.load(imageSrc);

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;


        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;


        let material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, });
        screenMesh.material = material;
        this.run();


    }

}




