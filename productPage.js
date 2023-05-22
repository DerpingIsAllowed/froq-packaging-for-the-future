import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Create a GLTFLoader instance to load GLTF models
const loader = new GLTFLoader();

// Declare some variables that will be used later
let perspectiveCamera, controls, scene, renderer, renderergbe, canvas;

// Initialize the scene
init();

// Start the animation loop
animate();

// Hide a canvas overlay on mouse down
const overlay = document.querySelector('.canvasOverlay');
console.log(overlay);
canvas.parentElement.parentElement.addEventListener('mousedown', () => {
  overlay.style.opacity = 0;
});

// The initialization function
function init() {

    // Get the canvas element
    canvas = document.getElementById("FrameJS");

    // Calculate the aspect ratio based on the canvas size
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Create a perspective camera
    perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);

    // Set the camera position
    perspectiveCamera.position.y = 1.5;
    perspectiveCamera.position.x = 6;

    // Create the scene
    scene = new THREE.Scene();

    // Load the HDR environment map
    new RGBELoader()
        .setPath("/models/environment/")
        .load("lake_pier_1k.hdr", function (texture) {

            // Set the mapping type to equirectangular
            texture.mapping = THREE.EquirectangularReflectionMapping;

            // Set the environment map of the scene to the loaded texture
            scene.environment = texture;

            // Render the scene
            render();

            // Load the GLTF model
            const loader = new GLTFLoader().setPath("/models/");
            loader.load("Froq file with hero.gltf", (gltf) => {

                // Add the loaded model to the scene
                scene.add(gltf.scene);

                // Set the model scale and position
                gltf.scene.scale.set(1.5, 1.5, 1.5);
                gltf.scene.position.set(0, 0, 0);

                // Render the scene
                render();

            });

        });

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });

    // Set the pixel ratio to match the device
    renderer.setPixelRatio(window.devicePixelRatio);

    // Set the renderer size to match the canvas parent element
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);

    // Set the tone mapping and exposure
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Add a resize listener to the window
    window.addEventListener('resize', onWindowResize);

    // Create the controls
    createControls(perspectiveCamera);
}

// createControls function
function createControls(camera) {
    // Create an OrbitControls object to control the camera and set its properties
    controls = new OrbitControls(camera, canvas.parentElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0;
    controls.maxDistance = 10;
    controls.minDistance = 3.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;

    controls.enablePan = false;
    controls.enableDamping = true;
}

function onWindowResize() {
    // Adjust the camera aspect ratio and renderer size when the window is resized
    const aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
}

function animate() {
    // Use requestAnimationFrame to animate the scene
    requestAnimationFrame(animate);

    // Update the camera controls and render the scene
    controls.update();
    render();
}

function render() {
    // Render the scene using the WebGL renderer and current camera
    renderer.render(scene, perspectiveCamera);
}
