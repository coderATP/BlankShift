import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import SettingsScene from "./scenes/SettingsScene.js";
import PlayScene from "./scenes/PlayScene.js";

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
    SettingsScene,
    PlayScene
  ]
};

const game = new Phaser.Game(gameConfig);

export default game;