export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }
  
  preload() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.add.text(
      width / 2,
      height / 2 - 50,
      "BLANKSHIFT",
      {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#20d9ff"
      }
    ).setOrigin(0.5);
    
    this.add.text(
      width / 2,
      height / 2 + 10,
      "Preparing your puzzle...",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#94a3bd"
      }
    ).setOrigin(0.5);
    
    const progressBarWidth = 300;
    const progressBarHeight = 12;
    
    const progressBackground = this.add.rectangle(
      width / 2,
      height / 2 + 65,
      progressBarWidth,
      progressBarHeight,
      0x25334c
    );
    
    const progressBar = this.add.rectangle(
      width / 2 - progressBarWidth / 2,
      height / 2 + 65,
      0,
      progressBarHeight,
      0x20d9ff
    );
    
    progressBar.setOrigin(0, 0.5);
    
    this.load.on("progress", (value) => {
      progressBar.width = progressBarWidth * value;
    });
    
    this.load.on("complete", () => {
      progressBackground.destroy();
      progressBar.destroy();
    });
    
    const images = [
      "alligator",
      "bear",
      "chicken",
      "dog",
      "elephant",
      "fox"
    ];
    
    images.forEach((imageName) => {
      this.load.image(
        imageName,
        `assets/images/${imageName}.jpg`
      );
    });
  }
  
  create() {
    this.registry.set("selectedImage", "alligator");
    this.registry.set("shuffleCount", 80);
    
    this.scene.start("MenuScene");
  }
}