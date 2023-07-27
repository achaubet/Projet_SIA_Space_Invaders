import * as THREE from "three";
import { actualLevel, levelsConfig } from "./config.js";
import { scaleModel } from "./utils.js";

class Covers {
  covers = [];
  // Fonction permettant d'initialiser les abris
  createCovers(scene) {
    let geometry = new THREE.BoxGeometry(2, 2, 2);
    let material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        levelsConfig[actualLevel].breakable_block
      ),
    });
    // Ajoute une barre de vie pour chaque abris
    let barGeometry = new THREE.PlaneGeometry(40, 5, 1, 1);
    let barMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    let healthGeometry = new THREE.PlaneGeometry(10, 3, 1, 1);
    let healthMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 });

    for (let i = 0; i < 3; i++) {
      let coversGroup = new THREE.Group();
      let block = new THREE.Mesh(geometry, material);
      let healthBar = new THREE.Object3D();
      let healthPlane1 = new THREE.Mesh(healthGeometry, healthMaterial);
      let healthPlane2 = new THREE.Mesh(healthGeometry, healthMaterial);
      let healthPlane3 = new THREE.Mesh(healthGeometry, healthMaterial);
      let barPlane = new THREE.Mesh(barGeometry, barMaterial);
      healthBar.add(barPlane);
      healthBar.name = "healthbar";
      healthBar.add(healthPlane1);
      healthBar.add(healthPlane2);
      healthBar.add(healthPlane3);
      healthPlane1.position.x -= 0.3;
      healthPlane1.position.x = -barGeometry.parameters.width / 2 + healthGeometry.parameters.width / 2;
      healthPlane3.position.x -= 0.3;
      healthPlane3.position.x = -barGeometry.parameters.width / 2 + healthGeometry.parameters.width / 2 + 30;
      healthPlane1.position.z += 0.1;
      healthPlane2.position.z += 0.1;
      healthPlane3.position.z += 0.1;
      healthPlane1.name = "1";
      healthPlane2.name = "2";
      healthPlane3.name = "3";

      scaleModel(healthBar, 3);
      block.name = "cover";
      block.position.x = -12 + i * 12;
      block.position.z = 10;
      block.position.y = 1;
      healthBar.position.x = -12 + i * 12;
      healthBar.position.z = 10;
      healthBar.position.y = 3;
      coversGroup.add(block);
      coversGroup.add(healthBar);
      scene.add(coversGroup);
      this.covers.push(coversGroup);
    }
  }

  getCoversArray() {
    return this.covers;
  }

  removeCover(idx) {
    this.covers.splice(idx, 1);
  }

  clearCoversArray() {
    this.covers.splice(0, this.covers.length);
  }
}

let covers = new Covers();

export { covers };
