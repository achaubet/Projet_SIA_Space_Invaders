import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { FilmPass } from 'three-stdlib';
import { startLevel } from "./menu";
import { player } from './player';
// Variables globales
// Composer (Post-Processing)
let composer;
// Paramètres du joueur
let playerModels;
let actualPlayer;
let highScore;
let score = 0;
let playerHealth = 3;
// Paramètres des ennemies
let enemiesModels;
let enemiesAnimationSettings = {
    time: 0,
    directionTranslateX: "+",
    switchedDirection: false,
    translateX: 1,
    translateZ: 0,
    enemyByLines: 5,
};
// Paramètres des niveaux
let levelsConfig;
let nbMaxLevels;
let actualLevel = "1";

let pauseMenuHTML = document.createElement('div');

let scoreHTML = document.createElement('div');

let healthHTML = document.createElement('div');

let help = document.createElement('div');

let paused = false;

async function jsonParser() {
    await fetch("./src/config/config.json")
    .then(data => data.json())
    .then(jsonData => {
        enemiesModels = jsonData.enemiesModels;
        playerModels = jsonData.playerModels;
        levelsConfig = jsonData.levels;
        nbMaxLevels = Object.keys(levelsConfig).length;
    });
    console.log(levelsConfig[actualLevel]);
    actualPlayer = localStorage.getItem('koopaTroop.actualPlayer');
    if(actualPlayer == null) {
        localStorage.setItem('koopaTroop.actualPlayer', 'player0');
        actualPlayer = localStorage.getItem('koopaTroop.actualPlayer');
    }
    highScore = localStorage.getItem('koopaTroop.highScore');
    console.log(highScore);
    if(highScore == null){
        localStorage.setItem('koopaTroop.highScore', 0);
        highScore = localStorage.getItem('koopaTroop.highScore');
    }
    console.log(actualPlayer);
}

function initPostProcessing(scene, camera, renderer) {
    composer = new EffectComposer(renderer);
    let renderPass = new RenderPass(scene, camera);
    let filmPass = new FilmPass(0.40, 0.045, 648, false);
    filmPass.renderToScreen = true;
    filmPass.enabled = false;
    composer.addPass(renderPass);
    composer.addPass(filmPass);
    composer.setSize(window.innerWidth, window.innerHeight);
    console.log(composer);
}

function modifyActualPlayer() {
    const actualPlayerNumber = parseInt(actualPlayer.slice(6));
    const newPlayer = (actualPlayerNumber + 1) % Object.keys(playerModels).length;
    actualPlayer = "player" + newPlayer.toString();
    console.log(actualPlayer);
    updatePlayerData();
}

function updatePlayerData() {
    localStorage.setItem('koopaTroop.highScore', score);
    localStorage.setItem('koopaTroop.actualPlayer', actualPlayer);
    highScore = score;
}

function togglePostProc() {
    composer.passes[1].enabled = !composer.passes[1].enabled;
}

function togglePause() {
    paused = !paused;
}

function setEnemiesAnimationSettings() {
    enemiesAnimationSettings.time = levelsConfig[actualLevel].enemyMaxTime;
    enemiesAnimationSettings.directionTranslateX = "+";
    enemiesAnimationSettings.switchedDirection = false;
    enemiesAnimationSettings.translateX = 1;
    enemiesAnimationSettings.translateZ = 0;
    enemiesAnimationSettings.enemyByLines = 5;
}

function decrAlienAnimTime() {
    enemiesAnimationSettings.time -= levelsConfig[actualLevel].enemyMaxTime / ((enemiesAnimationSettings.enemyByLines * Object.keys(enemiesModels).length) + 10)
}

function decrPlayerHealth() {
    playerHealth--;
    updatePlayerHealth(playerHealth);
}

function setPlayerHealth() {
    playerHealth = 3;
    updatePlayerHealth(playerHealth);
}

function updatePlayerHealth() {

}

function addPointsToScore(points) {
    score += points;
    console.log(score);
    const scoreValue = document.getElementById("score-value");
    scoreValue.textContent = score;
}

async function nextLevel() {
    let level = parseInt(actualLevel);
    level++;
    actualLevel = level.toString();
    await startLevel();
}

function resetLevel() {
    actualLevel = "1";
}

function resetScore() {
    score = 0;
}

export {
  enemiesAnimationSettings,
  enemiesModels,
  playerModels,
  actualPlayer,
  highScore,
  score,
  levelsConfig,
  nbMaxLevels,
  actualLevel,
  pauseMenuHTML,
  paused,
  scoreHTML,
  healthHTML,
  composer,
  help,
  initPostProcessing,
  togglePostProc,
  setEnemiesAnimationSettings,
  decrAlienAnimTime,
  decrPlayerHealth,
  setPlayerHealth,
  updatePlayerData,
  addPointsToScore,
  togglePause,
  modifyActualPlayer,
  jsonParser,
  nextLevel,
  resetLevel,
  resetScore
};