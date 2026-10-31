import { Button } from "../entities/Button.js";
import { getEmptyTileCount } from "../utils/EmptyTileConfig.js";

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super("SettingsScene");

        this.imageNames = [
            "123",
            "abc",
            "alligator",
            "bear",
            "chicken",
            "dog",
            "elephant",
            "fox"
        ];

        this.selectedIndex = 0;

        this.navigationButtons = [];
        this.menuElements = [];
    }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Default to the first image unless a valid selection exists.
    const selectedImage = this.registry.get("selectedImage");
    
    const savedIndex = this.imageNames.indexOf(selectedImage);
    
    this.selectedIndex = savedIndex >= 0 ?
        savedIndex :
        0;
    
    this.createHeading(width, height);
    this.createImagePreview(width, height);
    this.createImageNavigation(width, height);
    this.createGridInformation(width, height);
    this.createActionButtons(width, height);
    
    this.updatePreview();
    
    this.scale.off(
        "resize",
        this.handleResize,
        this
    );
    
    this.scale.on(
        "resize",
        this.handleResize,
        this
    );
    
}

    createHeading(width, height) {
        const titleFontSize = Math.max(
            28,
            Math.min(42, Math.floor(width * 0.085))
        );

        const subtitleFontSize = Math.max(
            15,
            Math.min(22, Math.floor(width * 0.045))
        );

        this.titleText = this.add.text(
            width / 2,
            height * 0.105,
            "PUZZLE SETTINGS",
            {
                fontFamily: "Arial",
                fontSize: `${titleFontSize}px`,
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.titleText.setShadow(
            0,
            0,
            "#20d9ff",
            8,
            true,
            true
        );

        this.subtitleText = this.add.text(
            width / 2,
            height * 0.17,
            "Choose your picture",
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

    createImagePreview(width, height) {
        const previewSize = Math.min(
            260,
            width * 0.62,
            height * 0.34
        );

        const previewY = height * 0.40;

        this.preview = this.add.image(
            width / 2,
            previewY,
            this.imageNames[this.selectedIndex]
        );

        this.preview
            .setDisplaySize(previewSize, previewSize)
            .setInteractive({
                useHandCursor: true
            });

        this.preview.on("pointerdown", () => {
            this.changeImage(1);
        });

        this.imageLabel = this.add.text(
            width / 2,
            previewY + previewSize / 2 + 30,
            "",
            {
                fontFamily: "Arial",
                fontSize: "25px",
                fontStyle: "bold",
                color: "#f2f6ff",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.imageCounter = this.add.text(
            width / 2,
            previewY + previewSize / 2 + 62,
            "",
            {
                fontFamily: "Arial",
                fontSize: "17px",
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.menuElements.push(
            this.preview,
            this.imageLabel,
            this.imageCounter
        );
    }

    createImageNavigation(width, height) {
        const previewY = height * 0.40;
        const previewSize = Math.min(
            260,
            width * 0.62,
            height * 0.34
        );

        const buttonY =
            previewY + previewSize / 2 + 105;

        const buttonWidth = Math.min(
            85,
            width * 0.21
        );

        const buttonHeight = 52;

        const horizontalOffset = Math.min(
            145,
            width * 0.34
        );

        this.previousButton = new Button(
            this,
            width / 2 - horizontalOffset,
            buttonY,
            buttonWidth,
            buttonHeight,
            "<",
            () => {
                this.changeImage(-1);
            }
        );

        this.nextButton = new Button(
            this,
            width / 2 + horizontalOffset,
            buttonY,
            buttonWidth,
            buttonHeight,
            ">",
            () => {
                this.changeImage(1);
            }
        );

        this.previousButton.setDepth(1);
        this.nextButton.setDepth(1);

        this.navigationButtons.push(
            this.previousButton,
            this.nextButton
        );
    }

    createGridInformation(width, height) {
        const infoFontSize = Math.max(
            13,
            Math.min(18, Math.floor(width * 0.037))
        );

        this.gridInfoText = this.add.text(
            width / 2,
            height * 0.40 +
                Math.min(
                    260,
                    width * 0.62,
                    height * 0.34
                ) / 2 + 145,
            "4 × 4 GRID",
            {
                fontFamily: "Arial",
                fontSize: `${infoFontSize}px`,
                color: "#94a3bd",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.emptyTileInfoText = this.add.text(
            width / 2,
            this.gridInfoText.y + 27,
            "",
            {
                fontFamily: "Arial",
                fontSize: `${infoFontSize}px`,
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        ).setOrigin(0.5);

        this.menuElements.push(
            this.gridInfoText,
            this.emptyTileInfoText
        );
    }

    createActionButtons(width, height) {
        const startButtonWidth = Math.min(
            300,
            width * 0.78
        );

        const backButtonWidth = Math.min(
            180,
            width * 0.50
        );

        const startButtonHeight = 62;
        const backButtonHeight = 46;

        const bottomMargin = Math.max(
            24,
            height * 0.035
        );

        const backButtonY =
            height - bottomMargin - backButtonHeight / 2;

        const startButtonY =
            backButtonY -
            backButtonHeight / 2 -
            18 -
            startButtonHeight / 2;

        this.startButton = new Button(
            this,
            width / 2,
            startButtonY,
            startButtonWidth,
            startButtonHeight,
            "START PUZZLE",
            () => {
                this.registry.set(
                    "selectedImage",
                    this.imageNames[this.selectedIndex]
                );

                this.scene.start("PlayScene");
            }
        );

        this.backButton = new Button(
            this,
            width / 2,
            backButtonY,
            backButtonWidth,
            backButtonHeight,
            "BACK",
            () => {
                this.scene.start("MenuScene");
            }
        );

        this.startButton.setDepth(1);
        this.backButton.setDepth(1);

        this.navigationButtons.push(
            this.startButton,
            this.backButton
        );
    }

    changeImage(direction) {
        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex =
                this.imageNames.length - 1;
        }

        if (this.selectedIndex >= this.imageNames.length) {
            this.selectedIndex = 0;
        }

        this.updatePreview();
    }

    updatePreview() {
    const imageName = this.imageNames[this.selectedIndex];
    
    this.preview.setTexture(imageName);
    
    // Display the image name in uppercase.
    this.imageLabel.setText(
        imageName.toUpperCase()
    );
    
    // Display the current image index and total available images.
    this.imageCounter.setText(
        `(${this.selectedIndex + 1}/${this.imageNames.length})`
    );
    
    const emptyTileCount = getEmptyTileCount(imageName);
    
    const emptyTileLabel = emptyTileCount === 1 ?
        "1 EMPTY TILE" :
        `${emptyTileCount} EMPTY TILES`;
    
    this.emptyTileInfoText.setText(emptyTileLabel);
    
}

    handleResize() {
        this.navigationButtons.forEach((button) => {
            if (button) {
                button.destroy();
            }
        });

        this.menuElements.forEach((element) => {
            if (element && element.destroy) {
                element.destroy();
            }
        });

        this.navigationButtons = [];
        this.menuElements = [];

        this.previousButton = null;
        this.nextButton = null;
        this.startButton = null;
        this.backButton = null;

        const width = this.scale.width;
        const height = this.scale.height;

        this.createHeading(width, height);
        this.createImagePreview(width, height);
        this.createImageNavigation(width, height);
        this.createGridInformation(width, height);
        this.createActionButtons(width, height);

        this.updatePreview();
    }

    shutdown() {
        this.scale.off(
            "resize",
            this.handleResize,
            this
        );

        this.navigationButtons.forEach((button) => {
            if (button) {
                button.destroy();
            }
        });

        this.navigationButtons = [];
    }
}