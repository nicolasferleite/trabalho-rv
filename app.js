/*
  Pontos da experiência em Realidade Aumentada.
  As imagens representam as três releituras e aparecem apenas dentro da câmera/RA.
  Quando tiver as coordenadas finais, altere latitude e longitude abaixo.
*/

const AR_POINTS = [
  {
    id: "ra-releitura-1",
    image: "assets/releitura-1.svg",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    width: 0.4,
    height: 0.26,
    scale: "1 1 1"
  },
  {
    id: "ra-releitura-2",
    image: "assets/releitura-2.svg",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    width: 0.4,
    height: 0.26,
    scale: "1 1 1"
  },
  {
    id: "ra-releitura-3",
    image: "assets/releitura-3.svg",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    width: 0.4,
    height: 0.26,
    scale: "1 1 1"
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
    maxDistance: { type: 'number', default: 50 },
    minVisualDistance: { type: 'number', default: 2.5 },
    baseScale: { type: 'vec3', default: {x: 1, y: 1, z: 1} }
  },
  
  init: function () {
    this.el.setAttribute('scale', this.data.baseScale);
  },
  
  tick: function () {
    const cameraEl = document.querySelector("[gps-new-camera]");
    if (!cameraEl || !this.el.object3D) return;

    this.el.object3D.lookAt(cameraEl.object3D.position);

    const cameraPos = cameraEl.object3D.position;
    const objectPos = this.el.object3D.position;
    const realDistance = cameraPos.distanceTo(objectPos);

    if (realDistance > this.data.maxDistance) {
      this.el.setAttribute("visible", "false");
      return;
    } else {
      this.el.setAttribute("visible", "true");
    }

    if (realDistance < this.data.minVisualDistance) {
      let direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(cameraEl.object3D.quaternion);
      
      let targetPos = new THREE.Vector3();
      targetPos.addVectors(cameraPos, direction.multiplyScalar(this.data.minVisualDistance));
      
      this.el.object3D.position.copy(targetPos);
    }
  }
});

function buildARScene() {
  const scene = document.createElement("a-scene");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("embedded", "");
  scene.setAttribute("arjs", "sourceType: webcam; videoTexture: true; debugUIEnabled: false");
  scene.setAttribute("renderer", "antialias: true; alpha: true");
  scene.setAttribute("loading-screen", "enabled: false");

  const assets = document.createElement("a-assets");

  AR_POINTS.forEach((point) => {
    const img = document.createElement("img");
    img.setAttribute("id", point.id);
    img.setAttribute("src", point.image);
    img.setAttribute("crossorigin", "anonymous");
    assets.appendChild(img);
  });

  scene.appendChild(assets);

  const camera = document.createElement("a-camera");
  camera.setAttribute("gps-new-camera", "gpsMinDistance: 1"); 
  scene.appendChild(camera);

  AR_POINTS.forEach((point) => {
    const image = document.createElement("a-image");
    image.setAttribute("src", `#${point.id}`);
    image.setAttribute("width", point.width);
    image.setAttribute("height", point.height);
    image.setAttribute("gps-new-entity-place", `latitude: ${point.latitude}; longitude: ${point.longitude}`);
    image.setAttribute("ar-point-manager", `maxDistance: 50; minVisualDistance: 2.5; baseScale: ${point.scale}`);
    
    scene.appendChild(image);
  });

  arRoot.appendChild(scene);
}
