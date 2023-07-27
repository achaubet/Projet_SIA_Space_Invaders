// Fichier contenant toutes fonctions utilitaires
import * as THREE from "three";

function scaleModel(model, sizeMax) {
  const box3 = new THREE.Box3().setFromObject(model);
  const size = box3.getSize(new THREE.Vector3()).length();
  let scale = sizeMax / size;
  model.scale.set(scale, scale, scale);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { scaleModel, sleep };
