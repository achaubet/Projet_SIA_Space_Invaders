import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Howl } from "howler";
import { gameoverKeyboard, menuKeyboard } from "./keyboard.js";
import { actualLevel, actualPlayer, healthHTML, highScore, modifyActualPlayer, paused, pauseMenuHTML, playerModels, score, scoreHTML, setEnemiesAnimationSettings, setPlayerHealth, togglePause, updatePlayerData } from "./config.js";
import { scaleModel, sleep } from "./utils.js";
import { initGame } from "./game.js";
import { player } from "./player.js";
import { enemies } from "./enemies.js";
import { music } from "./music.js";

let playButton;

let playerName = new THREE.Group();

let scenePointer;
let cameraPointer;
let rendererPointer;

const cameraParameters = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  fov: 0,
  aspect: 0,
  near: 0,
  far: 0
}

const pause = new Howl({
  src: ["src/medias/sounds/Pause.wav"],
  volume: 0.2,
});

const game_over = new Howl({
  src: ["src/medias/sounds/Gameover.wav"],
  volume: 0.3,
});

const winSFX = new Howl({
  src: ["src/medias/sounds/World_Clear.wav"],
  volume: 0.3,
});

const originalMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

function createLetterColors(text, font, fontSize, posX, posY, posZ, rotX) {
  let title = new THREE.Group();
  const colors = [0xec3a24, 0x04aee4, 0xfcd604, 0x3cb64c];
  let xOffset = 0;
  for(let i = 0; i < text.length; i++) {
    const letterTitleGeometry = new TextGeometry(text.at(i), {
      font: font,
      size: fontSize,
      height: 0.1,
    });
    const letterTitleMaterial = new THREE.MeshBasicMaterial({color: colors[i % colors.length]})
    const letterTitle = new THREE.Mesh(letterTitleGeometry, letterTitleMaterial);
    letterTitle.position.set(posX + xOffset, posY, posZ);
    letterTitle.rotateX(rotX);
    if(!(text.at(i) === " ")){
      letterTitleGeometry.computeBoundingBox();
      xOffset += letterTitleGeometry.boundingBox.max.x - letterTitleGeometry.boundingBox.min.x;
    }
    title.add(letterTitle);
  }
  return title;
}

async function createMenu(scene, camera, renderer) {
  scenePointer = scene;
  cameraPointer = camera;
  rendererPointer = renderer;
  camera.position.x = -0.2;
  camera.position.z = 4;

  cameraParameters.position.copy(camera.position);
  cameraParameters.quaternion.copy(camera.quaternion);
  cameraParameters.fov = camera.fov;
  cameraParameters.aspect = camera.aspect;
  cameraParameters.near = camera.near;
  cameraParameters.far = camera.far;

  const frontLight = new THREE.DirectionalLight(0xffffff, 5);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.8);

  frontLight.position.set(0, 2, 5);
  backLight.position.set(0, 2, -5);
  fillLight.position.set(5, 2, 5);

  scene.add(frontLight, fillLight, backLight);
  scene.add(player.getPlayerMesh());
  var loader = new FontLoader();
  loader.load("/src/fonts/Super_Mario 256_Regular.json", async function (font) {
    let texture = new THREE.TextureLoader().load(
      "./src/medias/images/overworld.gif",
      function (texture) {
        scene.background = texture;
      }
    );


    scene.add(createLetterColors("Koopa Troop", font, 0.5, -2.7, 2, 0, 0.4));
    scene.add(createLetterColors("Invaders", font, 0.2, -0.8, 1.5, 0, 0.2));

    var loaderText = new FontLoader();
    loaderText.load('/src/fonts/Pixel Emulator_Regular.json', async function (fontMenu) {
      const authorGeometry = new TextGeometry("Arnaud Chaubet", {
        font: fontMenu,
        size: 0.2,
        height: 0,
      });
      let authorMesh = new THREE.Mesh(authorGeometry, originalMaterial);
      authorMesh.name = "author";
      authorMesh.position.set(2.2, -3, 0);
      scene.add(authorMesh);
      const playGeometry = new TextGeometry("Press Enter to Play", {
        font: fontMenu,
        size: 0.2,
        height: 0,
      });
      playButton = new THREE.Mesh(playGeometry, originalMaterial);
      playButton.name = "play";
      playButton.position.set(-2, 0.5, 0);
      const play = new THREE.Group();
      play.add(playButton);
      scene.add(play);
      const scoreGeometry = new TextGeometry("- TOP: " + highScore.toString().padStart(4, '0') + " -", {
        font: fontMenu,
        size: 0.2,
        height: 0,
      });
      const scoreButton = new THREE.Mesh(scoreGeometry, originalMaterial);
      scoreButton.name = "highScore";
      scoreButton.position.set(-1.4, 1, 0);
      scene.add(scoreButton);

      let modelsData = enemies.getEnemiesModels();
      let yOffset = 0;
      for(let i = modelsData.length - 1; i >= 0; i--) {
        let bodyModel = modelsData[i].scene;
        let enemy = new THREE.Group();
        enemy.add(bodyModel.clone());
        enemy.position.set(-1.2, -2 + yOffset, 0);
        scaleModel(enemy, 0.5);
        const pointsGeometry = new TextGeometry("  = " + ((i+1) * 10).toString() + " Points", {
          font: fontMenu,
          size: 0.2,
          height: 0,
        });
        let pointsMesh = new THREE.Mesh(pointsGeometry, originalMaterial);
        pointsMesh.position.set(-1.2, -2 + yOffset, 0);
        scene.add(pointsMesh);
        scene.add(enemy);
        yOffset += 0.7;
      }
      player.setPlayerMenuPos();
      scene.add(await loadPlayer(-3, 0, 1));
    });
  });
  menuKeyboard(scene, camera, renderer);
  player.resetPlayerHealth();
  
  setPlayerHealth();
  pauseMenuHTML.style.display = "none";
  scoreHTML.style.display = "none";
  healthHTML.style.display = "none";
}


// Charge le personnage en fonction du choix du joueur
async function loadPlayer(posX, posY, posZ) {
  var loaderText = new FontLoader();
  loaderText.load('/src/fonts/Pixel Emulator_Regular.json', async function (fontMenu) {
    const playerGeometry = new TextGeometry(playerModels[actualPlayer].playerName, {
      font: fontMenu,
      size: 0.1,
      height: 0,
    });
    let playerTextMesh = new THREE.Mesh(playerGeometry, originalMaterial);
    playerTextMesh.position.set(-3.25, posY + 0.6, posZ);
    playerName.add(playerTextMesh);
  });
  return playerName;
}


// Change de personnage
async function updatePlayer(scene) {
  playerName.clear();
  await loadPlayer(-3, 0, 1);
  modifyActualPlayer();
  player.switchPlayerModel();
}

function initScoreHealthMenu() {
  scoreHTML.innerHTML = `
  <style>
    @import url('https://fonts.cdnfonts.com/css/arcade-classic');
  </style>
    <h2 style="color: white; font-family: 'ArcadeClassic', cursive;">SCORE: <span id="score-value">0</span></h2>
  `;
  scoreHTML.style.position = "absolute";
  scoreHTML.style.top = "5%";
  scoreHTML.style.left = "20%";
  scoreHTML.style.transform = "translate(-50%, -50%)";
  scoreHTML.style.zIndex = "1";
  scoreHTML.style.display = "none";
  document.body.appendChild(scoreHTML);

  healthHTML.innerHTML = `
  <style>
    @import url('https://fonts.cdnfonts.com/css/arcade-classic');
  </style>
  <h2 style="color: white; font-family: 'ArcadeClassic', cursive; display: flex; align-items: center;">
    <img src="./src/medias/textures/mario_green_mushroom.png" alt="health icon" style="height: 3em; margin-right: 0.1em;">
    x<span id="health-value">0</span>
  </h2>
`;
  healthHTML.style.position = "absolute";
  healthHTML.style.top = "5%";
  healthHTML.style.left = "80%";
  healthHTML.style.transform = "translate(-50%, -50%)";
  healthHTML.style.zIndex = "1";
  healthHTML.style.display = "none";
  document.body.appendChild(healthHTML);
}


function initPauseMenu() {
  pauseMenuHTML.innerHTML = `
    <style>
      @import url('https://fonts.cdnfonts.com/css/arcade-classic');
    </style>
    <h2 style="color: white; font-family: 'ArcadeClassic', cursive; display: flex; align-items: center;">
      PAUSE
    </h2>
  `;
  pauseMenuHTML.style.position = "absolute";
  pauseMenuHTML.style.top = "50%";
  pauseMenuHTML.style.left = "50%";
  pauseMenuHTML.style.transform = "translate(-50%, -50%)";
  pauseMenuHTML.style.zIndex = "1";
  pauseMenuHTML.style.display = "none";
  document.body.appendChild(pauseMenuHTML);
}

function pauseMenu() {
  if (!paused) {
    togglePause();
    enemies.setPause(paused);
    pause.play();
    pauseMenuHTML.style.display = "block";
  } else {
    togglePause();
    enemies.setPause(paused);
    pauseMenuHTML.style.display = "none";
  }
}

function resetCamera() {
  cameraPointer.position.copy(cameraParameters.position);
  cameraPointer.quaternion.copy(cameraParameters.quaternion);
  cameraPointer.fov = cameraParameters.fov;
  cameraPointer.aspect = cameraParameters.aspect;
  cameraPointer.near = cameraParameters.near;
  cameraPointer.far = cameraParameters.far;
  cameraPointer.updateProjectionMatrix();
  cameraPointer.position.set(-0.2, 0, 4);
}

// Gestion des differents niveaux
async function startLevel() {
  scenePointer.clear();
  while (scenePointer.children.length > 0) {
    scenePointer.remove(scenePointer.children[0]);
  }

  resetCamera();
  cameraPointer.position.set(-0.2, 0, 4);

  console.log(cameraPointer.position);
  scenePointer.background = null; 
  let levelTextMesh;
  var loaderText = new FontLoader();
  loaderText.load('/src/fonts/Pixel Emulator_Regular.json', async function (fontMenu) {
    const levelGeometry = new TextGeometry("LEVEL " + actualLevel, {
      font: fontMenu,
      size: 0.2,
      height: 0,
    });
    levelTextMesh = new THREE.Mesh(levelGeometry, originalMaterial);
    levelTextMesh.position.set(-1, 1, 0);
    scenePointer.add(levelTextMesh);
  });
  setEnemiesAnimationSettings();
  if(score > highScore) {
    updatePlayerData();
  }
  scoreHTML.style.display = "block";
  healthHTML.style.display = "block";
  await sleep(1000);
  scenePointer.remove(levelTextMesh);
  music.initLevelMusic();
  initGame(scenePointer, cameraPointer);
}

async function gameOver() {
  await sleep(3000);
  game_over.play();
  scenePointer.clear();
  while (scenePointer.children.length > 0) {
    scenePointer.remove(scenePointer.children[0]);
  }

  resetCamera();

  scenePointer.background = null; 
  let levelTextMesh;
  let infoTextMesh;
  var loaderText = new FontLoader();
  loaderText.load('/src/fonts/Pixel Emulator_Regular.json', async function (fontMenu) {
    const levelGeometry = new TextGeometry("GAME OVER", {
      font: fontMenu,
      size: 0.2,
      height: 0,
    });
    levelTextMesh = new THREE.Mesh(levelGeometry, originalMaterial);
    levelTextMesh.position.set(-1, 1, 0);
    scenePointer.add(levelTextMesh);

    const infoGeometry = new TextGeometry("PRESS ENTER TO RETURN TO MENU", {
      font: fontMenu,
      size: 0.2,
      height: 0,
    });
    infoTextMesh = new THREE.Mesh(infoGeometry, originalMaterial);
    infoTextMesh.position.set(-3, -1, 0);
    //scenePointer.add(levelTextMesh);
  });
  setEnemiesAnimationSettings();
  if(score > highScore) {
    updatePlayerData();
  }
  scoreHTML.style.display = "block";
  healthHTML.style.display = "none";
  await sleep(3000);
  gameoverKeyboard(scenePointer, cameraPointer, rendererPointer);
  scenePointer.add(infoTextMesh);
}

async function win() {
  await sleep(200);
  winSFX.play();
  scenePointer.clear();
  while (scenePointer.children.length > 0) {
    scenePointer.remove(scenePointer.children[0]);
  }
  resetCamera();
  cameraPointer.position.set(-0.2, 0, 4);
  scenePointer.background = null; 
  let levelTextMesh;
  let infoTextMesh;
  var loaderText = new FontLoader();
  loaderText.load('/src/fonts/Pixel Emulator_Regular.json', async function (fontMenu) {
    const levelGeometry = new TextGeometry("CONGRATULATION, YOU WON!", {
      font: fontMenu,
      size: 0.2,
      height: 0,
    });
    levelTextMesh = new THREE.Mesh(levelGeometry, originalMaterial);
    levelTextMesh.position.set(-2.5, 1, 0);
    scenePointer.add(levelTextMesh);

    const infoGeometry = new TextGeometry("PRESS ENTER TO RETURN TO MENU", {
      font: fontMenu,
      size: 0.2,
      height: 0,
    });
    infoTextMesh = new THREE.Mesh(infoGeometry, originalMaterial);
    infoTextMesh.position.set(-3, -1, 0);
  });
  setEnemiesAnimationSettings();
  if(score > highScore) {
    updatePlayerData();
  }
  scoreHTML.style.display = "block";
  healthHTML.style.display = "none";
  await sleep(3000);
  gameoverKeyboard(scenePointer, cameraPointer, rendererPointer);
  scenePointer.add(infoTextMesh);
}

export { createMenu, initPauseMenu, pauseMenu, updatePlayer, startLevel, initScoreHealthMenu, gameOver, win, resetCamera };
