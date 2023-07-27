// Crée l'environnement du jeu comme le sol, le fond, le drapeau ...
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scaleModel } from './utils';
import { actualLevel, levelsConfig } from './config';

async function createEnvironment(scene) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    // Chargement de la texture pour le sol
    let material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(levelsConfig[actualLevel].block_texture)
    });
    // Création du sol
    for(let i = -20.5; i <= 20.5; i++) {
        for(let j = -20.5; j <= 20.5; j++) {
            let cube = new THREE.Mesh(geometry, material);
            cube.name = "environment";
            cube.position.x = i;
            cube.position.z = j;
            cube.position.y = -0.5;
            scene.add(cube);
        }
    }
    // Ajout du drapeau
    const loader = new GLTFLoader();
    const flagData = await loader.loadAsync('./src/medias/models/mario_flag/scene.gltf');
    const flagModel = flagData.scene;
    let flag = new THREE.Group();
    flag.name = "environment";
    flag.add(flagModel);
    scaleModel(flag, 9);
    flag.position.set(-142.4, -0.8, -20.5);
    scene.add(flag);
    // Ajout du chateau
    const castleLoader = new GLTFLoader();
    const castleData = await castleLoader.loadAsync('./src/medias/models/castle/scene.gltf');
    const castleModel = castleData.scene;
    let castle = new THREE.Group();
    castle.name = "environment";
    castle.add(castleModel);
    scaleModel(castle, 10);
    castle.position.set(15, 0, -20.5);
    scene.add(castle);
}


export { createEnvironment }