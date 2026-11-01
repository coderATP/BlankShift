import { Button } from "../entities/Button.js";

export default class TutorialScene extends Phaser.Scene {
    constructor() {
        super("TutorialScene");

        this.instructionElements = null;
        this.instructionCloseButton = null;

        this.instructionScrollY = 0;
        this.instructionMaxScroll = 0;

        this.instructionViewport = null;
        this.instructionText = null;
        this.instructionMask = null;
        this.instructionMaskGraphics = null;

        this.instructionWheelHandler = null;

        this.isDraggingInstructions = false;
        this.instructionDragStartY = 0;
        this.instructionScrollStartY = 0;
    }

    create() {
        this.audioManager =
            this.game.scene.keys.PreloadScene.audioManager;

        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground(width, height);
        this.showInstructions();

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

    createBackground(width, height) {
        this.background = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x050713,
            1
        );

        this.background.setDepth(0);
    }

    showInstructions() {
        if (this.instructionElements) {
            return;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        this.instructionElements = [];

        this.instructionScrollY = 0;

        const panelWidth = Math.min(
            width * 0.9,
            620
        );

        const panelHeight = Math.min(
            height * 0.84,
            540
        );

        const panelCenterX = width / 2;
        const panelCenterY = height / 2;

        const panelTop =
            panelCenterY - panelHeight / 2;

        const panel = this.add.rectangle(
            panelCenterX,
            panelCenterY,
            panelWidth,
            panelHeight,
            0x0a1225,
            1
        );

        panel
            .setStrokeStyle(2, 0x20d9ff, 0.9)
            .setDepth(2);

        const headingFontSize = Math.max(
            22,
            Math.min(32, Math.floor(width * 0.07))
        );

        const bodyFontSize = Math.max(
            14,
            Math.min(20, Math.floor(width * 0.043))
        );

        const heading = this.add.text(
            panelCenterX,
            panelTop + panelHeight * 0.105,
            "HOW TO PLAY",
            {
                fontFamily: "Arial",
                fontSize: `${headingFontSize}px`,
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center",
                resolution: 2
            }
        )
            .setOrigin(0.5)
            .setDepth(3);

        heading.setShadow(
            0,
            0,
            "#20d9ff",
            8,
            true,
            true
        );

        const backButton = new Button(
            this,
            panelCenterX,
            panelTop + panelHeight * 0.91,
            Math.min(200, panelWidth * 0.65),
            46,
            "BACK",
            () => {
                this.audioManager.play(
                    this.audioManager.clickSound
                );

                this.scene.start("MenuScene");
            }
        );

        backButton.setDepth(4);

        // Define the visible instruction area.

        const viewportWidth = panelWidth - 36;

        const viewportTop =
            panelTop + panelHeight * 0.21;

        const viewportBottom =
            panelTop + panelHeight * 0.82;

        const viewportHeight =
            viewportBottom - viewportTop;

        const viewportX =
            panelCenterX - viewportWidth / 2;

        this.instructionViewport = {
            x: viewportX,
            y: viewportTop,
            width: viewportWidth,
            height: viewportHeight
        };

        // Instruction content.

        const instructionContent = [
            {
                heading: "YOUR GOAL",
                body:
                    "Welcome to BlankShift! Your mission is " +
                    "simple: rearrange the picture tiles until " +
                    "the original picture is back together."
            },
            {
                heading: "HOW TO MOVE ONE BLANK TILE",
                body:
                    "When your puzzle has one blank space, " +
                    "move a picture tile directly beside it " +
                    "into that blank space. The blank space " +
                    "moves to where the picture tile was."
            },
            {
                heading: "HOW TO MOVE MULTIPLE BLANK TILES",
                body:
                    "Some puzzles have more than one blank " +
                    "space. You can move a picture tile into " +
                    "any directly adjacent blank space. " +
                    "You can also swap two adjacent blank spaces."
            },
            {
                heading: "WHICH MOVES ARE ALLOWED?",
                body:
                    "You can move tiles up, down, left or " +
                    "right, but only between directly " +
                    "adjacent spaces.\n\n" +
                    "Picture tiles cannot swap directly " +
                    "with other picture tiles. Diagonal " +
                    "moves, jumping over spaces and moving " +
                    "distant tiles are not allowed.\n\n" +
                    "Don't worry! An invalid move simply " +
                    "snaps back into place."
            },
            {
                heading: "HOW DO YOU WIN?",
                body:
                    "Put every picture tile in its correct " +
                    "position to complete the puzzle.\n\n" +
                    "Some puzzles may have more than one " +
                    "accepted completed arrangement. This " +
                    "happens when the original blank spaces " +
                    "form a complete row or column. So don't " +
                    "be surprised if more than one final " +
                    "arrangement can win!"
            },
            {
                heading: "READY?",
                body:
                    "Take your time, plan your moves and " +
                    "enjoy putting every piece where it belongs. " +
                    "You've got this!"
            }
        ];

        // Create the instruction container.

        const instructionContainer = this.add.container(
            viewportX + 6,
            viewportTop + 6
        ).setDepth(3);

        let contentY = 0;

        instructionContent.forEach((section) => {
            const sectionHeading = this.add.text(
                0,
                contentY + 12,
                section.heading,
                {
                    fontFamily: "Arial",
                    fontSize: `${bodyFontSize + 1}px`,
                    fontStyle: "bold",
                    color: "#20d9ff",
                    align: "left",
                    resolution: 2
                }
            ).setOrigin(0, 0);

            instructionContainer.add(sectionHeading);

            contentY += sectionHeading.height + 17;

            const sectionBody = this.add.text(
                0,
                contentY,
                section.body,
                {
                    fontFamily: "Arial",
                    fontSize: `${bodyFontSize}px`,
                    color: "#d7e3f7",
                    align: "left",
                    lineSpacing: 5,
                    wordWrap: {
                        width: viewportWidth - 12,
                        useAdvancedWrap: true
                    },
                    resolution: 2
                }
            ).setOrigin(0, 0);

            instructionContainer.add(sectionBody);

            contentY += sectionBody.height + 8;
        });

        this.instructionText = instructionContainer;

        // Calculate the available scrolling distance.

        const visibleContentHeight =
            viewportHeight - 12;

        this.instructionMaxScroll = Math.max(
            0,
            contentY - visibleContentHeight
        );

        // Create a geometry mask for the viewport.

        const maskGraphics = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });

        maskGraphics.fillStyle(0xffffff);

        maskGraphics.fillRect(
            viewportX + 4,
            viewportTop + 4,
            viewportWidth - 8,
            viewportHeight - 8
        );

        this.instructionMaskGraphics = maskGraphics;

        this.instructionMask =
            maskGraphics.createGeometryMask();

        instructionContainer.setMask(
            this.instructionMask
        );

        // Touch and mouse-drag scrolling.

        const scrollZone = this.add.zone(
            viewportX + viewportWidth / 2,
            viewportTop + viewportHeight / 2,
            viewportWidth,
            viewportHeight
        );

        scrollZone
            .setDepth(3)
            .setInteractive();

        scrollZone.on("pointerdown", (pointer) => {
            this.isDraggingInstructions = true;

            this.instructionDragStartY = pointer.y;

            this.instructionScrollStartY =
                this.instructionScrollY;
        });

        this.input.on(
            "pointermove",
            this.handleInstructionDrag,
            this
        );

        this.input.on(
            "pointerup",
            this.stopInstructionDrag,
            this
        );

        this.input.on(
            "pointerupoutside",
            this.stopInstructionDrag,
            this
        );

        // Mouse-wheel scrolling.

        this.instructionWheelHandler = (
            pointer,
            gameObjects,
            deltaX,
            deltaY
        ) => {
            const viewport = this.instructionViewport;

            const insideViewport =
                pointer.x >= viewport.x &&
                pointer.x <= viewport.x + viewport.width &&
                pointer.y >= viewport.y &&
                pointer.y <= viewport.y + viewport.height;

            if (
                insideViewport &&
                this.instructionMaxScroll > 0
            ) {
                this.scrollInstructions(deltaY * 0.8);
            }
        };

        this.input.on(
            "wheel",
            this.instructionWheelHandler,
            this
        );

        this.instructionElements.push(
            panel,
            heading,
            scrollZone,
            instructionContainer,
            maskGraphics
        );

        this.instructionCloseButton = backButton;

        // Show a scrolling hint when the content overflows.

        if (this.instructionMaxScroll > 0) {
            const scrollHint = this.add.text(
                panelCenterX,
                viewportBottom + 5,
                "SCROLL TO READ MORE",
                {
                    fontFamily: "Arial",
                    fontSize: "10px",
                    fontStyle: "bold",
                    color: "#94a3bd",
                    align: "center",
                    resolution: 2
                }
            ).setOrigin(0.5, 0);

            scrollHint.setDepth(3);

            this.instructionElements.push(
                scrollHint
            );
        }
    }

    handleInstructionDrag(pointer) {
        if (!this.isDraggingInstructions) {
            return;
        }

        const movement =
            this.instructionDragStartY - pointer.y;

        const targetScroll =
            this.instructionScrollStartY + movement;

        this.setInstructionScroll(targetScroll);
    }

    stopInstructionDrag() {
        this.isDraggingInstructions = false;
    }

    scrollInstructions(amount) {
        this.setInstructionScroll(
            this.instructionScrollY + amount
        );
    }

    setInstructionScroll(value) {
        if (!this.instructionText) {
            return;
        }

        this.instructionScrollY = Phaser.Math.Clamp(
            value,
            0,
            this.instructionMaxScroll
        );

        this.instructionText.setY(
            this.instructionViewport.y +
            6 -
            this.instructionScrollY
        );
    }

    closeInstructions() {
        if (!this.instructionElements) {
            return;
        }

        this.input.off(
            "pointermove",
            this.handleInstructionDrag,
            this
        );

        this.input.off(
            "pointerup",
            this.stopInstructionDrag,
            this
        );

        this.input.off(
            "pointerupoutside",
            this.stopInstructionDrag,
            this
        );

        if (this.instructionWheelHandler) {
            this.input.off(
                "wheel",
                this.instructionWheelHandler,
                this
            );

            this.instructionWheelHandler = null;
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

        if (this.instructionMask) {
            this.instructionMask.destroy();

            this.instructionMask = null;
        }

        this.instructionViewport = null;
        this.instructionText = null;
        this.instructionMaskGraphics = null;

        this.instructionScrollY = 0;
        this.instructionMaxScroll = 0;

        this.isDraggingInstructions = false;
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.closeInstructions();

        if (this.background) {
            this.background
                .setPosition(width / 2, height / 2)
                .setSize(width, height);
        }

        this.showInstructions();
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