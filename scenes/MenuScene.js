export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }
  
  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.add.text(
      width / 2,
      height * 0.25,
      "BLANKSHIFT",
      {
        fontFamily: "Arial",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#20d9ff",
        align: "center"
      }
    ).setOrigin(0.5);
    
    this.add.text(
      width / 2,
      height * 0.25 + 75,
      "Reconstruct the picture.",
      {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#94a3bd",
        align: "center"
      }
    ).setOrigin(0.5);
    
    this.createButton(
      width / 2,
      height * 0.52,
      300,
      70,
      "PLAY",
      () => {
        this.scene.start("SettingsScene");
      }
    );
    
    this.createButton(
      width / 2,
      height * 0.52 + 100,
      300,
      60,
      "HOW TO PLAY",
      () => {
        this.showInstructions();
      },
      0x18243a
    );
    
    this.add.text(
      width / 2,
      height - 45,
      "BLANKSHIFT",
      {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#52617b"
      }
    ).setOrigin(0.5);
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
        fontSize: "22px",
        fontStyle: "bold",
        color: "#f2f6ff"
      }
    ).setOrigin(0.5);
    
    button.on("pointerover", () => {
      button.setFillStyle(0x174763);
      text.setColor("#20d9ff");
    });
    
    button.on("pointerout", () => {
      button.setFillStyle(color);
      text.setColor("#f2f6ff");
    });
    
    button.on("pointerdown", callback);
  }
  
  showInstructions() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x080b16,
      0.96
    );
    
    overlay.setDepth(10);
    
    const instructions = this.add.text(
      width / 2,
      height / 2 - 100,
      [
        "HOW TO PLAY",
        "",
        "1. Study the scrambled picture.",
        "",
        "2. Drag an image tile onto a blank tile.",
        "",
        "3. Only swaps involving a blank tile",
        "    are allowed.",
        "",
        "4. Invalid moves snap back.",
        "",
        "5. Reconstruct the original picture",
        "    to win."
      ].join("\n"),
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#f2f6ff",
        align: "center",
        lineSpacing: 8
      }
    ).setOrigin(0.5).setDepth(11);
    
    const closeButton = this.add.text(
      width / 2,
      height / 2 + 245,
      "CLOSE",
      {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#20d9ff",
        backgroundColor: "#18243a",
        padding: {
          x: 28,
          y: 14
        }
      }
    ).setOrigin(0.5).setDepth(11);
    
    closeButton.setInteractive({
      useHandCursor: true
    });
    
    closeButton.on("pointerdown", () => {
      overlay.destroy();
      instructions.destroy();
      closeButton.destroy();
    });
  }
}