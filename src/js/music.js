import { Howl } from 'howler';
import { actualLevel, levelsConfig } from './config';

class Music {
    enabled = true;
    level_music
    invincible_music = new Howl({
        src: ['src/medias/sounds/Starman.mp3'],
        volume: 0.5,
        loop: true
    });

    initLevelMusic() {
        if(this.level_music != null) {
            this.level_music.unload();
        }
        this.level_music = new Howl({
            src: [levelsConfig[actualLevel].ambient_music],
            volume: 0.5,
            loop: true
        });
    }

    startAmbientMusic() {
        this.level_music.play();
        this.level_music.loop();
    }

    stopAmbientMusic() {
        this.level_music.stop();
    }

    startInvincibleMusic() {
        this.invincible_music.play();
        this.invincible_music.loop();
    }

    stopInvincibleMusic() {
        this.invincible_music.stop();
    }

    stopAll() {
        this.level_music.stop();
        this.invincible_music.stop();
    }

    toggleMusic() {
        this.enabled = !this.enabled;
        if(this.enabled) {
            this.level_music.mute(true);
            this.invincible_music.mute(true);
        } else {
            this.level_music.mute(false);
            this.invincible_music.mute(false);
        }
    }

}

let music = new Music()

export { music }