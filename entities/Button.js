export class Button {
    constructor(
        scene,
        x,
        y,
        width,
        height,
        label,
        callback,
        color = 0x12344a
    ) {
        this.scene = scene;

        this.background = scene.add.rectangle(
            x,
            y,
            width,
            height,
            color
        );

        this.background.setStrokeStyle(
            2,
            0x20d9ff
        );

        this.background.setInteractive({
            useHandCursor: true
        });

        const fontSize = Math.max(
            10,
            Math.min(18, Math.floor(width / 5.5))
        );

        this.text = scene.add.text(
            x,
            y,
            label,
            {
                fontFamily: "Arial",
                fontSize: `${fontSize}px`,
                fontStyle: "bold",
                color: "#f2f6ff",
                align: "center"
            }
        ).setOrigin(0.5);

        const maximumTextWidth = Math.max(
            1,
            width - 8
        );

        if (this.text.width > maximumTextWidth) {
            this.text.setScale(
                maximumTextWidth / this.text.width
            );
        }

        this.background.on("pointerover", () => {
            this.background.setFillStyle(0x174763);
            this.text.setColor("#20d9ff");
        });

        this.background.on("pointerout", () => {
            this.background.setFillStyle(color);
            this.text.setColor("#f2f6ff");
        });

        this.background.on("pointerdown", callback);
    }

    setDepth(depth) {
        this.background.setDepth(depth);
        this.text.setDepth(depth + 1);

        return this;
    }
}

export function createGameControls(scene, layout) {
    const controls = [
        {
            label: "UNDO",
            callback: () => {
                scene.commandHandler.undo();
            },
            color: 0x18243a
        },
        {
            label: "SHUFFLE",
            callback: () => {
                scene.restartPuzzle();
            },
            color: 0x12344a
        },
        {
            label: "RESTART",
            callback: () => {
                scene.restartPuzzle();
            },
            color: 0x18243a
        },
        {
            label: "MENU",
            callback: () => {
                scene.scene.start("MenuScene");
            },
            color: 0x18243a
        }
    ];

    const buttons = [];

    if (layout.orientation === "portrait") {
        /*
         * Four horizontally aligned buttons.
         * All positioned beneath the board.
         */
        const gap = 6;
        const margin = 6;

        const buttonWidth =
            (layout.width - margin * 2 - gap * 3) / 4;

        const startX =
            margin + buttonWidth / 2;

        controls.forEach((control, index) => {
            const x =
                startX + index * (buttonWidth + gap);

            buttons.push(
                new Button(
                    scene,
                    x,
                    layout.controlsY,
                    buttonWidth,
                    layout.buttonHeight,
                    control.label,
                    control.callback,
                    control.color
                )
            );
        });

        return buttons;
    }

    /*
     * Landscape:
     *
     * UNDO        BOARD       RESTART
     *
     * SHUFFLE                 MENU
     */

    const verticalGap = 20;

    const centerY = layout.height / 2;

    const topY =
        centerY -
        (layout.buttonHeight + verticalGap) / 2;

    const bottomY =
        centerY +
        (layout.buttonHeight + verticalGap) / 2;

    const positions = [
        {
            x: layout.leftControlsX,
            y: topY
        },
        {
            x: layout.leftControlsX,
            y: bottomY
        },
        {
            x: layout.rightControlsX,
            y: topY
        },
        {
            x: layout.rightControlsX,
            y: bottomY
        }
    ];

    controls.forEach((control, index) => {
        const position = positions[index];

        buttons.push(
            new Button(
                scene,
                position.x,
                position.y,
                layout.sideButtonWidth,
                layout.buttonHeight,
                control.label,
                control.callback,
                control.color
            )
        );
    });

    return buttons;
}