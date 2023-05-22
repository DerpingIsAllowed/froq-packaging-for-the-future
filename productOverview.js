// Import necessary modules from Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Define variables for the scene, camera, renderer, and model loader
let perspectiveCamera, controls, scene, renderer, loader, isDisplayed = false, gltfThing;

// Define variables for the canvas and its wrapper, the path to the model, and the previous image and parent element
let canvas, canvasWrapper, modelPath, previousImage, previousParent;

// Get all elements with the "data-product-Model" attribute
const productModels = document.querySelectorAll('[data-product-model]');

// Call the init function to set up the scene
init();
// Start the animation loop
animate();

// Function to set up the scene
function init() {
    // Get the canvas element and its wrapper
    canvas = document.getElementById("FrameJS");
    canvasWrapper = document.getElementById("FrameJS-wrapper");

    // Set up the perspective camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    perspectiveCamera.position.y = 1.5;
    perspectiveCamera.position.x = 6;

    // Create the scene
    scene = new THREE.Scene();

    // Load the environment texture using the RGBELoader
    new RGBELoader()
        .setPath("/models/environment/")
        .load("lake_pier_1k.hdr", function (texture) {
            // Set the texture mapping to EquirectangularReflectionMapping
            texture.mapping = THREE.EquirectangularReflectionMapping;
            // Set the scene's environment to the loaded texture
            scene.environment = texture;
            // Render the scene
            render();

            // Load the model using the GLTFLoader
            loader = new GLTFLoader().setPath("/models/");
            loader.load("genericBrand lotion.gltf", (gltf) => {
                // Add the model to the scene
                scene.add(gltf.scene);
                // Set the model's scale
                gltf.scene.scale.set(10, 10, 10);
                // Set the model's position
                gltf.scene.position.set(0, -.8, 0);
                // Render the scene
                render();
                // Save a reference to the loaded model
                gltfThing = gltf;
            });
        });

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Add an event listener for window resize
    window.addEventListener('resize', onWindowResize);

    // Set up the camera controls using the OrbitControls module
    createControls(perspectiveCamera);
}

// Create the OrbitControls for the camera with certain properties
function createControls(camera) {
    controls = new OrbitControls(camera, canvas.parentElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0;
    controls.maxDistance = 10;
    controls.minDistance = 3.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    // Disable panning and enable damping
    controls.enablePan = false;
    controls.enableDamping = true;
}

// Update the perspective camera and renderer size when window is resized
function onWindowResize() {
    const aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientWidth;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientWidth);
}

// Continuously animate the scene and controls when the model is displayed
function animate() {
    requestAnimationFrame(animate);
    if (isDisplayed) {
        controls.update();
        render();
    }
}

// Render the scene with the perspective camera
function render() {
    renderer.render(scene, perspectiveCamera);
}


// on hover of element with data-product-Model attribute
modelPath = null;
productModels.forEach((productImage) => {
    productImage.parentElement.addEventListener('mouseenter', () => {


        // get the value of the data-product-Model attribute
        modelPath = productImage.getAttribute('data-product-model');

        //split array by commas and remove empty strings
        modelPath = modelPath.split(',').filter(function (el) {
            return el != "";
        });

        const data = modelPath;
        modelPath = data[0];

        // put the canvas-wrapper in the element's parent
        try {
            productImage.parentElement.appendChild(canvasWrapper);
            previousImage = productImage;
            previousParent = productImage.parentElement;
            productImage.parentElement.removeChild(productImage);
        } catch (e) {
            console.log(e);
        }

        // on window resize call
        onWindowResize();
        // load the model

        // scene.remove(gltfThing.scene);
        for (var i = scene.children.length - 1; i >= 0; i--) {
            const obj = scene.children[i];
            
            scene.remove(obj);
        }



        loader.load(modelPath, (gltf) => {
            // add the model to the scene
            scene.add(gltf.scene);
            // set the model scale
            gltf.scene.scale.set(data[4], data[4], data[4]);
            // set the model position
            gltf.scene.position.set(data[1], data[2], data[3]);
            // render the scene
            render();

            gltfThing = gltf;
        });
        // set isdisplayed to true
        isDisplayed = true;

    });
    // on mouse exit of element with data-product-Model attribute
    productImage.parentElement.addEventListener('mouseleave', () => {
        // set modelPath to null
        modelPath = null;
        // remove the frameJs canvas from the element
        previousParent.removeChild(canvasWrapper);
        previousParent.appendChild(previousImage);
        //set isdisplayed to false
        isDisplayed = false;
    });
});