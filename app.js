/*
  Pontos da experiência em Realidade Aumentada.
  As imagens representam as três releituras e aparecem apenas dentro da câmera/RA.
  Quando tiver as coordenadas finais, altere latitude e longitude abaixo.
*/

const AR_POINTS = [
  {
    id: "ra-releitura-1",
    model: "teste-carro.gltf",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "5 5 5"
  },
  {
    id: "ra-releitura-2",
    model: "teste-carro.gltf",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "5 5 5"
  },
  {
    id: "ra-releitura-3",
    model: "teste-carro.gltf",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "5 5 5"
  }
];

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

function setMenuOpen(isOpen) {
  siteHeader?.classList.toggle("is-menu-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.contains("is-menu-open");
  setMenuOpen(!isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

window.matchMedia("(min-width: 881px)").addEventListener?.("change", (event) => {
  if (event.matches) setMenuOpen(false);
});

const startButton = document.querySelector("#start-ar");
const closeButton = document.querySelector("#close-ar");
const overlay = document.querySelector("#ar-overlay");
const arRoot = document.querySelector("#ar-root");

startButton?.addEventListener("click", () => {
  overlay.hidden = false;
  document.body.style.overflow = "hidden";

  if (!arRoot.dataset.loaded) {
    buildARScene();
    arRoot.dataset.loaded = "true";
  }
});

closeButton?.addEventListener("click", () => {
  overlay.hidden = true;
  document.body.style.overflow = "";
});

AFRAME.registerComponent("ar-point-manager", {
  schema: {
    visualDistance: { type: 'number', default: 3 },
    baseScale: { type: 'vec3', default: {x: 5, y: 5, z: 5} },
    index: { type: 'number', default: 0 }
  },
  
  init: function () {
    this.el.setAttribute('scale', this.data.baseScale);
  },
  
  tick: function () {
    const cameraEl = document.querySelector("[gps-new-camera]");
    if (!cameraEl || !this.el.object3D) return;

    this.el.setAttribute("visible", "true");
    this.el.object3D.lookAt(cameraEl.object3D.position);

    const cameraPos = cameraEl.object3D.position;
    
    let direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(cameraEl.object3D.quaternion);
    
    if (this.data.index === 1) {
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.6);
    } else if (this.data.index === 2) {
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.6);
    }
    
    let targetPos = new THREE.Vector3();
    targetPos.addVectors(cameraPos, direction.multiplyScalar(this.data.visualDistance));
    
    this.el.object3D.position.copy(targetPos);
  }
});

function buildARScene() {
  const scene = document.createElement("a-scene");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("embedded", "");
  scene.setAttribute("arjs", "sourceType: webcam; videoTexture: true; debugUIEnabled: false");
  scene.setAttribute("renderer", "antialias: true; alpha: true; colorManagement: true");
  scene.setAttribute("loading-screen", "enabled: false");

  const ambientLight = document.createElement("a-entity");
  ambientLight.setAttribute("light", "type: ambient; intensity: 1.5");
  scene.appendChild(ambientLight);

  const directionalLight = document.createElement("a-entity");
  directionalLight.setAttribute("light", "type: directional; intensity: 1.0; castShadow: false");
  directionalLight.setAttribute("position", "1 4 3");
  scene.appendChild(directionalLight);

  const assets = document.createElement("a-assets");

  AR_POINTS.forEach((point) => {
    const assetItem = document.createElement("a-asset-item");
    assetItem.setAttribute("id", point.id);
    assetItem.setAttribute("src", `${point.model}?v=${Date.now()}`);
    assets.appendChild(assetItem);
  });

  scene.appendChild(assets);

  const camera = document.createElement("a-camera");
  camera.setAttribute("gps-new-camera", "gpsMinDistance: 1"); 
  scene.appendChild(camera);

  AR_POINTS.forEach((point, idx) => {
    const entity = document.createElement("a-entity");
    entity.setAttribute("gltf-model", `#${point.id}`);
    entity.setAttribute("gps-new-entity-place", `latitude: ${point.latitude}; longitude: ${point.longitude}`);
    entity.setAttribute("ar-point-manager", `visualDistance: 3; baseScale: ${point.scale}; index: ${idx}`);
    
    scene.appendChild(entity);
  });

  arRoot.appendChild(scene);
}
