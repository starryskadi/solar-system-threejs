import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// initialize pane
const pane = new Pane();

// initialize the scene
const scene = new THREE.Scene();

// intialize the geometery
const sphereGeometery = new THREE.SphereGeometry(1, 32, 32);

// initialze the texture
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader().setPath(
  "/textures/cubeMap/"
);

// Load the texture
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const marsTexture = textureLoader.load("/textures/2k_sun.jpg");
const moonsTexture = textureLoader.load("/textures/2k_moon.jpg");

// Add Cube Texture to scene
const cubeTexture = cubeTextureLoader.load([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);

scene.background = cubeTexture;

// initailze the materials
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});

const earthMaterial = new THREE.MeshPhysicalMaterial({
  map: earthTexture,
});

const mercuryMaterial = new THREE.MeshPhysicalMaterial({
  map: mercuryTexture,
});

const venusMaterial = new THREE.MeshPhysicalMaterial({
  map: venusTexture,
});

const marsMaterial = new THREE.MeshPhysicalMaterial({
  map: marsTexture,
});

const moonsMaterial = new THREE.MeshPhysicalMaterial({
  map: moonsTexture,
});

// initalize the meshes

const sunMesh = new THREE.Mesh(sphereGeometery, sunMaterial);
sunMesh.scale.setScalar(5);

scene.add(sunMesh);

const planets = [
  {
    name: "Earth",
    material: earthMaterial,
    distance: 23,
    speed: 1,
    scale: 2,
    moons: [
      {
        name: "Moon",
        material: moonsMaterial,
        distance: 1.5,
        speed: 2,
        scale: 0.4,
      },
    ],
  },
  {
    name: "Mercury",
    material: mercuryMaterial,
    distance: 10,
    speed: 1.2,
    scale: 1,
    moons: [],
  },
  {
    name: "Venus",
    material: venusMaterial,
    distance: 15,
    speed: 2,
    scale: 1.8,
    moons: [],
  },
  {
    name: "Mars",
    material: marsMaterial,
    distance: 30,
    speed: 0.8,
    scale: 1.5,
    moons: [],
  },
];

const planetsMeshes = planets.map((planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometery, planet.material);
  planetMesh.position.x = planet.distance;
  planetMesh.scale.setScalar(planet.scale);
  scene.add(planetMesh);

  planet.moons.map((moon) => {
    const moonMesh = new THREE.Mesh(sphereGeometery, moon.material);
    moonMesh.position.x = moon.distance;
    moonMesh.scale.setScalar(moon.scale);
    planetMesh.add(moonMesh);
  });
  return planetMesh;
});

// initailze the light
const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 0.3);

scene.add(ambientLight);

const pointLight = new THREE.PointLight(new THREE.Color(0xffffff), 2);

scene.add(pointLight);

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 100;
camera.position.y = 5;

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// add resize listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let previousTime = 0;

// render loop
const renderloop = () => {
  const currentTime = clock.getElapsedTime();
  const delta = clock.getElapsedTime() - previousTime;
  previousTime = currentTime;

  sunMesh.rotation.y += 0.2 * delta;
  sunMesh.rotation.x += 0.2 * delta;

  planetsMeshes.map((planetMesh, planetIndex) => {
    planetMesh.rotation.y += planets[planetIndex].speed * delta;
    planetMesh.rotation.x += (planets[planetIndex].speed / 2) * delta;

    planetMesh.position.x =
      Math.sin(planetMesh.rotation.y) * planets[planetIndex].distance;
    planetMesh.position.z =
      Math.cos(planetMesh.rotation.y) * planets[planetIndex].distance;

    planetMesh.children.map((moon, moonIndex) => {
      moon.rotation.y += planets[planetIndex].moons[moonIndex].speed * delta;

      moon.position.x =
        Math.sin(moon.rotation.y) *
        planets[planetIndex].moons[moonIndex].distance;
      moon.position.y =
        Math.cos(moon.rotation.y) *
        planets[planetIndex].moons[moonIndex].distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
