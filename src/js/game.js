import * as THREE from "three";
import { Howl } from 'howler';
import { createEnvironment } from "./world_environment.js";
import { player } from "./player.js";
import { gameKeyboard } from "./keyboard.js";
import { missiles } from "./missile.js";
import { actualLevel, addPointsToScore, decrAlienAnimTime, levelsConfig, nbMaxLevels, nextLevel, paused, resetLevel } from "./config.js";
import { enemies } from "./enemies.js";
import { covers } from "./covers.js";
import { gameOver, resetCamera, win } from "./menu.js";
import { music } from "./music.js";


let finished;

let animateEnemyID;

let gameLoopID;

let scenePointer;

let cameraPointer;

let cameraState = 'scene';

const enemy_killed = new Howl({
  src: ['src/medias/sounds/Kick.wav'],
  volume: 0.5
});


const block_break = new Howl({
  src: ['src/medias/sounds/Block Break.wav'],
  volume: 0.5
});

const lose_life = new Howl({
  src: ['src/medias/sounds/Pipe.wav'],
  volume: 0.5
});

const player_death = new Howl({
  src: ['src/medias/sounds/Death.wav'],
  volume: 0.5
});


// Fonction initialisant le niveau actuel
async function initGame(scene, camera) {
  animateEnemyID = 0;
  scenePointer = scene;
  cameraPointer = camera;
  
  setCamera('scene');


  const frontLight = new THREE.DirectionalLight(0xffffff, 6);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.1);

  frontLight.position.set(0, 2, 5);
  backLight.position.set(0, 2, -5);
  fillLight.position.set(5, 2, 5);
 
  scene.add(frontLight, fillLight, backLight);
 
  scene.add(new THREE.GridHelper(40, 40));
  // Environnement
  await createEnvironment(scene);
  // Player
  player.resetPlayerGamePos();
  scene.add(player.getPlayerMesh());
  scene.add(player.getPlayerHitboxMesh());

  // Texture du fond (evolutive en fonction du niveau)
  switch(levelsConfig[actualLevel].background_type) {
    case "texture":
      var texture = new THREE.TextureLoader().load(levelsConfig[actualLevel].background, function(texture)
      {
       scene.background = texture;  
      });
      var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 0),
        new THREE.MeshBasicMaterial({
          map: texture,
        })
      );
      break;
    case "color":
      scene.background = new THREE.Color( parseInt(levelsConfig[actualLevel].background, 16) );
      break;
  }
  // Génération des ennemies
  await enemies.createEnemy();
  enemies.getEnemiesArray().forEach((enemy) => {
    scene.add(enemy);
  });
  finished = false;
  covers.createCovers(scene);
  gameLoop();
  gameKeyboard(scene);
  if(enemies.getInvincibleMode()) {
    music.startInvincibleMusic();
  } else {
    music.startAmbientMusic();
  }
}


// Boucle de jeu
function gameLoop(){
  gameLoopID = requestAnimationFrame(gameLoop);
  player.update();
  if(!paused) {
    if(cameraState == 'player') {
      updateCameraPlayer();
    }
    if(player.getInvincibleState()) {
      player.updateInvicibleMaterial()
    }
    animateMissile();
    animateBullets();
    if(enemies.getClockElapsedTime() > levelsConfig[actualLevel].enemyShootTime) {
      enemies.shoot(scenePointer);
      enemies.resetClock();
    }
    detectCollisions();
  }
  if(enemies.getEnemiesLength() == 0) {
    finished = true;
    cancelAnimationFrame(gameLoopID);
    console.log("Tous les ennemis sont morts");
    covers.clearCoversArray();
    let level = parseInt(actualLevel);
    if(level + 1 <= nbMaxLevels) {
      //covers.splice(0, covers.length);
      music.stopAll();
      nextLevel();
    } else {
      console.log("Partie terminée");
      if(player.getInvincibleState()) {
        player.toggleInvincibleMode();
        enemies.toggleInvincibleMode();
      }
      music.stopAll();
      finished = true;
      cancelAnimationFrame(gameLoopID);
      console.log("Game Over !");
      covers.clearCoversArray();
      enemies.clearBulletsArray();
      enemies.clearEnemyArray();
      player.resetPlayerRotation();
      resetLevel();
      win();
    }
  }

  if((player.getPlayerHealth() == 0)) {
    finished = true;
    cancelAnimationFrame(gameLoopID);
    if(player.getInvincibleState()) {
      player.toggleInvincibleMode();
      enemies.toggleInvincibleMode();
    }
    music.stopAll();
    //music.stopAll();
    console.log("Game Over !");
    covers.clearCoversArray();
    enemies.clearBulletsArray();
    enemies.clearEnemyArray();
    player.resetPlayerRotation();
    resetLevel();
    gameOver();
  }

  if(enemies.getEnemiesLength() != 0) {
    if(enemies.getEnemiesArray().at(enemies.getEnemiesLength() - 1).position.z > 10) {
      finished = true;
      cancelAnimationFrame(gameLoopID);
      if(player.getInvincibleState()) {
        player.toggleInvincibleMode();
        enemies.toggleInvincibleMode();
      }
      music.stopAll();
      player_death.play();
      console.log("Game Over !");
      covers.clearCoversArray();
      enemies.clearBulletsArray();
      enemies.clearEnemyArray();
      player.resetPlayerRotation();
      resetLevel();
      gameOver();
    }
  }
}

function animateBullets() {
  enemies.getBulletsArray().forEach((bullet, i) => {
    bullet.position.z += 0.3;
    if(bullet.position.z > 20) {
      scenePointer.remove(bullet);
      enemies.removeBullet(i);
    }
  })
}
 

// Fonction permettant de déplacer le missile envoyé par le joueur
function animateMissile() {
  let missilesArray = [];
  missilesArray = missiles.getMissilesArray();
  for (var i = 0; i < missilesArray.length; i++) {
    var missile = missilesArray[i];
    missile.position.z -= 0.3;
    missile.position.y = Math.abs(2 * Math.sin(missile.position.z/2));
    if (missile.position.z < -20) {
      scenePointer.remove(missile);
      missiles.clearMissilesArray();
      i--;
    }
  }
} 


// Detection des collisions
function detectCollisions() {
  let missilesArray = missiles.getMissilesArray();
  if (missilesArray.length != 0) {
    let missileWorldDirection = new THREE.Vector3();
    const missile = missilesArray.at(0);
    const raycaster = new THREE.Raycaster();
    missile.getWorldDirection(missileWorldDirection);
    raycaster.set(missile.position, missileWorldDirection);
    // Ici on vérifie à l'aide du raycaster les collisions avec les ennemies
    enemies.getEnemiesArray().every((enemy, i) => {
      const intersects = raycaster.intersectObject(enemy);
      if (intersects.length > 0) {
        enemy_killed.play();
        addPointsToScore(enemy.points);
        scenePointer.remove(missile);
        scenePointer.remove(enemy);
        missiles.clearMissilesArray();
        enemies.removeEnemy(i);
        return false;
      }
      return true;
    });
    // Ici on vérifie les collisions sur les abris
    covers.getCoversArray().every((cover, i) => {
      const healthBar = cover.children[1];
      const intersects = raycaster.intersectObject(cover);
      if (intersects.length > 0) {
        if(healthBar.children.length > 2) {
          healthBar.children.pop();
        } else {
          scenePointer.remove(cover);
          covers.removeCover(i);
        }
        block_break.play();
        scenePointer.remove(missile);
        missiles.clearMissilesArray();
        return false;
      }
      return true;
    });
  }
  enemies.getBulletsArray().forEach((bullet, i) => {
    let bulletWorldDirection = new THREE.Vector3();
    const raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, 1);
    bullet.getWorldDirection(bulletWorldDirection);
    raycaster.set(bullet.position, bulletWorldDirection.clone().add(new THREE.Vector3(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05)));
    // Ici on vérifie les collisions sur les abris
    covers.getCoversArray().every((cover, j) => {
      const healthBar = cover.children[1];
      const intersects = raycaster.intersectObject(cover);
      if (intersects.length > 0) {
        if(healthBar.children.length > 2) {
          healthBar.children.pop();
        } else {
          scenePointer.remove(cover);
          covers.removeCover(j);
        }
        block_break.play();
        scenePointer.remove(bullet);
        enemies.removeBullet(i);
        return false;
      }
      return true;
    });
    // Ici on vérifie les collisions sur le joueur
    const intersects = raycaster.intersectObject(player.getPlayerHitboxMesh());
    if (intersects.length > 0) {
      if(!enemies.getInvincibleMode()) {
        if(player.getPlayerHealth() > 1) {
          lose_life.play();
        } else {
          player_death.play();
        }
        player.decrPlayerHealth();
        scenePointer.remove(bullet);
        enemies.removeBullet(i);
      }
    }
  })
}


// Fonction de triche: Kill les tous :)
function killThemAll() {
  enemies.getEnemiesArray().forEach((enemy) => {
    scenePointer.remove(enemy);
  })
  enemies.clearEnemyArray();
}

function setCamera(type) {
  resetCamera();
  switch (type) {
    case 'scene':
      cameraState = 'scene';
      cameraPointer.position.x = 0;
      cameraPointer.position.y = 10;
      cameraPointer.position.z = 35;

      cameraPointer.update = true;
      break;
    case 'player':
      cameraState = 'player';
      break;
    case 'lateral': 
      cameraState = 'lateral';
      cameraPointer.position.x = -30;
      cameraPointer.position.y = 10;
      cameraPointer.position.z = 0;
      cameraPointer.lookAt(0, 0, 0);
      cameraPointer.update = true;
      break;
  }
}

function updateCameraPlayer() {
  let playerPosition = player.getPlayerPosition();
  cameraPointer.position.set(playerPosition.x, playerPosition.y + 5, playerPosition.z + 7);
  cameraPointer.update = true;
}

export { initGame, killThemAll, setCamera };
