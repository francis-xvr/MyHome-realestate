import { createApp } from 'vue/dist/vue.esm-bundler.js'
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js';

// let raycaster = null;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let controls = null;
let personObject = null;
let personHeight = 5.5;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const initVtourApp = function(){
    const app = createApp(
        {props:[]},
        {}
    );
    app.component('virtualtourpage',{
        props:[],
        data(){
            return{
                bulbs:[],
            }
        },
        mounted(){
            this.dom = document.getElementById("virtualTourContainer");
            this.initViewer2();
            const instructions = document.getElementById( 'vtourInstructions' );
            instructions.style.display = 'none';
            const loadInstructions = document.getElementById( 'loadInstructions' );
            loadInstructions.style.display = '';
        },
        methods:{
            bgLoadComplete(texture){
                this.skybox = new GroundProjectedSkybox( texture );
				this.skybox.scale.setScalar( 40 );
                this.skybox.position.y = -10;
                this.skybox.height = 100;
				this.scene.add( this.skybox );
                this.skybox.visible = true;
            },
            gltfCeilingLoaded(gltf){
                gltf.scene.position.y = 0;
                gltf.scene.scale.set(2,2,2);
                gltf.scene.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }});
                this.scene.add(gltf.scene);
            },
            stage3Loaded(gltf){
                gltf.scene.position.y = 0;
                gltf.scene.scale.set(2,2,2);
                gltf.scene.traverse(function(child) {
                    if (child.isMesh) {
                        if(!child.name.toLowerCase().includes("ventana_") ){
                            child.castShadow = true;   
                        }
                        child.receiveShadow = true;
                        child.material.needsUpdate = true;
                        if (child.material.bumpMap) {
                        child.material.bumpMap.needsUpdate = true;
                        child.material.bumpScale = 1;
                        }
                        if (child.material.normalMap) {
                            child.material.normalMap.needsUpdate = true;
                        }
                        if(child.material.roughnessMap){
                            child.material.roughnessMap.needsUpdate = true;
                        }
                    }

                });
                this.scene.add(gltf.scene);
            },
            stage2Loaded(gltf){
                gltf.scene.position.y = 0;
                gltf.scene.scale.set(2,2,2);
                gltf.scene.traverse(function(child) {
                    if (child.isMesh) {
                        if(!child.name.toLowerCase().includes("ventana_") ){
                            child.castShadow = true;   
                        }
                        child.receiveShadow = true;
                        child.material.needsUpdate = true;
                        if (child.material.bumpMap) {
                        child.material.bumpMap.needsUpdate = true;
                        child.material.bumpScale = 1;
                        }
                        if (child.material.normalMap) {
                            child.material.normalMap.needsUpdate = true;
                        }
                        if(child.material.roughnessMap){
                            child.material.roughnessMap.needsUpdate = true;
                        }
                    }

                });
                this.scene.add(gltf.scene);
                this.loader.load( './assets/model/stage3Models.glb', this.stage3Loaded);
            },
            gltfLoadPerson(gltf){
                gltf.scene.position.y = 0;
                gltf.scene.scale.set(2,2,2);
                gltf.scene.traverse((child)=>{
                    if (child.isMesh) {
                            child.castShadow = true;   
                    }
                });
                personObject = gltf.scene;
                this.scene.add(gltf.scene);
                controls.camera.add(personObject);
                personObject.position.set(0,personHeight*-1,2);
            },
            gltfLoaded(gltf){
                this.createFloor();
                new THREE.TextureLoader().load( './assets/model/sky7.jpg', this.bgLoadComplete );
                this.loader.load( './assets/model/ceiling.glb', this.gltfCeilingLoaded);
                gltf.scene.position.y = 0;
                gltf.scene.scale.set(2,2,2);
                gltf.scene.traverse((child)=>{
                    if (child.isMesh) {
                        if(!child.name.toLowerCase().includes("ventana_") ){
                            child.castShadow = true;   
                        }
                        child.receiveShadow = true;
                        child.material.needsUpdate = true;
                        if (child.material.bumpMap) {
                        child.material.bumpMap.needsUpdate = true;
                        child.material.bumpScale = 1;
                        }
                        if (child.material.normalMap) {
                            child.material.normalMap.needsUpdate = true;
                        }
                        if(child.material.roughnessMap){
                            child.material.roughnessMap.needsUpdate = true;
                        }
                    }

                });
                this.scene.add(gltf.scene);
                this.addLights();
                this.loader.load( './assets/model/stage2Models.glb', this.stage2Loaded);
                this.loader.load( './assets/model/modelPerson.glb', this.gltfLoadPerson);
                this.startRendering();

            },
            addLights(){
                const mainLightColor = 0xfffff5;
				this.bulbLight = new THREE.PointLight( mainLightColor, 1, 10, 0.9 );
                const bulbGeometry = new THREE.CylinderGeometry( 1,1,1,32,1,false);
				const bulbMat = new THREE.MeshStandardMaterial( {
					emissive: 0xfffff5,
					emissiveIntensity: 1,
					color: 0xfffff5
				} );
                const bulbMesh = new THREE.Mesh( bulbGeometry, bulbMat );
                bulbMesh.scale.set(0.25,0.1,0.25);
				this.bulbLight.add( bulbMesh);

                const bHeight = 8.8;
				this.bulbLight.position.set( -5.908, bHeight, -4.430 );
	            this.bulbLight2 = this.bulbLight.clone();
                this.bulbLight.shadow.bias = -0.01;
                this.bulbLight2.position.set( -5.883, bHeight, 5.373 );
                this.bulbLight2.shadow.bias = -0.01;

                this.bulbLight3 = this.bulbLight.clone();
                this.bulbLight3.position.set( 4.114, bHeight, 5.365 );

                this.bulbLight4 = this.bulbLight.clone();
                this.bulbLight4.position.set( 4.12, bHeight, -4.421 );

                this.bulbLight5 = this.bulbLight.clone();
                this.bulbLight5.position.set( 4.15, bHeight, -12.4 );

				this.scene.add( this.bulbLight );
				this.scene.add( this.bulbLight2 );
				this.scene.add( this.bulbLight3 );
				this.scene.add( this.bulbLight4 );
				this.scene.add( this.bulbLight5 );

                const spotHeight = 8.3;
                this.spotLight1 = new THREE.SpotLight(mainLightColor, 5);
                this.spotLight1.castShadow = true;
                this.spotLight1.shadow.bias = -0.005;
				this.spotLight1.shadow.mapSize.height = 2048*2;
				this.spotLight1.shadow.mapSize.width = 2048*2;
                this.spotLight1.angle = Math.PI/2.1;
                this.spotLight1.penumbra = 0.9;
                this.spotLight1.decay = 1;
                this.spotLight1.distance = 20;
                this.spotLight1.position.set( -5.9, spotHeight, -4.4 );
                this.spotLight1.target.position.set(-5.9, 0, -4.4);

                this.spotLight2 = this.spotLight1.clone();
                this.spotLight2.position.set( -5.8, spotHeight, 5.36 );
                this.spotLight2.target.position.set(-5.8, 0, 5.36);

                this.spotLight3 = this.spotLight1.clone();
                this.spotLight3.position.set( 4.12, spotHeight, 5.3 );
                this.spotLight3.target.position.set(4.12, 0, 5.3);

                this.spotLight4 = this.spotLight1.clone();
                this.spotLight4.position.set( 4, spotHeight, -4.4 );
                this.spotLight4.target.position.set(4, 0, -4.2);
                const helper1 = new THREE.SpotLightHelper(this.spotLight1);
                const helper2 = new THREE.SpotLightHelper(this.spotLight2);
                const helper3 = new THREE.SpotLightHelper(this.spotLight3);
                const helper4 = new THREE.SpotLightHelper(this.spotLight4);
                // this.scene.add(helper1);
                // this.scene.add(helper2);
                // this.scene.add(helper3);
                // this.scene.add(helper4);

                // this.spotLight2.castShadow = true;
                // this.spotLight3.castShadow = true;
                // this.spotLight4.castShadow = true;
                this.scene.add(this.spotLight1);
                this.scene.add(this.spotLight2);
                this.scene.add(this.spotLight3);
                this.scene.add(this.spotLight4);

                RectAreaLightUniformsLib.init();

                this.rectLight1 = new THREE.RectAreaLight( 0xffffa0, 10, 0.3, 4.5 );
				this.rectLight1.position.set( -1.29, 7.03, -13.4 );
                this.rectLight1.lookAt( -1.29, 0, -13.4 );
				this.scene.add( this.rectLight1 );
                this.scene.add( new RectAreaLightHelper( this.rectLight1 ) );

                this.rectLight2 = new THREE.RectAreaLight( 0xffffa0, 8, 8,0.1 );
				this.rectLight2.position.set( 4.178, 6.2, -18 );
                this.rectLight2.lookAt( 4.178, 0, -18 );
				this.scene.add( this.rectLight2 );
                this.scene.add( new RectAreaLightHelper( this.rectLight2 ) );

                this.rectLight3 = new THREE.RectAreaLight( 0xffffa0, 8, 0.1, 7.6 );
				this.rectLight3.position.set( 8.7, 6.2, -13.95 );
                this.rectLight3.lookAt( 8.7, 0, -13.95 );
				this.scene.add( this.rectLight3 );
                this.scene.add( new RectAreaLightHelper( this.rectLight3 ) );

                const instructions = document.getElementById( 'vtourInstructions' );
                instructions.style.display = '';
                const loadInstructions = document.getElementById( 'loadInstructions' );
                loadInstructions.style.display = 'none';

            },
            createFloor(){
                const floorMat = new THREE.MeshStandardMaterial( {
					roughness: 0.9,
					color: 0xffffff,
					metalness: 0.1,
					bumpScale: 0.05
				} );
                const textureLoader = new THREE.TextureLoader();
				textureLoader.load( './assets/images/hardwood2_diffuse.jpg', function ( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 3.5,16 );
					map.colorSpace = THREE.SRGBColorSpace;
					floorMat.map = map;
					floorMat.needsUpdate = true;

				} );
				textureLoader.load( './assets/images/hardwood2_bump.jpg', function ( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 3.5,16 );
					floorMat.bumpMap = map;
                    floorMat.bumpScale = 0.05;
					floorMat.needsUpdate = true;

				} );
				textureLoader.load( './assets/images/hardwood2_roughness.jpg', function ( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 10;
					map.repeat.set( 3.5,16 );
					floorMat.roughnessMap = map;
					floorMat.needsUpdate = true;

				} );
                floorMat.needsUpdate = true;
                const floorGeometry = new THREE.PlaneGeometry( 35, 35 );
				const floorMesh = new THREE.Mesh( floorGeometry, floorMat );
				floorMesh.receiveShadow = true;
				floorMesh.rotation.x = - Math.PI / 2.0;
                floorMesh.position.x = -6;
                floorMesh.position.z = -6.5;
				this.scene.add( floorMesh );
            },
            initViewer2(){
                this.canvasWidth = this.dom.getBoundingClientRect().width;
                this.canvasHeight = this.dom.getBoundingClientRect().height;
                this.renderer = new THREE.WebGLRenderer({antialias:true});
                this.scene = new THREE.Scene();
                this.renderer.setSize(this.canvasWidth, this.canvasHeight);
                this.renderer.setPixelRatio( window.devicePixelRatio );
                this.renderer.shadowMap.enabled = true;

                this.renderer.toneMapping = THREE.CineonToneMapping;
                this.renderer.toneMappingExposure=1;
                
                this.dom.append(this.renderer.domElement);
                this.camera = new THREE.PerspectiveCamera(60, this.canvasWidth/this.canvasHeight,0.1,100);
                this.camera.position.z = 6
                this.camera.position.x = -8;
                this.camera.position.y = personHeight;
                this.camera.lookAt(0,4,0);
                // this.camera.zoom = 5;
                // this.controls = new OrbitControls(this.camera,  this.renderer.domElement);

                // this.scene.add( new THREE.HemisphereLight( 0xfafaff, 0x444444, 5 ) );
                this.scene.add( new THREE.AmbientLight(0xf0e0e0, 0.2) );
                const sun = new THREE.DirectionalLight( 0xf0c0a0, 2 );
                sun.position.set( -7, 3, 15 );
                sun.target.position.set(0,0,5);
                sun.castShadow = true;
                sun.shadow.mapSize.width = 2048*2;
				sun.shadow.mapSize.height = 2048*2;
				const d = 50;
				sun.shadow.camera.left = - d;
				sun.shadow.camera.right = d;
				sun.shadow.camera.top = d;
				sun.shadow.camera.bottom = - d;
				sun.shadow.camera.far = 3500;
				sun.shadow.bias = - 0.0001;

                this.scene.add( sun );
                // const helper = new THREE.DirectionalLightHelper( sun, 5 );
                // helper.castShadow = false;
                // this.scene.add( helper );
                this.loader = new GLTFLoader();
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('./libs/draco/');
                this.loader.setDRACOLoader( dracoLoader );
                this.loader.load( './assets/model/stage1Models.glb', this.gltfLoaded);
              
                this.movement();
            },
            movement(){
                controls = new PointerLockControls( this.camera, document.body );
				const blocker = document.getElementById( 'vtourBlocker' );
				const instructions = document.getElementById( 'vtourInstructions' );

				instructions.addEventListener( 'click', function () {

					controls.lock();

				} );

				controls.addEventListener( 'lock', function () {

					instructions.style.display = 'none';
					blocker.style.display = 'none';

				} );

				controls.addEventListener( 'unlock', function () {

					blocker.style.display = 'block';
					instructions.style.display = '';

				} );

				this.scene.add( controls.camera );

				const onKeyDown = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = true;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = true;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = true;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = true;
							break;

						// case 'Space':
						// 	if ( canJump === true ) velocity.y += 350;
						// 	canJump = false;
						// 	break;
					}
				};
				const onKeyUp = function ( event ) {
					switch ( event.code ) {
						case 'ArrowUp':
						case 'KeyW':
							moveForward = false;
							break;
						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = false;
							break;
						case 'ArrowDown':
						case 'KeyS':
							moveBackward = false;
							break;
						case 'ArrowRight':
						case 'KeyD':
							moveRight = false;
							break;
					}
				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );

                // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, 0, -1 ), 0, 1 );

            },
            
            startRendering(){
                console.log(controls);
                console.log(controls.camera);
                this.renderer.setAnimationLoop(this.animate);
            },
            movecontrol(){
                const time = performance.now();

				if ( controls.isLocked === true ) {
					const delta = ( time - prevTime ) / 1000;
                    // console.log(controls.camera.rotation);

					velocity.x -= velocity.x * 50 * delta;
					velocity.z -= velocity.z * 50 * delta;

					// velocity.y -= 9.8 * 200.0 * delta; // 100.0 = mass

					direction.z = Number( moveForward ) - Number( moveBackward );
					direction.x = Number( moveRight ) - Number( moveLeft );
					direction.normalize(); // this ensures consistent movements in all directions

					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400 * delta;

					controls.moveRight( - velocity.x * delta );
					controls.moveForward( - velocity.z * delta );
                    
					controls.camera.position.y += ( velocity.y * 0.05* delta );

					// if ( controls.camera.position.y < personHeight ) {
					// 	velocity.y = 0;
					// 	controls.camera.position.y = personHeight;
					// 	canJump = true;
					// }
                    if ( controls.camera.position.x < -8 || controls.camera.position.x > 8) {
                        velocity.x=0;
                        controls.camera.position.x = 8 * (controls.camera.position.x/Math.abs(controls.camera.position.x));
                    }
                    if ( controls.camera.position.z < -17){
                        velocity.z=0;
                        controls.camera.position.z = -17 
                    } if( controls.camera.position.z > 7) {
                        velocity.z=0;
                        controls.camera.position.z = 7 
                    }
                    // personObject.position.x =controls.camera.position.x + (direction.x*1);
                    // personObject.position.z =controls.camera.position.z + (direction.z*1);
				}

				prevTime = time;
            },
            animate(){
                this.movecontrol();
				this.renderer.render( this.scene, this.camera );
            },
        },
        template:`
            <div id="virtualTourContainer">
            	<div id="vtourBlocker">
                    <div id="loadInstructions">
                        <p style="font-size:36px">
                            Please wait...
                        </p>
                    </div>
                    <div id="vtourInstructions">
                        <p style="font-size:36px">
                            Click to Walk through!
                        </p>
                        <p>
                            Move: WASD<br/>
                            Jump: SPACE<br/>
                            Look: MOUSE
                        </p>
                    </div>
		        </div>
            </div>
        `
    });
    
    return app;
};

export {initVtourApp};