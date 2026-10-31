export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
    
    this.imageNames = [
      "alligator",
      "bear",
      "chicken",
      "dog",
      "elephant",
      "fox"
    ];
    
    this.selectedIndex = 0;
  }
  
  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const selectedImage = this.registry.get("selectedImage");
    
    const savedIndex = this.imageNames.indexOf(selectedImage);
    
    this.selectedIndex = savedIndex >= 0 ? savedIndex : 0;
    
    this.add.text(
      width / 2,
      90,
      "PUZZLE SETTINGS",
      {
        fontFamily: "Arial",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#20d9ff"
      }
    ).setOrigin(0.5);
    
    this.add.text(
      width / 2,
      155,
      "Choose your picture",
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#94a3bd"
      }
    ).setOrigin(0.5);
    
    this.preview = this.add.image(
      width / 2,
      height * 0.39,
      this.imageNames[this.selectedIndex]
    );
    
    this.preview.setDisplaySize(260, 260);
    
    this.preview.setInteractive({
      useHandCursor: true
    });
    
    this.preview.on("pointerdown", () => {
      this.changeImage(1);
    });
    
    this.imageLabel = this.add.text(
      width / 2,
      height * 0.39 + 155,
      "",
      {
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#f2f6ff"
      }
    ).setOrigin(0.5);
    
    this.createButton(
      width / 2 - 130,
      height * 0.39 + 210,
      80,
      55,
      "<",
      () => {
        this.changeImage(-1);
      }
    );
    
    this.createButton(
      width / 2 + 130,
      height * 0.39 + 210,
      80,
      55,
      ">",
      () => {
        this.changeImage(1);
      }
    );
    
    this.add.text(
      width / 2,
      height * 0.39 + 275,
      "4 × 4 GRID  |  1 EMPTY TILE",
      {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#94a3bd"
      }
    ).setOrigin(0.5);
    
    this.createButton(
      width / 2,
      height - 115,
      280,
      65,
      "START PUZZLE",
      () => {
        this.registry.set(
          "selectedImage",
          this.imageNames[this.selectedIndex]
        );
        
        this.scene.start("PlayScene");
      }
    );
    
    this.createButton(
      width / 2,
      height - 40,
      160,
      45,
      "BACK",
      () => {
        this.scene.start("MenuScene");
      },
      0x18243a
    );
    
    this.updatePreview();
  }
  
  changeImage(direction) {
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.imageNames.length - 1;
    }
    
    if (this.selectedIndex >= this.imageNames.length) {
      this.selectedIndex = 0;
    }
    
    this.updatePreview();
  }
  
  updatePreview() {
    const imageName = this.imageNames[this.selectedIndex];
    
    this.preview.setTexture(imageName);
    this.imageLabel.setText(
      imageName.charAt(0).toUpperCase() + imageName.slice(1)
    );
  }
  
  createButton(
    x,
    y,
    width,
    height,
    label,
    callback,
    color = 0x12344a
  ) {
    const button = this.add.rectangle(
      x,
      y,
      width,
      height,
      color
    );
    
    button.setStrokeStyle(2, 0x20d9ff);
    
    button.setInteractive({
      useHandCursor: true
    });
    
    const text = this.add.text(
      x,
      y,
      label,
      {
        fontFamily: "Arial",
        fontSize: "21px",
        fontStyle: "bold",
        color: "#f2f6ff"
      }
    ).setOrigin(0.5);
    
    button.on("pointerover", () => {
      button.setFillStyle(0x174763);
    });
    
    button.on("pointerout", () => {
      button.setFillStyle(color);
    });
    
    button.on("pointerdown", callback);
  }
}