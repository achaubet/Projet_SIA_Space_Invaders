import * as THREE from "three";
import { Howl } from "howler";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { scaleModel } from "./utils";
import { player } from "./player";
// Classe Missiles
class Missiles {
  // Tableau contenant les missiles
  missiles = [];
  // Son à jouer lorqu'un missile est envoyé par le joueur
  missile_fire = new Howl({
    src: ["src/medias/sounds/Fireball.wav"],
    volume: 0.5,
  });
  // Constructeur de base
  contructor() {
    this.missile = new THREE.Group();
    this.missile.name = "missile";
  }
  // Chargement du modèle du missile
  async loadMissileData() {
    const loader = new GLTFLoader();
    this.missileData = await loader.loadAsync(
      "./src/medias/models/fireball/scene.gltf"
    );
  }
  // Création d'un missile
  async createMissile(scene) {
    if (this.missiles.length == 0) {
      const bodyModel = this.missileData.scene;
      const playerPosition = player.getPlayerPosition();
      let missile = new THREE.Group();
      missile.name = "missile";
      missile.add(bodyModel.clone());
      scaleModel(missile, 2);
      missile.position.set(playerPosition.x, 0.5, playerPosition.z);
      scene.add(missile);
      this.missiles.push(missile);
      this.missile_fire.play();
    }
  }
  // Permet de retourner le tableau contenant les missiles
  getMissilesArray() {
    if (this.missiles == undefined) {
      return [];
    } else {
      return this.missiles;
    }
  }
  // Efface le tableau de missiles
  clearMissilesArray() {
    this.missiles.splice(0, this.missiles.length);
  }
}

let missiles = new Missiles();

export { missiles };
