import {Button} from "../entities/Button.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.menuElements = [];

        this.createTitle(width, height);
        this.createMainButtons(width, height);
        this.createFooter(width, height);

        this.scale.on(
            "resize",
            this.handleResize,
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
            height * 0.25,
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
            .setShadow(0, 0, "#20d9ff", 12, true, true);

        this.subtitleText = this.add.text(
            width / 2,
            height * 0.25 + titleFontSize + 12,
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

        const playButtonHeight = 72;
        const instructionsButtonHeight = 62;

        const buttonGap = Math.max(
            24,
            Math.min(34, height * 0.045)
        );

        const centerY = height * 0.55;

        const playButtonY =
            centerY -
            (instructionsButtonHeight + buttonGap) / 2;

        const instructionsButtonY =
            centerY +
            (playButtonHeight + buttonGap) / 2;

        this.playButton = new Button(
            this,
            width / 2,
            playButtonY,
            buttonWidth,
            playButtonHeight,
            "PLAY",
            () => {
                this.scene.start("SettingsScene");
            }
        );

        this.instructionsButton = new Button(
            this,
            width / 2,
            instructionsButtonY,
            buttonWidth,
            instructionsButtonHeight,
            "HOW TO PLAY",
            () => {
                this.showInstructions();
            }
        );

        this.playButton.setDepth(1);
        this.instructionsButton.setDepth(1);
    }

    createFooter(width, height) {
        const footerFontSize = Math.max(
            11,
            Math.min(14, Math.floor(width * 0.035))
        );

        this.footerText = this.add.text(
            width / 2,
            height - 28,
            "BLANKSHIFT",
            {
                fontFamily: "Arial",
                fontSize: `${footerFontSize}px`,
                fontStyle: "bold",
                color: "#52617b",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.menuElements.push(this.footerText);
    }

    showInstructions() {
        if (this.instructionElements) {
            return;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        this.instructionElements = [];

        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x050713,
            0.97
        );

        overlay
            .setDepth(10)
            .setInteractive();

        const panelWidth = Math.min(
            width * 0.9,
            620
        );

        const panelHeight = Math.min(
            height * 0.84,
            540
        );

        const panel = this.add.rectangle(
            width / 2,
            height / 2,
            panelWidth,
            panelHeight,
            0x0a1225,
            1
        );

        panel
            .setStrokeStyle(2, 0x20d9ff, 0.9)
            .setDepth(11);

        const headingFontSize = Math.max(
            22,
            Math.min(32, Math.floor(width * 0.07))
        );

        const bodyFontSize = Math.max(
            14,
            Math.min(21, Math.floor(width * 0.043))
        );

        const heading = this.add.text(
            width / 2,
            height / 2 - panelHeight * 0.37,
            "HOW TO PLAY",
            {
                fontFamily: "Arial",
                fontSize: `${headingFontSize}px`,
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5).setDepth(12);

        heading.setShadow(
            0,
            0,
            "#20d9ff",
            8,
            true,
            true
        );

        const instructionLines = [
            "1. Study the scrambled picture.",
            "",
            "2. Move an image tile into a blank space.",
            "",
            "3. A move must involve a blank tile.",
            "",
            "4. Invalid moves snap back.",
            "",
            "5. Reconstruct the original picture to win."
        ];

        const instructions = this.add.text(
            width / 2,
            height / 2 - 10,
            instructionLines.join("\n"),
            {
                fontFamily: "Arial",
                fontSize: `${bodyFontSize}px`,
                color: "#d7e3f7",
                align: "center",
                lineSpacing: 6,
                wordWrap: {
                    width: panelWidth - 36,
                    useAdvancedWrap: true
                },
                resolution: 2
            }
        ).setOrigin(0.5).setDepth(12);

        const closeButtonWidth = Math.min(
            200,
            panelWidth * 0.65
        );

        const closeButton = new Button(
            this,
            width / 2,
            height / 2 + panelHeight * 0.37,
            closeButtonWidth,
            48,
            "CLOSE",
            () => {
                this.closeInstructions();
            }
        );

        closeButton.setDepth(12);

        this.instructionElements.push(
            overlay,
            panel,
            heading,
            instructions
        );

        this.instructionCloseButton = closeButton;
    }

    closeInstructions() {
        if (!this.instructionElements) {
            return;
        }

        this.instructionElements.forEach((element) => {
            if (element && element.destroy) {
                element.destroy();
            }
        });

        this.instructionElements = null;

        if (this.instructionCloseButton) {
            this.instructionCloseButton.destroy();
            this.instructionCloseButton = null;
        }
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

        this.closeInstructions();

        this.createTitle(width, height);
        this.createMainButtons(width, height);
        this.createFooter(width, height);
    }

    shutdown() {
        this.scale.off(
            "resize",
            this.handleResize,
            this
        );

        this.closeInstructions();
    }
}