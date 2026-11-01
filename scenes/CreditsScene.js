import { Button } from "../entities/Button.js";

export default class CreditsScene extends Phaser.Scene {
constructor() {
super("CreditsScene");

    this.creditsContainer = null;
    this.creditsElements = [];

    this.creditsMask = null;
    this.creditsMaskGraphics = null;

    this.creditsTimer = null;
    this.creditsBackButton = null;

    this.creditsScrollY = 0;
    this.creditsScrollSpeed = 35;

    this.creditsContentHeight = 0;
    this.creditsViewport = null;
}

create() {
    this.audioManager =
        this.game.scene.keys.PreloadScene.audioManager;

    const width = this.scale.width;
    const height = this.scale.height;

    this.creditsElements = [];

    this.createBackground(width, height);
    this.createCreditsPanel(width, height);
    this.createCreditsContent(width, height);
    this.createBackButton(width, height);
    this.startCreditsAnimation();

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

createCreditsPanel(width, height) {
    this.panelWidth = Math.min(
        width * 0.9,
        580
    );

    this.panelHeight = Math.min(
        height * 0.84,
        560
    );

    this.panelCenterX = width / 2;
    this.panelCenterY = height / 2;

    const panelTop =
        this.panelCenterY - this.panelHeight / 2;

    this.panel = this.add.rectangle(
        this.panelCenterX,
        this.panelCenterY,
        this.panelWidth,
        this.panelHeight,
        0x080e1d,
        1
    );

    this.panel
        .setStrokeStyle(2, 0x20d9ff, 0.85)
        .setDepth(2);

    this.heading = this.add.text(
        this.panelCenterX,
        panelTop + this.panelHeight * 0.105,
        "CREDITS",
        {
            fontFamily: "Mario",
            fontSize: `${Math.max(
                12,
                Math.min(34, width * 0.075)
            )}px`,
            color: "#20d9ff",
            align: "center",
            resolution: 2
        }
    )
        .setOrigin(0.5)
        .setDepth(3);

    this.heading.setShadow(
        0,
        0,
        "#20d9ff",
        10,
        true,
        true
    );

    this.divider = this.add.rectangle(
        this.panelCenterX,
        panelTop + this.panelHeight * 0.19,
        this.panelWidth * 0.65,
        1,
        0x20d9ff,
        0.65
    );

    this.divider.setDepth(3);

    this.creditsElements.push(
        this.panel,
        this.heading,
        this.divider
    );

    const viewportWidth =
        this.panelWidth - 36;

    const viewportTop =
        panelTop + this.panelHeight * 0.23;

    const viewportBottom =
        panelTop + this.panelHeight * 0.83;

    const viewportHeight =
        viewportBottom - viewportTop;

    this.creditsViewport = {
        x: this.panelCenterX - viewportWidth / 2,
        y: viewportTop,
        width: viewportWidth,
        height: viewportHeight
    };

    // Create the credits viewport mask.

    this.creditsMaskGraphics = this.make.graphics({
        x: 0,
        y: 0,
        add: false
    });

    this.creditsMaskGraphics.fillStyle(0xffffff);

    this.creditsMaskGraphics.fillRect(
        this.creditsViewport.x + 4,
        viewportTop,
        viewportWidth - 8,
        viewportHeight
    );

    this.creditsMask =
        this.creditsMaskGraphics.createGeometryMask();
}

createCreditsContent() {
    this.creditsScrollY = 0;

    this.creditsContainer = this.add.container(
        this.panelCenterX,
        this.creditsViewport.y +
        this.creditsViewport.height
    );

    this.creditsContainer
        .setDepth(3)
        .setMask(this.creditsMask);

    const addCreditText = (
        text,
        y,
        style = {}
    ) => {
        const element = this.add.text(
            0,
            y,
            text,
            {
                fontFamily: "AngryBird",
                fontSize: "15px",
                color: "#d7e3f7",
                align: "center",
                resolution: 2,
                ...style
            }
        ).setOrigin(0.5, 0);

        this.creditsContainer.add(element);

        return element;
    };

    let contentY = 0;

    // Opening space.

    contentY += 35;

    // Game title.

    addCreditText(
        "SHIFTILE",
        contentY,
        {
            fontFamily: "Mario",
            fontSize: "14px",
            color: "#20d9ff"
        }
    );

    contentY += 25;

    addCreditText(
        "Every Piece Has Its Place.",
        contentY,
        {
            fontSize: "14px",
            fontStyle: "italic",
            color: "#94a3bd"
        }
    );

    contentY += 85;

    // Development attribution.

    addCreditText(
        "CREATED & DEVELOPED BY",
        contentY,
        {
            fontSize: "12px",
            color: "#8495b5"
        }
    );

    contentY += 32;

    addCreditText(
        "TOSIN ATANDA",
        contentY,
        {
            fontFamily: "Mario",
            fontSize: "10px",
            color: "#ffffff"
        }
    );

    contentY += 15;

    addCreditText(
        "coderATP",
        contentY,
        {
            fontSize: "18px",
            color: "#20d9ff"
        }
    );

    contentY += 85;

    // Studio attribution.

    addCreditText(
        "A PRODUCTION OF",
        contentY,
        {
            fontSize: "12px",
            color: "#8495b5"
        }
    );

    contentY += 32;

    addCreditText(
        "ATP GAME STUDIO",
        contentY,
        {
            fontFamily: "Mario",
            fontSize: "10px",
            color: "#a44dff"
        }
    );

    contentY += 70;

    // Studio website.

    addCreditText(
        "MORE FROM ATP GAME STUDIO",
        contentY,
        {
            fontSize: "12px",
            color: "#8495b5"
        }
    );

    contentY += 30;

    addCreditText(
        "https://atpgamestudio.com.ng",
        contentY,
        {
            fontSize: "14px",
            color: "#20d9ff"
        }
    );

    contentY += 85;

    // Closing credits.

    addCreditText(
        "THANK YOU FOR PLAYING",
        contentY,
        {
            fontSize: "16px",
            color: "#20d9ff"
        }
    );

    contentY += 100;

    this.creditsContentHeight = contentY;
}

createBackButton(width, height) {
    const panelTop =
        this.panelCenterY - this.panelHeight / 2;

    this.creditsBackButton = new Button(
        this,
        this.panelCenterX,
        panelTop + this.panelHeight * 0.91,
        Math.min(200, this.panelWidth * 0.65),
        46,
        "BACK",
        () => {
            this.audioManager.play(
                this.audioManager.clickSound
            );

            this.scene.start("MenuScene");
        }
    );

    this.creditsBackButton.setDepth(4);
}

startCreditsAnimation() {
    if (this.creditsTimer) {
        this.creditsTimer.remove(false);
        this.creditsTimer = null;
    }

    this.creditsTimer = this.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
            if (!this.creditsContainer) {
                return;
            }

            this.creditsScrollY +=
                this.creditsScrollSpeed * 0.016;

            this.creditsContainer.setY(
                this.creditsViewport.y +
                this.creditsViewport.height -
                this.creditsScrollY
            );

            // Restart after the complete credits have passed.

            if (
                this.creditsScrollY >
                this.creditsContentHeight +
                this.creditsViewport.height
            ) {
                this.creditsScrollY = 0;
            }
        }
    });
}

handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.destroyCreditsContent();

    if (this.background) {
        this.background
            .setPosition(width / 2, height / 2)
            .setSize(width, height);
    }

    this.panel.destroy();
    this.heading.destroy();
    this.divider.destroy();

    this.createCreditsPanel(width, height);
    this.createCreditsContent();
    this.createBackButton(width, height);
    this.startCreditsAnimation();
}

destroyCreditsContent() {
    // Stop the scrolling animation.

    if (this.creditsTimer) {
        this.creditsTimer.remove(false);
        this.creditsTimer = null;
    }

    // Destroy the credits container and its children.

    if (this.creditsContainer) {
        this.creditsContainer.removeAll(true);
        this.creditsContainer.destroy();
        this.creditsContainer = null;
    }

    // Destroy the Back button.

    if (this.creditsBackButton) {
        this.creditsBackButton.destroy();
        this.creditsBackButton = null;
    }

    // Destroy the geometry mask.

    if (this.creditsMask) {
        this.creditsMask.destroy();
        this.creditsMask = null;
    }

    // Destroy the graphics used to create the mask.

    if (this.creditsMaskGraphics) {
        this.creditsMaskGraphics.destroy();
        this.creditsMaskGraphics = null;
    }

    this.creditsScrollY = 0;
    this.creditsContentHeight = 0;
    this.creditsViewport = null;
}

shutdown() {
    this.scale.off(
        "resize",
        this.handleResize,
        this
    );

    this.destroyCreditsContent();

    if (this.panel) {
        this.panel.destroy();
        this.panel = null;
    }

    if (this.heading) {
        this.heading.destroy();
        this.heading = null;
    }

    if (this.divider) {
        this.divider.destroy();
        this.divider = null;
    }
}

}