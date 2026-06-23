const AR_POINTS = [
  {
    id: "ra-releitura-1",
    model: "assets/retirantes.glb", // Correção 1: Caminho da pasta
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "1 1 1" // Correção 5: Reduzido para teste de colisão
  },
  {
    id: "ra-releitura-2",
    model: "assets/retirantes.glb",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "1 1 1"
  },
  {
    id: "ra-releitura-3",
    model: "assets/retirantes.glb",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
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

  // Correção 4: Força o canvas do WebGL a entender que a tela abriu
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
});

closeButton?.addEventListener("click", () => {
  overlay.hidden = true;
  document.body.style.overflow = "";
});

AFRAME.registerComponent("ar-point-manager", {
  schema: {
    visualDistance: { type: 'number', default: 4 },
    baseScale: { type: 'vec3', default: {x: 1, y: 1, z: 1} },
    index: { type: 'number', default: 0 }
  },
  
  init: function () {
    this.el.setAttribute('scale', this.data.baseScale);
    
    // Sistema de fallback: Se o GLTF falhar, vira um cubo vermelho
    this.el.addEventListener('model-error', () => {
      console.warn("Falha ao carregar GLTF. Exibindo cubo de fallback.");
      this.el.removeAttribute('gltf-model');
      this.el.setAttribute('geometry', 'primitive: box; width: 0.8; height: 0.8; depth: 0.8');
      this.el.setAttribute('material', 'color: #ff0044; metalness: 0.1; roughness: 0.5');
    });
  },
  
  tick: function () {
    const cameraEl = document.querySelector("[gps-new-camera]");
    if (!cameraEl || !this.el.object3D) return;

    this.el.object3D.lookAt(cameraEl.object3D.position);

    /* Correção 2: Comentei a força bruta de posição. 
       Deixe o GPS colocar a obra no lugar dela. 
       Se quiser que flutue na frente da câmera ignorando o mapa, 
       descomente as linhas abaixo e delete o atributo 'gps-new-entity-place' na função buildARScene.
    */

    /*
    const cameraPos = cameraEl.object3D.position;
    let direction = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraEl.object3D.quaternion);
    if (this.data.index === 1) direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.6);
    if (this.data.index === 2) direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.6);
    let targetPos = new THREE.Vector3().addVectors(cameraPos, direction.multiplyScalar(this.data.visualDistance));
    this.el.object3D.position.copy(targetPos);
    */
  }
});

function buildARScene() {
  const scene = document.createElement("a-scene");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("embedded", "");
  scene.setAttribute("arjs", "sourceType: webcam; videoTexture: true; debugUIEnabled: false");
  scene.setAttribute("renderer", "antialias: true; alpha: true; colorManagement: true");

  const ambientLight = document.createElement("a-entity");
  ambientLight.setAttribute("light", "type: ambient; intensity: 2.0");
  scene.appendChild(ambientLight);

  const directionalLight = document.createElement("a-entity");
  directionalLight.setAttribute("light", "type: directional; intensity: 1.5");
  directionalLight.setAttribute("position", "0 10 0");
  scene.appendChild(directionalLight);

  const camera = document.createElement("a-camera");
  camera.setAttribute("gps-new-camera", "gpsMinDistance: 1"); 
  scene.appendChild(camera);

  AR_POINTS.forEach((point, idx) => {
    const entity = document.createElement("a-entity");
    
    // Correção 3: Injeção direta via url() pulando o <a-assets>
    entity.setAttribute("gltf-model", `url(${point.model}?v=${Date.now()})`);
    
    entity.setAttribute("gps-new-entity-place", `latitude: ${point.latitude}; longitude: ${point.longitude}`);
    entity.setAttribute("ar-point-manager", `visualDistance: 4; baseScale: ${point.scale}; index: ${idx}`);
    
    scene.appendChild(entity);
  });

  arRoot.appendChild(scene);
}
