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
    width: 4,
    height: 2.6,
    scale: "10 10 10"
  },
  {
    id: "ra-releitura-2",
    image: "assets/releitura-2.svg",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    width: 4,
    height: 2.6,
    scale: "10 10 10"
  },
  {
    id: "ra-releitura-3",
    image: "assets/releitura-3.svg",
    latitude: -4.963856792480823,
    longitude: -39.02575945854149,
    width: 4,
    height: 2.6,
    scale: "10 10 10"
  }
];

/* Menu mobile */
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

// Componente para rotacionar o objeto para a câmera E controlar visibilidade/escala por distância
AFRAME.registerComponent("ar-point-behavior", {
  schema: {
    maxDistance: { type: 'number', default: 50 } // Distância máxima em metros para o objeto aparecer
  },
  
  tick: function () {
    const cameraEl = document.querySelector("[gps-new-camera]");
    if (!cameraEl || !this.el.object3D) return;

    // 1. Faz o objeto sempre olhar para a câmera
    this.el.object3D.lookAt(cameraEl.object3D.position);

    // 2. Calcula a distância real entre a câmera e o objeto tridimensional
    const cameraPos = cameraEl.object3D.position;
    const objectPos = this.el.object3D.position;
    const distance = cameraPos.distanceTo(objectPos);

    // 3. Se estiver além da distância máxima, esconde o elemento para não poluir a tela
    if (distance > this.data.maxDistance) {
      this.el.setAttribute("visible", "false");
    } else {
      this.el.setAttribute("visible", "true");
    }
  }
});

function buildARScene() {
  const scene = document.createElement("a-scene");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("embedded", "");
  // Adicionado o parâmetro 'simulateLatitude' e 'simulateLongitude' se precisar testar localmente no PC
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
  // Reduzi a distância mínima para atualização do GPS para melhorar a precisão ao andar
  camera.setAttribute("gps-new-camera", "gpsMinDistance: 2"); 
  scene.appendChild(camera);

  AR_POINTS.forEach((point) => {
    const image = document.createElement("a-image");
    image.setAttribute("src", `#${point.id}`);
    image.setAttribute("width", point.width);
    image.setAttribute("height", point.height);
    
    // Diminuí um pouco a escala inicial para testar, já que 10m x 4m de largura vira um objeto de 40 metros de largura no mundo real!
    image.setAttribute("scale", "2 2 2"); 
    
    image.setAttribute("gps-new-entity-place", `latitude: ${point.latitude}; longitude: ${point.longitude}`);
    
    // Aplicando o novo componente configurado para sumir se passar de 60 metros de distância
    image.setAttribute("ar-point-behavior", "maxDistance: 60");
    
    scene.appendChild(image);
  });

  arRoot.appendChild(scene);
}
