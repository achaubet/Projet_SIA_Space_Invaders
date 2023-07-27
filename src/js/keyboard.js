import { Key, Keyboard } from 'keyboard-ts';
import { killThemAll, setCamera } from './game.js';
import { createMenu, pauseMenu, startLevel, updatePlayer } from './menu.js';
import { player } from './player.js';
import { missiles } from './missile.js';
import { help, paused, resetScore, togglePostProc } from './config.js';
import { enemies } from './enemies.js';
import { music } from './music.js';

var keyboard;

function gameKeyboard(scene) {
    keyboard.clear();
    const domElt = document.getElementById('keyboard');
    domElt.tabIndex = 1;
    domElt.focus();
    keyboard = new Keyboard(domElt);
   

    keyboard.on([ Key.RightArrow ], () => {
        if(!paused) {
            player.movePlayer("right");
        }
    });
    
    keyboard.on([ Key.LeftArrow ], () => {
        if(!paused) {
            player.movePlayer("left");
        }
    });
    
    keyboard.on([ Key.RightArrow, Key.Space ], () => {
        if(!paused) {
            player.movePlayer("right");
            missiles.createMissile(scene);
        }
    });
    
    keyboard.on([ Key.LeftArrow, Key.Space ], () => {
        if(!paused) {
            player.movePlayer("left");
            missiles.createMissile(scene);
        }
    });
    
    keyboard.on([ Key.Space ], () => {
        if(!paused) {
            missiles.createMissile(scene);
        }
    });

    keyboard.on([ Key.Escape ], () => {
        pauseMenu();
    });

    keyboard.on([ Key.K ], () => {
        killThemAll();
    });

    keyboard.on([ Key.I ], () => {
        enemies.toggleInvincibleMode();
        player.toggleInvincibleMode();
    });

    keyboard.on([ Key.E ], () => {
        togglePostProc();
    });

    keyboard.on([ Key.Q ], () => {
        player.decrPlayerHealth();
    });

    keyboard.on([ Key.Zero ], () => {
        setCamera('scene');
    });

    keyboard.on([ Key.One ], () => {
        setCamera('player');
    });

    keyboard.on([ Key.Two ], () => {
        setCamera('lateral');
    });

    keyboard.on([ Key.H ], () => {
        if(help.style.display == "none") {
            help.style.display = "block";
        } else {
            help.style.display = "none";
        }
    });

    keyboard.on([ Key.M ], () => {
        music.toggleMusic();
    });
}

async function menuKeyboard(scene, camera, renderer) {
    const domElt = document.getElementById('keyboard');
    domElt.tabIndex = 1;
    domElt.focus();
    keyboard = new Keyboard(domElt);

    keyboard.on([ Key.P ], async () => {
        await updatePlayer(scene);
    });

    keyboard.on([ Key.Enter ], async () => {
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        scene.clear();
        keyboard.clear();
        player.setPlayerGamePos();
        await startLevel();
    });

    keyboard.on([ Key.E ], () => {
        togglePostProc();
    });

    keyboard.on([ Key.H ], () => {
        if(help.style.display == "none") {
            help.style.display = "block";
        } else {
            help.style.display = "none";
        }
    });
}

function gameoverKeyboard(scene, camera, renderer) {
    keyboard.clear();
    const domElt = document.getElementById('keyboard');
    domElt.tabIndex = 1;
    domElt.focus();
    keyboard = new Keyboard(domElt);
    keyboard.on([ Key.Enter ], async () => {
        resetScore();
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        scene.clear();
        keyboard.clear();
        createMenu(scene, camera, renderer);
    });
}

export { gameKeyboard, menuKeyboard, gameoverKeyboard };