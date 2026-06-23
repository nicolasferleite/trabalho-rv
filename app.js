const AR_POINTS = [
  {
    id: "ponto-retirantes-3d",
    type: "gltf",
    source: "assets/retirantes.glb",
    // Puxado mais para o Norte e Leste (ficando mais perto do ponto 2 e 3)
    latitude: -4.969150,
    longitude: -39.012350, 
    scale: "6 6 6",
  },
  {
    id: "ponto-o-sertanejo",
    type: "video",
    source: "assets/o-sertanejo.mp4",
    // Mantido fixo como a nova âncora de aproximação
    latitude: -4.968550,
    longitude: -39.011750,
    scale: "5 5 1",
  },
  {
    id: "ponto-alma-nordestina",
    type: "image",
    source: "assets/alma-nordestina.jpg",
    // Puxado um pouco mais para o Norte e Leste (em direção ao ponto 2)
    latitude: -4.968850,
    longitude: -39.011950,
    scale: "4 6 1",
  },
];
