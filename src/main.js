console.log('Abtahi was here');

import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 10, 30);

// HDRI Background
const rgbeLoader = new RGBELoader();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

rgbeLoader.load('./HDR_blue_local_star.hdr', function (texture) {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap;
  scene.background = envMap;
  texture.dispose();
  console.log('HDRI loaded successfully');
});

// Video Sphere
const video = document.createElement('video');
video.src = './test.mp4'; 
video.loop = true;
video.muted = true;
video.autoplay = true;

video.oncanplaythrough = () => video.play();
const videoTexture = new THREE.VideoTexture(video);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
const videoSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(videoSphere);

// Load the .glb model

let model, pivot; // Declare globally

const loader = new GLTFLoader();
loader.load('./aartinkglb.glb', function (gltf) {
    model = gltf.scene; 
    
    pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(model);

    // Position & scale the model
    model.position.set(0, 5, 0);
    model.scale.set(0.1, 0.1, 0.1);

    pivot.position.set(-20, 5, 0); // Move pivot up
        
    // Glow effect
        model.traverse((child) => {
          if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  emissive: 0xffff33,  // Yellow glow
                  emissiveIntensity: 2.0,
                  roughness: 0.2,
                  metalness: 0.8
              });
          }
      });
      console.log('✅ GLB Model Loaded & Glowing!');
  }, undefined, function (error) {
      console.error('❌ Error loading GLB file:', error);
  });
    
    // Load the .glb model2

let abtahi

loader.load('./abtahi.glb', function (gltf) {
    abtahi = gltf.scene; 
    abtahi.position.set(0, -15, 0);
    abtahi.scale.set(0.1, 0.1, 0.1);
scene.add(abtahi);

// Glow effect
model,abtahi.traverse((child) => {
  if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffff33,  // Yellow glow
          emissiveIntensity: 2.0,
          roughness: 0.2,
          metalness: 0.8
      });
  }
});
console.log('✅ GLB Model Loaded & Glowing!');
}, undefined, function (error) {
console.error('❌ Error loading GLB file:', error);
});

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 5);
pointLight.position.set(5, 0, 10);
scene.add(pointLight, new THREE.AmbientLight(0xffffff, 0.5));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

let moveSpeed = 0.5;
let velocity = new THREE.Vector3(); // Holds movement direction

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

window.addEventListener("keydown", (event) => {
  if (event.key === "w") keys.w = true;
  if (event.key === "a") keys.a = true;
  if (event.key === "s") keys.s = true;
  if (event.key === "d") keys.d = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "w") keys.w = false;
  if (event.key === "a") keys.a = false;
  if (event.key === "s") keys.s = false;
  if (event.key === "d") keys.d = false;
});

// Background Stars
function addStar() {
  const starGeometry = new THREE.SphereGeometry(0.5, 24, 24);
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffee });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(300));
  star.position.set(x, y, z);
  scene.add(star);
}
Array(420).fill().forEach(addStar);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  velocity.set(0, 0, 0);

  // Adjust movement based on key presses
  if (keys.w) velocity.z -= moveSpeed; // Move forward
  if (keys.s) velocity.z += moveSpeed; // Move backward
  if (keys.a) velocity.x -= moveSpeed; // Move left
  if (keys.d) velocity.x += moveSpeed; // Move right

  // Apply movement to the camera
  camera.position.add(velocity);
  
  if (pivot) {
    pivot.rotation.y += -0.0001;
    pivot.rotation.z += 0.00001;
    pivot.rotation.x += 0.0001;  
}

  if (abtahi) {
    abtahi.rotation.y += 0.0001;
    abtahi.rotation.z += 0.00001;
    abtahi.rotation.x += 0.00001; 
}
  controls.update();
  videoTexture.needsUpdate = true;
  renderer.render(scene, camera);
}
animate();
