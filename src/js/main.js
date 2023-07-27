import * as THREE from 'three'
import { composer, enemiesModels, help, initPostProcessing, jsonParser, paused } from './config.js';
import { createMenu, initPauseMenu, initScoreHealthMenu } from './menu.js'
import { missiles } from './missile.js';
import { player } from './player.js';
import { enemies } from './enemies.js';


let scene, camera, renderer;
let clock = new THREE.Clock;


// Initialisation de la scène, de la caméra et du renderer
async function init() {
    await jsonParser();
    console.log(enemiesModels["enemy"+ (1).toString()]);
    console.log();
    scene = new THREE.Scene();
    scene.name = 'global';
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    
    initHelpMenu();
    initPauseMenu();
    initScoreHealthMenu();

    await missiles.loadMissileData();
    await player.loadPlayerModel();
    await enemies.initEnemiesModels();
    enemies.animateEnemies();
    

    createMenu(scene, camera, renderer);
    initPostProcessing(scene, camera, renderer);
    animate();
}


// Gestion de l'animation et du render
function animate() {
    requestAnimationFrame(animate);
    if(!paused) {
        const delta = clock.getDelta();
        scene.traverse(function(object) {
            if (object.name === 'enemy' && object.mixer) {
                object.mixer.update(delta);
            }
        });
        render();
    }
}

function render() {
    renderer.physicallyCorrectLights = true;
    composer.render();
}

function initHelpMenu() {
    help.innerHTML = `
      <style>
        @import url('https://fonts.cdnfonts.com/css/arcade-classic');
      </style>
      <div style="color: white; font-family: 'ArcadeClassic', cursive;">
        <p> <-: Move  the  player  to  the  left </p>
        <p> ->: Move  the  player  to  the  right </p>
        <p> Space: Shoot </p>
        <p> E: Post-Processing </p>
        <p> I : Invincible Mode </p>
        <p> K : Kill them all </p>
        <p> ESC : Pause </p>
        <hr style="height:35pt; visibility:hidden;" />
        <p> H : Show this help </p>
        <p> M: Enable / Disable Music </p>
        <p> 0 : Camera Normal </p>
        <p> 1 : Camera Follow Player </p>
        <p> 2 : Camera Lateral </p>
      </div>
    `;
    help.style.position = "absolute";
    help.style.top = "44%";
    help.style.left = "10%";
    help.style.transform = "translate(-50%, -50%)";
    help.style.zIndex = "1";
    help.style.display = "none";
    document.body.appendChild(help);
  }

init();

