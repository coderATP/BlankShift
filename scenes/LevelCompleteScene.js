import { Button } from "../entities/Button.js";

export default class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super("LevelCompleteScene");

        this.audioManager = null;

        this.buttons = [];

        this.selectedImage = null;
        this.moveCount = 0;

        this.background = null;
        this.title = null;
        this.message = null;

        this.isReplayActive = false;

        this.handleResize = this.handleResize.bind(this);
    }

    create(data) {
        this.audioManager =
            this.game.scene.keys.PreloadScene.audioManager;

        this.audioManager.play(
            this.audioManager.levelCompleteSound
        );

        this.selectedImage = data.selectedImage;

        this.moveCount = data.moveCount;

        this.createBackground();

        this.createContent();

        this.createButtons();

        this.updateLayout();

        this.scale.on(
            Phaser.Scale.Events.RESIZE,
            this.handleResize,
            this
        );

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }

    createBackground() {
        this.background = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            0x050713
        );

        this.background.setOrigin(0);

        this.background.setDepth(0);
    }

    createContent() {
        this.title = this.add.text(
            0,
            0,
            "LEVEL COMPLETE!",
            {
                fontFamily: "Arial",
                fontSize: "32px",
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center"
            }
        ).setOrigin(0.5);

        this.message = this.add.text(
            0,
            0,
            `You reconstructed the picture!\nMoves: ${this.moveCount}`,
            {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#f2f6ff",
                align: "center",
                lineSpacing: 12
            }
        ).setOrigin(0.5);
    }

    createButtons() {
        this.createMainButtons();
    }

    createMainButtons() {
        this.destroyButtons();

        const buttonWidth = 220;
        const buttonHeight = 48;

        const buttons = [
            {
                label: "PLAY AGAIN",
                color: 0x12344a,
                callback: () => {
                    this.playAgain();
                }
            },
            {
                label: "REPLAY",
                color: 0x18243a,
                callback: () => {
                    this.startReplay();
                }
            },
            {
                label: "MENU",
                color: 0x18243a,
                callback: () => {
                    this.returnToMenu();
                }
            }
        ];

        buttons.forEach((item) => {
            const button = new Button(
                this,
                0,
                0,
                buttonWidth,
                buttonHeight,
                item.label,
                item.callback,
                item.color
            );

            button.setDepth(10);

            this.buttons.push(button);
        });

        this.updateButtonLayout();
    }

    createStopReplayButton() {
        this.destroyButtons();

        const button = new Button(
            this,
            0,
            0,
            220,
            48,
            "STOP REPLAY",
            () => {
                this.stopReplay();
            },
            0x7a2638
        );

        button.setDepth(10);

        this.buttons.push(button);

        this.updateButtonLayout();
    }

    destroyButtons() {
        this.buttons.forEach((button) => {
            button.destroy();
        });

        this.buttons = [];
    }

    updateButtonLayout() {
        if (!this.buttons.length) {
            return;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        const buttonHeight = 48;

        const gap = 14;

        const totalHeight =
            this.buttons.length * buttonHeight +
            (this.buttons.length - 1) * gap;

        const startY =
            height / 2 + 100 -
            totalHeight / 2 +
            buttonHeight / 2;

        this.buttons.forEach((button, index) => {
            button.setPosition(
                width / 2,
                startY + index * (
                    buttonHeight + gap
                )
            );
        });
    }

    updateLayout() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.background.setSize(
            width,
            height
        );

        this.title.setPosition(
            width / 2,
            height / 2 - 110
        );

        this.message.setPosition(
            width / 2,
            height / 2 - 35
        );

        this.updateButtonLayout();
    }

    handleResize() {
        this.updateLayout();
    }

    playAgain() {
        const playScene = this.scene.get("PlayScene");

        /*
         * Stop this scene before restarting the puzzle.
         */

        this.scene.stop();

        /*
         * Start a completely new puzzle.
         */

        playScene.scene.restart();
    }

    startReplay() {
    if (this.isReplayActive) {
        return;
    }
    
    const playScene = this.scene.get("PlayScene");
    
    if (
        !playScene.replayManager ||
        playScene.commandHandler.moves.length === 0
    ) {
        return;
    }
    
    this.isReplayActive = true;
    
    /*
     * Hide the completion screen.
     */
    
    this.scene.sleep();
    
    /*
     * Show the completed puzzle.
     */
    
    this.scene.wake("PlayScene");
    
    this.scene.bringToTop("PlayScene");
    
    /*
     * Start replay playback.
     */
    
    playScene.startReplay();
}


    stopReplay() {
        if (!this.isReplayActive) {
            return;
        }

        const playScene = this.scene.get("PlayScene");

        playScene.stopReplay();
    }

    onReplayFinished() {
    this.isReplayActive = false;
    
    this.createMainButtons();
    
    this.updateLayout();
}

    returnToMenu() {
        this.scene.stop("PlayScene");

        this.scene.stop();

        this.scene.start("MenuScene");
    }

    shutdown() {
        this.scale.off(
            Phaser.Scale.Events.RESIZE,
            this.handleResize,
            this
        );

        this.destroyButtons();
    }
}