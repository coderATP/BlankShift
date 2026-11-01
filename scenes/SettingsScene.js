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
        "fox",
        "giraffe",
        "horse",
        "iguana",
        "jaguar",
        "lion",
        "monkey",
        "newt",
        "octopus",
        "parrot",
        "quail",
        "rat",
        "snake",
        "tiger",
        "turtle",
        "urial",
        "vulture",
        "wolf",
        "x-ray tetra",
        "yak",
        "zebra"
    ];

    this.sortedImages = [];

    this.selectedImage = "123";

    this.selectedIndex = 0;

    this.currentPage = 0;

    this.imagesPerPage = 4;

    this.sortMode = "alphabetical";

    this.navigationButtons = [];

    this.menuElements = [];

    this.imageCards = [];

    this.isTransitioning = false;

    this.pageTransitionTween = null;

    this.layout = null;
}

create() {
    const selectedImage =
        this.registry.get("selectedImage");

    if (
        selectedImage &&
        this.imageNames.includes(selectedImage)
    ) {
        this.selectedImage = selectedImage;
    }

    this.sortImages();

    this.selectedIndex =
        this.sortedImages.indexOf(this.selectedImage);

    this.currentPage = Math.floor(
        this.selectedIndex / this.imagesPerPage
    );

    this.calculateLayout();

    this.createHeading();

    this.createImageGallery();

    this.createGalleryNavigation();

    this.createSortButton();

    this.createActionButtons();

    this.updateGallery();

    this.scale.off(
        Phaser.Scale.Events.RESIZE,
        this.handleResize,
        this
    );

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

calculateLayout() {
    const width = this.scale.width;

    const height = this.scale.height;

    const isPortrait = height >= width;

    const horizontalMargin = Math.max(
        16,
        width * 0.055
    );

    const availableWidth =
        width - horizontalMargin * 2;

    const gap = Math.max(
        10,
        Math.min(18, width * 0.035)
    );

    const cardWidth = (
        availableWidth - gap
    ) / 2;

    let cardHeight;

    if (isPortrait) {
        cardHeight = Math.min(
            cardWidth * 0.92,
            height * 0.205
        );
    } else {
        cardHeight = Math.min(
            cardWidth * 0.72,
            height * 0.30
        );
    }

    const galleryWidth =
        cardWidth * 2 + gap;

    const galleryHeight =
        cardHeight * 2 + gap;

    const headingY = height * 0.075;

    const subtitleY = height * 0.125;

    const galleryCenterY = isPortrait
        ? height * 0.465
        : height * 0.48;

    const galleryTop =
        galleryCenterY - galleryHeight / 2;

    const galleryBottom =
        galleryCenterY + galleryHeight / 2;

    const navigationY = galleryBottom + (
        isPortrait ? 37 : 32
    );

    const sortY = navigationY + (
        isPortrait ? 48 : 42
    );

    const actionY = height * 0.925;

    this.layout = {
        width,
        height,

        isPortrait,

        horizontalMargin,

        cardWidth,
        cardHeight,

        galleryWidth,
        galleryHeight,

        galleryCenterY,
        galleryTop,
        galleryBottom,

        gap,

        headingY,
        subtitleY,

        navigationY,
        sortY,

        actionY
    };
}

createHeading() {
    const {
        width,
        headingY,
        subtitleY
    } = this.layout;

    const titleFontSize = Math.max(
        25,
        Math.min(38, Math.floor(width * 0.075))
    );

    const subtitleFontSize = Math.max(
        13,
        Math.min(18, Math.floor(width * 0.038))
    );

    this.titleText = this.add.text(
        width / 2,
        headingY,
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
        subtitleY,
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

createImageGallery() {
    const {
        cardWidth,
        cardHeight,
        galleryCenterY,
        gap
    } = this.layout;

    const positions = this.getCardPositions();

    positions.forEach((position, index) => {
        const card = this.add.container(
            position.x,
            position.y
        );

        const border = this.add.rectangle(
            0,
            0,
            cardWidth,
            cardHeight,
            0x101a30
        );

        border.setStrokeStyle(
            2,
            0x25334c,
            1
        );

        const imageSize = Math.min(
            cardWidth - 16,
            cardHeight - 48
        );

        const image = this.add.image(
            0,
            -18,
            this.imageNames[0]
        );

        image.setDisplaySize(
            imageSize,
            imageSize
        );

        const label = this.add.text(
    0,
    cardHeight / 2 - 18,
    "",
    {
        fontFamily: "Arial",
        fontSize: `${Math.max(
            11,
            Math.min(16, cardWidth * 0.075)
        )}px`,
        fontStyle: "bold",
        color: "#f2f6ff",
        align: "center",
        resolution: 2,
        wordWrap: {
            width: cardWidth - 12
        }
    }
).setOrigin(0.5);

        card.add([
    border,
    image,
    label
]);

card.setSize(
    cardWidth,
    cardHeight
);

card.setData("border", border);
card.setData("image", image);
card.setData("label", label);

        card.setData("imageName", null);

        image.setInteractive({
            useHandCursor: true
        });

        image.on("pointerdown", () => {
            if (this.isTransitioning) {
                return;
            }

            const imageName =
                card.getData("imageName");

            if (imageName) {
                this.selectImage(imageName);
            }
        });

        card.setPosition(
            position.x,
            position.y
        );

        this.add.existing(card);

        this.imageCards.push(card);
    });

    this.updateGallery();
}

getCardPositions() {
    const {
        width,
        cardWidth,
        cardHeight,
        galleryCenterY,
        gap
    } = this.layout;

    const centerX = width / 2;

    const leftX =
        centerX - cardWidth / 2 - gap / 2;

    const rightX =
        centerX + cardWidth / 2 + gap / 2;

    const topY =
        galleryCenterY - cardHeight / 2 - gap / 2;

    const bottomY =
        galleryCenterY + cardHeight / 2 + gap / 2;

    return [
        {
            x: leftX,
            y: topY
        },
        {
            x: rightX,
            y: topY
        },
        {
            x: leftX,
            y: bottomY
        },
        {
            x: rightX,
            y: bottomY
        }
    ];
}

createGalleryNavigation() {
    const {
        width,
        navigationY
    } = this.layout;

    const buttonWidth = Math.min(
        76,
        width * 0.19
    );

    const buttonHeight = 38;

    const offset = Math.min(
        width * 0.34,
        145
    );

    this.previousButton = new Button(
        this,
        width / 2 - offset,
        navigationY,
        buttonWidth,
        buttonHeight,
        "<",
        () => {
            this.changePage(-1);
        }
    );

    this.nextButton = new Button(
        this,
        width / 2 + offset,
        navigationY,
        buttonWidth,
        buttonHeight,
        ">",
        () => {
            this.changePage(1);
        }
    );

    this.previousButton.setDepth(2);

    this.nextButton.setDepth(2);

    this.navigationButtons.push(
        this.previousButton,
        this.nextButton
    );

    this.pageCounter = this.add.text(
        width / 2,
        navigationY,
        "",
        {
            fontFamily: "Arial",
            fontSize: "14px",
            fontStyle: "bold",
            color: "#94a3bd",
            align: "center",
            resolution: 2
        }
    ).setOrigin(0.5);

    this.menuElements.push(
        this.pageCounter
    );
}

createSortButton() {
    const {
        width,
        sortY
    } = this.layout;

    this.sortButton = new Button(
        this,
        width / 2,
        sortY,
        Math.min(235, width * 0.65),
        36,
        "SORT: ALPHABETICAL",
        () => {
            this.toggleSortMode();
        }
    );

    this.sortButton.setDepth(2);

    this.navigationButtons.push(
        this.sortButton
    );
}

createActionButtons() {
    const {
        width,
        actionY
    } = this.layout;

    const gap = 14;

    const buttonWidth = Math.min(
        155,
        (width - 60 - gap) / 2
    );

    const buttonHeight = 44;

    const offset =
        buttonWidth / 2 + gap / 2;

    this.backButton = new Button(
        this,
        width / 2 - offset,
        actionY,
        buttonWidth,
        buttonHeight,
        "BACK",
        () => {
            this.scene.start("MenuScene");
        }
    );

    this.startButton = new Button(
        this,
        width / 2 + offset,
        actionY,
        buttonWidth,
        buttonHeight,
        "PLAY",
        () => {
            this.registry.set(
                "selectedImage",
                this.selectedImage
            );

            this.scene.start("PlayScene");
        }
    );

    this.backButton.setDepth(2);

    this.startButton.setDepth(2);

    this.navigationButtons.push(
        this.backButton,
        this.startButton
    );
}

sortImages() {
    this.sortedImages = [...this.imageNames];

    if (this.sortMode === "alphabetical") {
        this.sortedImages.sort(
            (first, second) => {
                if (first === "123") {
                    return -1;
                }

                if (second === "123") {
                    return 1;
                }

                return first.localeCompare(
                    second,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
            }
        );

        return;
    }

    if (this.sortMode === "difficulty") {
        this.sortedImages.sort(
            (first, second) => {
                const firstCount =
                    getEmptyTileCount(first);

                const secondCount =
                    getEmptyTileCount(second);

                if (firstCount !== secondCount) {
                    return secondCount - firstCount;
                }

                return first.localeCompare(
                    second,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
            }
        );
    }
}

toggleSortMode() {
    if (this.isTransitioning) {
        return;
    }

    this.sortMode =
        this.sortMode === "alphabetical"
            ? "difficulty"
            : "alphabetical";

    this.sortImages();

    this.selectedIndex =
        this.sortedImages.indexOf(
            this.selectedImage
        );

    this.currentPage = Math.floor(
        this.selectedIndex / this.imagesPerPage
    );

    this.updateSortButton();

    this.updateGallery();
}

updateSortButton() {
    if (!this.sortButton) {
        return;
    }

    const label =
        this.sortMode === "alphabetical"
            ? "SORT: ALPHABETICAL"
            : "SORT: DIFFICULTY";

    this.sortButton.text.setText(label);
}

selectImage(imageName) {
    if (
        !this.imageNames.includes(imageName)
    ) {
        return;
    }

    this.selectedImage = imageName;

    this.selectedIndex =
        this.sortedImages.indexOf(imageName);

    this.updateGallery();
}

changePage(direction) {
    if (this.isTransitioning) {
        return;
    }

    const totalPages = Math.ceil(
        this.sortedImages.length /
        this.imagesPerPage
    );

    const nextPage =
        this.currentPage + direction;

    let targetPage = nextPage;

    if (targetPage < 0) {
        targetPage = totalPages - 1;
    }

    if (targetPage >= totalPages) {
        targetPage = 0;
    }

    if (targetPage === this.currentPage) {
        return;
    }

    this.slideToPage(targetPage, direction);
}

slideToPage(targetPage, direction) {
    if (this.isTransitioning) {
        return;
    }
    
    this.isTransitioning = true;
    
    const width = this.scale.width;
    
    const positions = this.getCardPositions();
    
    const outgoingOffset =
        direction > 0 ? -width : width;
    
    const incomingOffset =
        direction > 0 ? width : -width;
    
    // Slide the current cards out of view.
    this.imageCards.forEach((card, index) => {
        const position = positions[index];
        
        this.tweens.add({
            targets: card,
            x: position.x + outgoingOffset,
            alpha: 0,
            duration: 180,
            ease: "Cubic.easeIn"
        });
    });
    
    this.time.delayedCall(190, () => {
        // Switch to the target page.
        this.currentPage = targetPage;
        
        this.updateGallery();
        
        // Position the new cards outside the screen.
        this.imageCards.forEach((card, index) => {
            const position = positions[index];
            
            card.setPosition(
                position.x + incomingOffset,
                position.y
            );
            
            card.setAlpha(0);
        });
        
        // Slide the new cards into view.
        let completedCards = 0;
        
        this.imageCards.forEach((card, index) => {
            const position = positions[index];
            
            this.tweens.add({
                targets: card,
                x: position.x,
                y: position.y,
                alpha: 1,
                duration: 230,
                ease: "Cubic.easeOut",
                
                onComplete: () => {
                    completedCards++;
                    
                    if (
                        completedCards ===
                        this.imageCards.length
                    ) {
                        this.isTransitioning = false;
                    }
                }
            });
        });
    });
    
}

updateGallery() {
    const positions = this.getCardPositions();
    
    const startIndex =
        this.currentPage * this.imagesPerPage;
    
    this.imageCards.forEach((card, index) => {
        const imageIndex =
            startIndex + index;
        
        const imageName =
            this.sortedImages[imageIndex];
        
        const border =
            card.getData("border");
        
        const image =
            card.getData("image");
        
        const label =
            card.getData("label");
        
        const position = positions[index];
        
        card.setPosition(
            position.x,
            position.y
        );
        
        if (!imageName) {
            card.setVisible(false);
            
            return;
        }
        
        card.setVisible(true);
        
        card.setAlpha(1);
        
        card.setData(
            "imageName",
            imageName
        );
        
        image.setTexture(imageName);
        
        const {
    cardWidth,
    cardHeight
} = this.layout;

// Reserve only the space needed for the image name.
const labelBottom = cardHeight / 2 - 2;

const labelY = labelBottom - label.height / 2;

// Keep the image name centered.
label.setPosition(
    0,
    labelY
);

// Allow the image to occupy most of the card.
const availableImageHeight =
    labelY - label.height / 2 - 2 + cardHeight / 2;

const imageSize = Math.min(
    cardWidth - 8,
    availableImageHeight
);

image.setDisplaySize(
    imageSize,
    imageSize
);

// Position the image close to the image name.
image.setPosition(
    0,
    -cardHeight / 2 + 4 + imageSize / 2
);
        const emptyTileCount =
            getEmptyTileCount(imageName);
        
        const countText =
            `${emptyTileCount}`;
        
        label.setText(
            imageName.toUpperCase()
        );
        
        label.setOrigin(0.5);
        
        // Create or update the empty-tile count.
        let countLabel =
            card.getData("countLabel");
        
        if (!countLabel) {
            countLabel = this.add.text(
                0,
                this.layout.cardHeight / 2 - 18,
                countText,
                {
                    fontFamily: "Arial",
                    fontSize: `${Math.max(
                        11,
                        Math.min(15, this.layout.cardWidth * 0.065)
                    )}px`,
                    fontStyle: "bold",
                    color: "#20d9ff",
                    align: "left",
                    resolution: 2
                }
            ).setOrigin(0, 0.5);
            
            card.add(countLabel);
            
            card.setData(
                "countLabel",
                countLabel
            );
        } else {
            countLabel.setText(countText);
        }
        
// Position the empty-tile count
// 2px from the right edge of the card.
countLabel.setPosition(
    this.layout.cardWidth / 2 - 2 - countLabel.width,
    labelY
);
        
        const isSelected =
            imageName === this.selectedImage;
        
        if (isSelected) {
            border.setFillStyle(0x10283d);
            
            border.setStrokeStyle(
                3,
                0x20d9ff,
                1
            );
        } else {
            border.setFillStyle(0x101a30);
            
            border.setStrokeStyle(
                2,
                0x25334c,
                1
            );
        }
    });
    
    this.updatePageCounter();
}

updatePageCounter() {
    if (!this.pageCounter) {
        return;
    }

    const totalPages = Math.ceil(
        this.sortedImages.length /
        this.imagesPerPage
    );

    this.pageCounter.setText(
        `${this.currentPage + 1} / ${totalPages}`
    );
}

handleResize() {
    if (this.isTransitioning) {
        return;
    }

    this.navigationButtons.forEach(
        (button) => {
            if (button) {
                button.destroy();
            }
        }
    );

    this.menuElements.forEach(
        (element) => {
            if (element && element.destroy) {
                element.destroy();
            }
        }
    );

    this.imageCards.forEach(
        (card) => {
            if (card) {
                card.destroy();
            }
        }
    );

    this.navigationButtons = [];

    this.menuElements = [];

    this.imageCards = [];

    this.calculateLayout();

    this.createHeading();

    this.createImageGallery();

    this.createGalleryNavigation();

    this.createSortButton();

    this.createActionButtons();

    this.updateSortButton();

    this.updateGallery();
}

shutdown() {
    if (this.pageTransitionTween) {
        this.pageTransitionTween.remove();
        this.pageTransitionTween = null;
    }

    this.tweens.killAll();

    this.scale.off(
        Phaser.Scale.Events.RESIZE,
        this.handleResize,
        this
    );

    this.navigationButtons.forEach(
        (button) => {
            if (button) {
                button.destroy();
            }
        }
    );

    this.imageCards.forEach(
        (card) => {
            if (card) {
                card.destroy();
            }
        }
    );

    this.navigationButtons = [];

    this.imageCards = [];
}

}