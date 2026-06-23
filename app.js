// 1. Configuração dos 4 pontos da praça
// 1. Configuração dos 4 pontos da praça (Coordenadas ajustadas para melhor espaçamento)
const AR_POINTS = [
  {
    id: "ponto-retirantes-3d",
    type: "gltf",
    source: "assets/retirantes.glb", 
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    scale: "1 1 1" 
  },
  {
    id: "ponto-releitura-1",
    type: "image",
    source: "assets/releitura-1.svg", 
    latitude: -4.963910, 
    longitude: -39.025810,
    scale: "2 2 1" 
  },
  {
    id: "ponto-releitura-2",
    type: "image",
    source: "assets/releitura-2.svg", 
    // Afastado da imagem 1 e reposicionado estrategicamente no meio da cena
    latitude: -4.963800, 
    longitude: -39.025700,
    scale: "2 2 1"
  },
  {
    id: "ponto-alma-nordestina",
    type: "image",
    source: "assets/alma-nordestina.jpg", 
    latitude: -4.964000, 
    longitude: -39.025500,
    scale: "1.5 2 1" 
  }
];

// 2. Controle do Menu Lateral
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

// 3. Controle da Tela de Realidade Aumentada (Overlay)
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

  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
});

closeButton?.addEventListener("click", () => {
  overlay.hidden = true;
  document.body.style.overflow = "";
});

// 4. Componente de Fallback para erros no Modelo 3D
AFRAME.registerComponent("ar-point-manager", {
  schema: {
    baseScale: { type: 'vec3', default: {x: 1, y: 1, z: 1} }
  },
  init: function () {
    this.el.setAttribute('scale', this.data.baseScale);
    
    this.el.addEventListener('model-error', () => {
      console.warn("Falha ao carregar GLTF. Exibindo cubo de fallback.");
      this.el.removeAttribute('gltf-model');
      this.el.setAttribute('geometry', 'primitive: box; width: 0.8; height: 0.8; depth: 0.8');
      this.el.setAttribute('material', 'color: #ff0044; metalness: 0.1; roughness: 0.5');
    });
  }
});

// 5. Construção Dinâmica da Cena de RA
function buildARScene() {
  const scene = document.createElement("a-scene");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("embedded", "");
  scene.setAttribute("arjs", "sourceType: webcam; videoTexture: true; debugUIEnabled: false");
  scene.setAttribute("renderer", "antialias: true; alpha: true; colorManagement: true");

  // Iluminação
  const ambientLight = document.createElement("a-entity");
  ambientLight.setAttribute("light", "type: ambient; intensity: 2.0");
  scene.appendChild(ambientLight);

  const directionalLight = document.createElement("a-entity");
  directionalLight.setAttribute("light", "type: directional; intensity: 1.5");
  directionalLight.setAttribute("position", "0 10 0");
  scene.appendChild(directionalLight);

  // Câmera GPS
  const camera = document.createElement("a-camera");
  camera.setAttribute("gps-new-camera", "gpsMinDistance: 1"); 
  scene.appendChild(camera);

  // Renderização dos pontos pela praça
  AR_POINTS.forEach((point) => {
    let entity;

    if (point.type === "gltf") {
      entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", `url(${point.source}?v=${Date.now()})`);
      entity.setAttribute("ar-point-manager", `baseScale: ${point.scale}`);
    } 
    else if (point.type === "image") {
      entity = document.createElement("a-image");
      entity.setAttribute("src", `${point.source}?v=${Date.now()}`);
      
      // Força o material a ser plano ("flat") para corrigir o bug da imagem preta
      entity.setAttribute("material", "shader: flat; transparent: true; side: double;");
      
      const sizes = point.scale.split(" ");
      entity.setAttribute("width", sizes[0] || "2");
      entity.setAttribute("height", sizes[1] || "2");
      
      entity.setAttribute("look-at", "[gps-new-camera]");
      entity.setAttribute("position", "0 1 0"); // Eleva 1 metro do chão
    }

    if (entity) {
      entity.setAttribute("gps-new-entity-place", `latitude: ${point.latitude}; longitude: ${point.longitude}`);
      scene.appendChild(entity);
    }
  });

  arRoot.appendChild(scene);
}
