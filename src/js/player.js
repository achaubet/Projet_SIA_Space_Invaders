import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { actualPlayer, playerModels } from "./config";
import { scaleModel } from "./utils";

// Position par défaut
const PLAYER_BASE_POS_Y = 0;
const PLAYER_BASE_POS_Z = 0;
// Position de base du joueur en jeu
const PLAYER_GAME_POSITION_X = 0;
const PLAYER_GAME_POSITION_Y = 1;
const PLAYER_GAME_POSITION_Z = 19.5;
// Position du joueur sur le menu
const PLAYER_MENU_POSITION_X = -3;
const PLAYER_MENU_POSITION_Y = 0;
const PLAYER_MENU_POSITION_Z = 1;
// Classe joueur
class Player {
  moveDirection = new THREE.Vector3();
  moveSpeed = 0.6;
  health = 3;
  originalMaterial;
  invincibleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1,
    opacity: 0.5,

  });
  clock = new THREE.Clock();
  invincible = false;
  // Constructeur de base
  constructor() {
    this.player = new THREE.Group();
    this.player.name = "vessel";
    let playerHitboxGeometry = new THREE.BoxGeometry(1.2, 2, 1); 
    let playerHitboxMesh = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 }); 
    this.hitbox = new THREE.Mesh(playerHitboxGeometry, playerHitboxMesh);
  }
  // Permet de charger le modèle du joueur
  async loadPlayerModel() {
    const loader = new GLTFLoader();
    const bodyData = await loader.loadAsync(
      playerModels[actualPlayer].playerModel
    );
    const bodyModel = bodyData.scene;
    this.player.add(bodyModel);
    this.player.position.y = PLAYER_BASE_POS_Y;
    this.player.position.z = PLAYER_BASE_POS_Z;
  }
  // Permet de changer le modèle du joueur
  async switchPlayerModel() {
    this.player.clear();
    const loader = new GLTFLoader();
    const bodyData = await loader.loadAsync(
      playerModels[actualPlayer].playerModel
    );
    const bodyModel = bodyData.scene;
    this.player.add(bodyModel);
    this.player.position.y = PLAYER_MENU_POSITION_Y;
    this.player.position.z = PLAYER_MENU_POSITION_Z;
  }
  // Efface le contenu de la variable joueur
  removePlayerModel() {
    this.player.clear();
  }
  // Mets la position du joueur sur le jeu
  setPlayerGamePos() {
    scaleModel(this.player, 1);
    this.player.rotateY(-Math.PI / 4 + Math.PI);
    this.player.position.set(
      playerModels[actualPlayer].centerPosX,
      playerModels[actualPlayer].centerPosY,
      playerModels[actualPlayer].centerPosZ
    );
    this.hitbox.position.set(PLAYER_GAME_POSITION_X, PLAYER_GAME_POSITION_Y, this.player.position.z);
  }
  // Mets la position du joueur sur le menu
  setPlayerMenuPos() {
    this.player.rotateY(Math.PI / 4);
    this.player.position.set(
      PLAYER_MENU_POSITION_X,
      PLAYER_MENU_POSITION_Y,
      PLAYER_MENU_POSITION_Z
    );
    scaleModel(this.player, 1);
  }
  // Remets la posiiton du joueur au centre
  resetPlayerGamePos() {
    this.player.position.set(
      playerModels[actualPlayer].centerPosX,
      playerModels[actualPlayer].centerPosY,
      playerModels[actualPlayer].centerPosZ
    );
    this.hitbox.position.set(PLAYER_GAME_POSITION_X, PLAYER_GAME_POSITION_Y, this.player.position.z);
  }
  resetPlayerRotation() {
    this.player.rotateY(Math.PI);
  }
  // Mets à jour la postition du joueur
  update() {
    this.player.position.add(this.moveDirection.multiplyScalar(this.moveSpeed));
    this.hitbox.position.x = this.player.position.x;
  }
  // Déplacer le joueur
  movePlayer(direction) {
    switch (direction) {
      case "left":
        if (this.player.position.x > -20) {
          this.moveDirection.x -= 0.5;
          this.hitbox.position.x = this.player.position.x;
        }
        break;
      case "right":
        if (this.player.position.x < 20) {
          this.moveDirection.x += 0.5;
          this.hitbox.position.x = this.player.position.x;
        }
        break;
      default:
        this.moveDirection.x = 0;
        this.hitbox.position.x = this.player.position.x;
    }
  }
  // Retourne la position actuelle du joueur
  getPlayerPosition() {
    return this.player.position;
  }
  // Retourne l'objet THREE.Group() contenant l'objet 3D du joueur
  getPlayerMesh() {
    return this.player;
  }
  // Retourne l'objet THREE.Mesh() correspondant à la hitbox du joueur
  getPlayerHitboxMesh() {
    return this.hitbox;
  }
  // Retourne le nombres de vies du joueur
  getPlayerHealth() {
    return this.health;
  }
  // Reinitialise la vie du joueur
  resetPlayerHealth() {
    this.health = 3;
    const healthValue = document.getElementById("health-value");
    healthValue.textContent = this.health;
  }
  // Décremente le nombre de vie du joueur
  decrPlayerHealth() {
    this.health--;
    console.log(this.health);
    const healthValue = document.getElementById("health-value");
    healthValue.textContent--;
  }
  toggleInvincibleMode() {
    this.invincible = !this.invincible;
    if(this.invincible) {
      this.setInvincibleMaterial();
    } else {
      this.player.traverse((mesh) => {
        if(mesh.isMesh) {
          mesh.material = this.originalMaterial;
        }
      });
    }
  }
  getInvincibleState() {
    return this.invincible;
  }
  setInvincibleMaterial() {
    this.player.traverse((mesh) => {
      if(mesh.isMesh) {
        this.originalMaterial = mesh.material;
        mesh.material = this.invincibleMaterial;
      }
    });
  }
  updateInvicibleMaterial() {
    const time = this.clock.getElapsedTime();
    console.log(time);
    const intensity = time * 100;
    this.invincibleMaterial.emissiveIntensity = intensity;
    this.invincibleMaterial.emissive.setHSL(time * 10 % 1, 1, 0.5);
  }
}

let player = new Player();

export { player };
