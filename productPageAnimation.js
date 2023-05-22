import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

gsap.registerPlugin(ScrollTrigger);

let scrollPercentage = 0.01;

let perspectiveCamera, scene, renderer, renderergbe, canvas;

// gltf animation variables
let mixer, clock, animations, actions = [], scenepos = [];

// on mouse move update mouseX and mouseY
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});


window.addEventListener('load', function () {


    init();
    animate();
    // for every div named spacer set the height to the height of data-spacing;
    let spacers = document.getElementsByClassName("spacer");
    for (let i = 0; i < spacers.length; i++) {
        spacers[i].style.height = spacers[i].getAttribute("data-spacing");
    }

    ScrollTrigger.create({
        trigger: "#bodyWrapper",
        start: "top top",
        endTrigger: "#bodyWrapper",
        end: "bottom bottom",
        onToggle: self => {},   // callback for when the animation is toggled
        onUpdate: self => {
            scrollPercentage = self.progress.toFixed(3) * 100;
        }
    });
})

window.addEventListener('load', function() {
    // Animate the element in on page load
    var scrollLabel = document.querySelector('.scroll-label');
    scrollLabel.style.transform = 'translateY(100%) translateX(-45%)';
    scrollLabel.style.opacity = '0';
    setTimeout(function() {
        scrollLabel.style.transform = 'translateY(0) translateX(-45%)';
        scrollLabel.style.opacity = '1';
    }, 500);
    
    // Animate the element out when scrolled past
    window.addEventListener('scroll', function() {
        var scrollPosition = window.pageYOffset;
        var windowHeight = window.innerHeight;
        var elementOffset = scrollLabel.offsetTop;
        var elementHeight = scrollLabel.offsetHeight;
        
        if (scrollPosition > elementOffset - windowHeight + elementHeight) {
            scrollLabel.style.opacity = '0';
        } else {
            scrollLabel.style.opacity = '1';
        }
    });
});




function init() {
    canvas = document.getElementById("FrameJS");

    const aspect = canvas.clientWidth / canvas.clientHeight;

    scenepos = canvas.getAttribute('data-scene-position');

    scenepos = scenepos.split(',').filter(function (el) {
        return el != "";
    });

    perspectiveCamera = new THREE.PerspectiveCamera(50, aspect, 0.01, 1000);
    perspectiveCamera.position.x = scenepos[0];
    perspectiveCamera.position.y = scenepos[1];
    perspectiveCamera.position.z = scenepos[2];

    // world
    scene = new THREE.Scene();

    new RGBELoader()
        .setPath("/models/environment/")
        .load("lake_pier_1k.hdr", function (texture) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.environment = texture;
            render();

            // get the value of the data-product-Model attribute
            let modelPath = canvas.getAttribute('data-product-model');

            //split array by commas and remove empty strings
            modelPath = modelPath.split(',').filter(function (el) {
                return el != "";
            });

            const data = modelPath;
            modelPath = data[0];

            const loader = new GLTFLoader().setPath("/models/");
            loader.load(modelPath, (gltf) => {

                scene.add(gltf.scene);
                gltf.scene.scale.set(data[4], data[4], data[4]);
                gltf.scene.position.set(data[1], data[2], data[3]);

                // if animation is present in gltf file
                if (gltf.animations.length > 0) {
                    // create a clock
                    clock = new THREE.Clock();

                    // create a mixer
                    mixer = new THREE.AnimationMixer(gltf.scene);

                    // create a clip
                    animations = gltf.animations;

                    // play all clips
                    for (let i = 0; i < animations.length; i++) {
                        actions[i] = mixer.clipAction(animations[i]);

                        actions[i].play();
                    }
                }
                render();
            });
        });



    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .9;
    renderer.outputEncoding = THREE.sRGBEncoding;

    perspectiveCamera.lookAt(scene.position);


    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    window.scrollTo(0, 0);
    location.reload();

    const aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // clamp scroll percentage to 0-100
    if (scrollPercentage <= 0) {
        scrollPercentage = 0;
    } else if (scrollPercentage >= 100) {
        scrollPercentage = 99.999;
    }

    // update all mixer animations to scroll position amount
    if (mixer) {
        // get mixer longest animation clip duration
        let longestClipDuration = 0;
        for (let i = 0; i < animations.length; i++) {
            if (animations[i].duration > longestClipDuration) {
                longestClipDuration = animations[i].duration;
            }
        }
        // set mixer time to scroll position amount
        mixer.setTime(scrollPercentage * longestClipDuration / 100);

        // move the camera backwards and down while keeping the scene in view based on scroll position
        perspectiveCamera.position.y = scenepos[1] - (scrollPercentage * 0.01);
        perspectiveCamera.position.z = scenepos[2] - (scrollPercentage * 0.01);

        perspectiveCamera.lookAt(scene.position);

    } else {
        // if no animation is present, rotate model
        scene.rotation.y = scrollPercentage * 0.01;
    }
    // move the model a to face the mouse

    scene.rotation.y = ((mouseX - (window.innerWidth / 2)) / window.innerWidth) * 0.075 * Math.PI;
    scene.rotation.x = ((mouseY - (window.innerHeight / 2)) / window.innerHeight) * 0.075 * Math.PI;

    render();
}

function render() {
    renderer.render(scene, perspectiveCamera);
}


