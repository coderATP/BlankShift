import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import SettingsScene from "./scenes/SettingsScene.js";
import PlayScene from "./scenes/PlayScene.js";
import LevelCompleteScene from "./scenes/LevelCompleteScene.js";
import TutorialScene from "./scenes/TutorialScene.js";
import CreditsScene from "./scenes/CreditsScene.js";

const gameConfig = {
  type: Phaser.AUTO,
  
  parent: "game-container",
  
  width: window.innerWidth,
  height: window.innerHeight,
  
  backgroundColor: "#080b16",
  transparent: true,
  
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  
  input: {
    activePointers: 2
  },
  
  scene: [
    PreloadScene,
    MenuScene,
    TutorialScene,
    CreditsScene,
    SettingsScene,
    PlayScene,
    LevelCompleteScene
]
};

let game;

async function initializeGame() {
  try {
    await Promise.all([
      document.fonts.load('10px "Mario"'),
      document.fonts.load('20px "AngryBird"')
    ]);
    
    await document.fonts.ready;
    
    game = new Phaser.Game(gameConfig);
    
  } catch (error) {
    console.error("Font loading failed:", error);
    
    game = new Phaser.Game(gameConfig);
  }
}

initializeGame();

export default game;