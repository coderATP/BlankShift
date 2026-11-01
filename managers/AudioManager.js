export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    
    this.isMuted = false;
    this.masterVolume = 1;
    
    this.soundFiles = {
      shuffle: "shuffle",
      time_up: "time_up",
      level_fail: "level_fail",
      level_complete: "level_complete",
      click: "click"
    };
    
    this.audioElements = new Map();
    
    this.createAudioElements();
  }
  
  createAudioElements() {
    Object.entries(this.soundFiles).forEach(([key, audioKey]) => {
      if (!this.scene.cache.audio.exists(audioKey)) {
        console.warn(
          `Audio file "${audioKey}" has not been loaded.`
        );
        
        return;
      }
      
      const audio = this.scene.sound.add(audioKey, {
        volume: this.masterVolume
      });
      
      this.audioElements.set(key, audio);
      
      const propertyName = this.toCamelCase(key);
      
      this[`${propertyName}Sound`] = audio;
    });
  }
  
  toCamelCase(value) {
    return value.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
  }
  
  play(audio) {
    if (!audio || this.isMuted) {
      return;
    }
    
    try {
      audio.stop();
      
      audio.setVolume(this.masterVolume);
      
      audio.play();
    } catch (error) {
      console.warn(
        "Unable to play audio:",
        error
      );
    }
  }
  
  stop(audio) {
    if (!audio) {
      return;
    }
    
    try {
      audio.stop();
    } catch (error) {
      console.warn(
        "Unable to stop audio:",
        error
      );
    }
  }
  
  pause(audio) {
    if (!audio) {
      return;
    }
    
    try {
      audio.pause();
    } catch (error) {
      console.warn(
        "Unable to pause audio:",
        error
      );
    }
  }
  
  resume(audio) {
    if (!audio || this.isMuted) {
      return;
    }
    
    try {
      audio.resume();
    } catch (error) {
      console.warn(
        "Unable to resume audio:",
        error
      );
    }
  }
  
  stopAll() {
    this.audioElements.forEach(audio => {
      this.stop(audio);
    });
  }
  
  setVolume(volume) {
    const normalizedVolume = Number(volume);
    
    if (!Number.isFinite(normalizedVolume)) {
      return;
    }
    
    this.masterVolume = Math.max(
      0,
      Math.min(1, normalizedVolume)
    );
    
    this.audioElements.forEach(audio => {
      audio.setVolume(this.masterVolume);
    });
  }
  
  mute() {
    this.isMuted = true;
    
    this.stopAll();
  }
  
  unmute() {
    this.isMuted = false;
  }
  
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    
    return this.isMuted;
  }
  
  destroy() {
    this.stopAll();
    
    this.audioElements.forEach(audio => {
      audio.destroy();
    });
    
    this.audioElements.clear();
  }
}