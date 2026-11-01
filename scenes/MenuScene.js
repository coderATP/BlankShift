import { Button } from "../entities/Button.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
        
        this.menuElements = [];
        
        this.playButton = null;
        this.instructionsButton = null;
        this.creditsButton = null;
    }
    
    create() {
        this.audioManager =
            this.game.scene.keys.PreloadScene.audioManager;
        
        const width = this.scale.width;
        const height = this.scale.height;
        
        this.menuElements = [];
        
        this.createTitle(width, height);
        this.createMainButtons(width, height);
        
        this.scale.on(
            "resize",
            this.handleResize,
            this
        );
        
        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }
    
    createTitle(width, height) {
        const titleFontSize = Math.max(
            34,
            Math.min(64, Math.floor(width * 0.12))
        );
        
        const subtitleFontSize = Math.max(
            14,
            Math.min(24, Math.floor(width * 0.045))
        );
        
        this.titleText = this.add.text(
            width / 2,
            height * 0.23,
            "BLANKSHIFT",
            {
                fontFamily: "Arial",
                fontSize: `${titleFontSize}px`,
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        );
        
        this.titleText
            .setOrigin(0.5)
            .setShadow(
                0,
                0,
                "#20d9ff",
                12,
                true,
                true
            );
        
        this.subtitleText = this.add.text(
            width / 2,
            height * 0.23 + titleFontSize + 4,
            "Every Piece Has Its Place.",
            {
                fontFamily: "Arial",
                fontSize: `${subtitleFontSize}px`,
                color: "#94a3bd",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);
        
        this.menuElements.push(
            this.titleText,
            this.subtitleText
        );
    }
    
    createMainButtons(width, height) {
        const buttonWidth = Math.min(
            320,
            width * 0.78
        );
        
        const buttonHeight = 58;
        
        const buttonGap = Math.max(
            14,
            Math.min(22, height * 0.025)
        );
        
        const totalHeight =
            buttonHeight * 3 +
            buttonGap * 2;
        
        const startY =
            height * 0.55 -
            totalHeight / 2 +
            buttonHeight / 2;
        
        this.playButton = new Button(
            this,
            width / 2,
            startY,
            buttonWidth,
            buttonHeight,
            "PLAY",
            () => {
                this.audioManager.play(
                    this.audioManager.clickSound
                );
                
                this.scene.start("SettingsScene");
            }
        );
        
        this.instructionsButton = new Button(
            this,
            width / 2,
            startY + buttonHeight + buttonGap,
            buttonWidth,
            buttonHeight,
            "HOW TO PLAY",
            () => {
                this.audioManager.play(
                    this.audioManager.clickSound
                );
                
                this.scene.start("TutorialScene");
            }
        );
        
        this.creditsButton = new Button(
            this,
            width / 2,
            startY + (buttonHeight + buttonGap) * 2,
            buttonWidth,
            buttonHeight,
            "CREDITS",
            () => {
                this.audioManager.play(
                    this.audioManager.clickSound
                );
                
                this.scene.start("CreditsScene");
            }
        );
        
        this.playButton.setDepth(1);
        this.instructionsButton.setDepth(1);
        this.creditsButton.setDepth(1);
    }
    
    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        this.menuElements.forEach((element) => {
            if (element && element.active) {
                element.destroy();
            }
        });
        
        this.menuElements = [];
        
        if (this.playButton) {
            this.playButton.destroy();
            this.playButton = null;
        }
        
        if (this.instructionsButton) {
            this.instructionsButton.destroy();
            this.instructionsButton = null;
        }
        
        if (this.creditsButton) {
            this.creditsButton.destroy();
            this.creditsButton = null;
        }
        
        this.createTitle(width, height);
        this.createMainButtons(width, height);
    }
    
    shutdown() {
        this.scale.off(
            "resize",
            this.handleResize,
            this
        );
    }
}