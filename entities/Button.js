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
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.callback = callback;
        this.baseColor = color;

        this.isPointerOver = false;
        this.isPressed = false;

        this.container = scene.add.container(x, y);

        this.shadow = scene.add.rectangle(
            0,
            4,
            width,
            height,
            0x000000,
            0.45
        ).setOrigin(0.5);

        this.outerGlow = scene.add.rectangle(
            0,
            0,
            width,
            height,
            0x20d9ff,
            0.08
        ).setOrigin(0.5);

        this.background = scene.add.rectangle(
            0,
            0,
            width,
            height,
            color
        ).setOrigin(0.5);

        this.background.setStrokeStyle(
            2,
            0x20d9ff,
            0.95
        );

        this.topHighlight = scene.add.rectangle(
            0,
            -height * 0.28,
            Math.max(1, width - 8),
            Math.max(2, height * 0.24),
            0xffffff,
            0.10
        ).setOrigin(0.5);

        this.bottomShade = scene.add.rectangle(
            0,
            height * 0.32,
            Math.max(1, width - 4),
            Math.max(2, height * 0.20),
            0x000000,
            0.14
        ).setOrigin(0.5);

        this.topBorder = scene.add.rectangle(
            0,
            -height / 2 + 2,
            Math.max(1, width - 8),
            2,
            0xffffff,
            0.30
        ).setOrigin(0.5);

        this.text = scene.add.text(
            0,
            0,
            label,
            {
                fontFamily: "AngryBird",
                fontSize: `${this.calculateFontSize(width, height)}px`,
                fontStyle: "bold",
                color: "#f2f8ff",
                align: "center",
                resolution: 2,
                padding: {
                    left: 1,
                    right: 1,
                    top: 2,
                    bottom: 2
                }
            }
        ).setOrigin(0.5);

        this.text.setStroke(
            "#07111f",
            1
        );

        this.text.setShadow(
            0,
            1,
            "#000000",
            2,
            false,
            true
        );

        this.fitTextToButton(width, height);

        this.container.add([
            this.shadow,
            this.outerGlow,
            this.background,
            this.topHighlight,
            this.bottomShade,
            this.topBorder,
            this.text
        ]);

        this.background.setInteractive({
            useHandCursor: true
        });

        this.background.on(
            "pointerover",
            this.handlePointerOver,
            this
        );

        this.background.on(
            "pointerout",
            this.handlePointerOut,
            this
        );

        this.background.on(
            "pointerdown",
            this.handlePointerDown,
            this
        );

        this.background.on(
            "pointerup",
            this.handlePointerUp,
            this
        );

        this.background.on(
            "pointerupoutside",
            this.handlePointerOut,
            this
        );
    }

    calculateFontSize(width, height) {
        const widthBasedSize = Math.floor(
            width / 6
        );

        const heightBasedSize = Math.floor(
            height * 0.32
        );

        return Math.max(
            9,
            Math.min(
                18,
                widthBasedSize,
                heightBasedSize
            )
        );
    }

    fitTextToButton(width, height) {
        const maximumTextWidth = Math.max(
            1,
            width - 12
        );

        const maximumTextHeight = Math.max(
            1,
            height - 6
        );

        let fontSize = this.calculateFontSize(
            width,
            height
        );

        this.text.setFontSize(fontSize);
        this.text.setScale(1);

        while (
            (
                this.text.width > maximumTextWidth ||
                this.text.height > maximumTextHeight
            ) &&
            fontSize > 9
        ) {
            fontSize--;

            this.text.setFontSize(fontSize);
        }

        this.text.setPosition(0, 0);
    }

    handlePointerOver() {
        if (this.isPressed) {
            return;
        }

        this.isPointerOver = true;

        this.background.setFillStyle(
            0x174763
        );

        this.background.setStrokeStyle(
            2,
            0x73edff,
            1
        );

        this.outerGlow.setFillStyle(
            0x20d9ff,
            0.20
        );

        this.topHighlight.setFillStyle(
            0xffffff,
            0.17
        );

        this.text.setColor(
            "#ffffff"
        );

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1.025,
            scaleY: 1.025,
            duration: 100,
            ease: "Sine.easeOut"
        });
    }

    handlePointerOut() {
        this.isPointerOver = false;
        this.isPressed = false;

        this.restoreDefaultAppearance();

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: "Sine.easeOut"
        });
    }

    handlePointerDown(pointer) {
        if (!this.background.input.enabled) {
            return;
        }

        this.isPressed = true;

        this.background.setFillStyle(
            0x091522
        );

        this.background.setStrokeStyle(
            2,
            0x20d9ff,
            1
        );

        this.outerGlow.setFillStyle(
            0x20d9ff,
            0.12
        );

        this.topHighlight.setFillStyle(
            0xffffff,
            0.05
        );

        this.bottomShade.setFillStyle(
            0x000000,
            0.25
        );

        this.text.setColor(
            "#20d9ff"
        );

        this.scene.tweens.killTweensOf(
            this.container
        );

        this.container.setScale(
            0.97
        );
    }

    handlePointerUp(pointer) {
        if (!this.isPressed) {
            return;
        }

        this.isPressed = false;

        if (this.background.getBounds().contains(
            pointer.x,
            pointer.y
        )) {
            this.restoreDefaultAppearance();

            this.scene.tweens.add({
                targets: this.container,
                scaleX: this.isPointerOver ? 1.025 : 1,
                scaleY: this.isPointerOver ? 1.025 : 1,
                duration: 100,
                ease: "Sine.easeOut"
            });

            if (typeof this.callback === "function") {
                this.callback();
            }
        } else {
            this.restoreDefaultAppearance();
        }
    }

    restoreDefaultAppearance() {
        this.background.setFillStyle(
            this.baseColor
        );

        this.background.setStrokeStyle(
            2,
            0x20d9ff,
            0.95
        );

        this.outerGlow.setFillStyle(
            0x20d9ff,
            0.08
        );

        this.topHighlight.setFillStyle(
            0xffffff,
            0.10
        );

        this.bottomShade.setFillStyle(
            0x000000,
            0.14
        );

        this.text.setColor(
            "#f2f8ff"
        );
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;

        this.container.setPosition(
            x,
            y
        );

        return this;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.shadow.setSize(
            width,
            height
        );

        this.outerGlow.setSize(
            width,
            height
        );

        this.background.setSize(
            width,
            height
        );

        this.topHighlight.setPosition(
            0,
            -height * 0.28
        );

        this.topHighlight.setSize(
            Math.max(1, width - 8),
            Math.max(2, height * 0.24)
        );

        this.bottomShade.setPosition(
            0,
            height * 0.32
        );

        this.bottomShade.setSize(
            Math.max(1, width - 4),
            Math.max(2, height * 0.20)
        );

        this.topBorder.setPosition(
            0,
            -height / 2 + 2
        );

        this.topBorder.setSize(
            Math.max(1, width - 8),
            2
        );

        this.fitTextToButton(
            width,
            height
        );

        return this;
    }

    setDepth(depth) {
        this.container.setDepth(depth);

        return this;
    }
    setVisible(visible) {
    this.container.setVisible(visible);

    if (this.background.input) {
        this.background.input.enabled = visible;
    }

    return this;
} 
    destroy() {
        this.container.destroy();
    }
}

export function createGameControls(scene, layout) {
    const controls = [
        {
            label: "UNDO",
            callback: () => {
                scene.audioManager.play(
                    scene.audioManager.clickSound
                );

                scene.commandHandler.undo();
            },
            color: 0x18243a
        },
        {
            label: "SHUFFLE",
            callback: () => {
                scene.audioManager.play(
                    scene.audioManager.shuffleSound
                );

                scene.restartPuzzle();
            },
            color: 0x12344a
        },
        {
            label: "RESTART",
            callback: () => {
                scene.audioManager.play(
                    scene.audioManager.shuffleSound
                );

                scene.restartPuzzle();
            },
            color: 0x18243a
        },
        {
            label: "MENU",
            callback: () => {
                scene.audioManager.play(
                    scene.audioManager.clickSound
                );

                scene.scene.start("MenuScene");
            },
            color: 0x18243a
        }
    ];

    const buttons = [];

    if (layout.orientation === "portrait") {
        const gap = 6;
        const margin = 6;

        const buttonWidth =
            (
                layout.width -
                margin * 2 -
                gap * 3
            ) / 4;

        const startX =
            margin + buttonWidth / 2;

        controls.forEach((control, index) => {
            const x =
                startX + index * (
                    buttonWidth + gap
                );

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

    const verticalGap = 20;

    const centerY = layout.height / 2;

    const topY =
        centerY -
        (
            layout.buttonHeight +
            verticalGap
        ) / 2;

    const bottomY =
        centerY +
        (
            layout.buttonHeight +
            verticalGap
        ) / 2;

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