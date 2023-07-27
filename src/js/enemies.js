import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { scaleModel, sleep } from "./utils";
import {
  actualLevel,
  enemiesAnimationSettings,
  enemiesModels,
  levelsConfig,
} from "./config";
import { music } from "./music";

class Enemies {
  modelsData = [];
  enemies = [];
  bullets = [];
  clock = new THREE.Clock();
  pause = false;
  invincible = false; // :)

  setEnemyPosition() {
    let i = 0;
    let j = 0;
    let k = 0;
    this.enemies.forEach((enemy) => {
      enemy.translateX(i);
      enemy.translateZ(k);
      i += levelsConfig[actualLevel].enemyDistance;
      j++;
      if (j >= 5) {
        i = i % 5;
        j = j % 5;
        k += 4;
      }
    });
  }

  async initEnemiesModels() {
    let nbModels = Object.keys(enemiesModels).length;
    console.log(nbModels);
    for (let i = 0; i < nbModels; i++) {
      let name = "enemy" + (i + 1).toString();
      let loader = new GLTFLoader();
      let bodyData = await loader.loadAsync(enemiesModels[name]);
      this.modelsData.push(bodyData);
    }
  }

  async createEnemy() {
    for (let i = this.modelsData.length - 1; i >= 0; i--) {
      for (let j = 0; j < 5; j++) {
        let bodyModel = this.modelsData[i].scene;
        let enemy = new THREE.Group();
        const clip = this.modelsData[i].animations[0];
        enemy.name = "enemy";
        enemy.points = (i + 1) * 10;
        enemy.mixer = new THREE.AnimationMixer(enemy);
        enemy.add(bodyModel.clone());
        enemy.position.set(-19.5, 0, -15);
        scaleModel(enemy, 3);
        const action = enemy.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();
        this.enemies.push(enemy);
      }
    }
    this.setEnemyPosition();
  }

  async animateEnemies() {
    if (this.enemies.length > 0 && !this.pause && !this.invincible) {
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].translateZ(enemiesAnimationSettings.translateZ);
        switch (enemiesAnimationSettings.directionTranslateX) {
          case "+":
            this.enemies[i].translateX(enemiesAnimationSettings.translateX);
            break;
          case "-":
            this.enemies[i].translateX(-enemiesAnimationSettings.translateX);
            break;
        }
      }
      if (enemiesAnimationSettings.switchedDirection) {
        enemiesAnimationSettings.switchedDirection = false;
        enemiesAnimationSettings.translateZ = 0;
      }
      for (let i = 0; i < this.enemies.length; i++) {
        if (
          this.enemies[i].position.x <= -19.5 ||
          this.enemies[i].position.x >= 19.5
        ) {
          enemiesAnimationSettings.directionTranslateX == "+"
            ? (enemiesAnimationSettings.directionTranslateX = "-")
            : (enemiesAnimationSettings.directionTranslateX = "+");
          enemiesAnimationSettings.translateZ = 1;
          enemiesAnimationSettings.switchedDirection = true;
          break;
        }
      }
      await sleep(enemiesAnimationSettings.time);
    }
    requestAnimationFrame(this.animateEnemies.bind(this));
  }

  shoot(scene) {
    if (this.enemies.length > 0) {
      let bulletGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
      let bulletMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      let bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
      bullet.name = "bullet";
      let theChoosenOne = Math.floor(Math.random() * this.enemies.length);
      bullet.position.set(
        this.enemies[theChoosenOne].position.x,
        0.5,
        this.enemies[theChoosenOne].position.z
      );
      this.bullets.push(bullet);
      scene.add(bullet);
    }
  }

  getEnemiesModels() {
    return this.modelsData;
  }

  getEnemiesArray() {
    return this.enemies;
  }

  getEnemiesLength() {
    return this.enemies.length;
  }

  getBulletsArray() {
    return this.bullets;
  }

  getClockElapsedTime() {
    return this.clock.getElapsedTime();
  }

  clearEnemyArray() {
    this.enemies.splice(0, this.enemies.length);
  }

  clearBulletsArray() {
    this.bullets.splice(0, this.bullets.length);
  }

  removeEnemy(idx) {
    this.enemies.splice(idx, 1);
  }

  removeBullet(idx) {
    this.bullets.splice(idx, 1);
  }

  setPause(bool) {
    this.pause = bool;
  }

  getInvincibleMode() {
    return this.invincible;
  }

  toggleInvincibleMode() {
    this.invincible = !this.invincible;
    if (this.invincible) {
      music.startInvincibleMusic();
      music.stopAmbientMusic();
    } else {
      music.stopInvincibleMusic();
      music.startAmbientMusic();
    }
  }

  resetClock() {
    this.clock.start();
  }
}

let enemies = new Enemies();

export { enemies };
