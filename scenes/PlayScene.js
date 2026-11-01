import { CommandHandler } from "../CommandHandler.js";
import { TileMovement } from "../movements/TileMovement.js";
import { getEmptyTilePositions} from "../utils/EmptyTileConfig.js";
import {
    getSolvedPositionMaps,
    isPuzzleSolved
} from "../utils/PuzzleSolution.js";

import {
    Button,
    createGameControls
} from "../entities/Button.js";

import {
    calculatePuzzleLayout
} from "../utils/PuzzleLayout.js";

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super("PlayScene");

        this.gridSize = 4;
        this.totalTiles = 16;

        this.tileSize = 0;
        this.tileDisplaySize = 0;

        this.boardSize = 0;
        this.boardX = 0;
        this.boardY = 0;

        this.screenOrientation = "portrait";

        this.layout = null;

        this.tiles = [];
        this.cells = [];
        this.tileSprites = [];
        this.controlButtons = [];

        this.selectedImage = "alligator";

        this.moveCount = 0;
        this.shuffleCount = 80;

        this.isDragging = false;
        this.isAnimating = false;
        this.isGameOver = false;

        this.draggedTile = null;
        this.dragStartPosition = null;
        this.dragStartCoordinates = null;
        this.dragPointerOffset = null;

        this.moveText = null;
        this.imageKey = null;

        this.boardContainer = null;

        this.resizeTimer = null;
        this.isUpdatingGameSize = false;
        this.isApplyingLayout = false;

        this.victoryObjects = [];
        this.victoryButton = null;
        this.emptyTilePositions = [0]; 
        this.solvedPositionMaps = [];
        this.commandHandler = new CommandHandler(this);

        this.handleResize = this.handleResize.bind(this);
    }

    create() {
        this.selectedImage =
            this.registry.get("selectedImage") || "alligator";

        this.shuffleCount =
            this.registry.get("shuffleCount") || 80;

        this.commandHandler.reset();

        this.moveCount = 0;

        this.isDragging = false;
        this.isAnimating = false;
        this.isGameOver = false;

        this.draggedTile = null;
        this.dragStartPosition = null;
        this.dragStartCoordinates = null;
        this.dragPointerOffset = null;

        this.tiles = [];
        this.cells = [];
        this.tileSprites = [];
        this.controlButtons = [];

        this.boardContainer = null;

        this.victoryObjects = [];
        this.victoryButton = null;

        this.moveText = null;

        this.updateGameSize();

        this.calculateLayout();

        this.createSolvedBoard();

        this.shuffleBoard();

        this.createBoardCells();

        this.createTileSprites();

        this.controlButtons = createGameControls(
            this,
            this.layout
        );

        this.registerResizeListeners();

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }

    updateGameSize() {
        const width = Math.max(
            1,
            window.innerWidth
        );

        const height = Math.max(
            1,
            window.innerHeight
        );

        if (
            this.scale.width === width &&
            this.scale.height === height
        ) {
            return;
        }

        this.isUpdatingGameSize = true;

        this.scale.setGameSize(
            width,
            height
        );

        this.isUpdatingGameSize = false;
    }

    registerResizeListeners() {
        this.scale.on(
            Phaser.Scale.Events.RESIZE,
            this.handleResize,
            this
        );

        window.addEventListener(
            "resize",
            this.handleResize
        );

        window.addEventListener(
            "orientationchange",
            this.handleResize
        );
    }

    shutdown() {
        this.scale.off(
            Phaser.Scale.Events.RESIZE,
            this.handleResize,
            this
        );

        window.removeEventListener(
            "resize",
            this.handleResize
        );

        window.removeEventListener(
            "orientationchange",
            this.handleResize
        );

        if (this.resizeTimer) {
            this.resizeTimer.remove(false);
            this.resizeTimer = null;
        }

        this.input.off(
            "dragstart",
            this.handleDragStart,
            this
        );

        this.input.off(
            "drag",
            this.handleDrag,
            this
        );

        this.input.off(
            "dragend",
            this.handleDragEnd,
            this
        );
    }

    handleResize() {
        if (
            !this.scene.isActive() ||
            this.isUpdatingGameSize ||
            this.isApplyingLayout
        ) {
            return;
        }

        if (this.resizeTimer) {
            this.resizeTimer.remove(false);
        }

        this.resizeTimer = this.time.delayedCall(
            50,
            () => {
                this.resizeTimer = null;

                if (!this.scene.isActive()) {
                    return;
                }

                this.updateGameSize();

                this.applyResponsiveLayout();
            }
        );
    }

    calculateLayout() {
        this.layout = calculatePuzzleLayout(
            this.scale.width,
            this.scale.height,
            this.gridSize
        );

        this.screenOrientation =
            this.layout.orientation;

        this.boardSize = this.layout.boardSize;

        this.boardX = this.layout.boardX;
        this.boardY = this.layout.boardY;

        this.tileSize = this.layout.tileSize;

        this.tileDisplaySize =
            this.layout.tileDisplaySize;
    }

    applyResponsiveLayout() {
        if (this.isApplyingLayout) {
            return;
        }

        this.isApplyingLayout = true;

        try {
            this.calculateLayout();

            this.updateBoardLayout();

            this.updateTileLayout();

            this.updateControlsLayout();

            this.updateVictoryLayout();

            this.refreshCellBackgrounds();
        } finally {
            this.isApplyingLayout = false;
        }
    }

    updateBoardLayout() {
        if (!this.cells.length) {
            return;
        }

        this.cells.forEach((cell, position) => {
            cell.setPosition(
                this.getCellX(position),
                this.getCellY(position)
            );

            cell.setSize(
                this.tileSize,
                this.tileSize
            );

            const background = cell.list[0];

            if (background) {
                background.setSize(
                    this.tileSize,
                    this.tileSize
                );
            }
        });
    }

    updateTileLayout() {
        if (!this.tileSprites.length) {
            return;
        }

        const activePointer =
            this.input.activePointer;

        this.tileSprites.forEach((sprite) => {
            if (!sprite || !sprite.active) {
                return;
            }

            const tileId = sprite.getData("tileId");

            const tile = this.tiles.find(
                (item) => item.id === tileId
            );

            if (!tile) {
                return;
            }

            /*
             * A dragged tile remains outside its cell.
             * Keep it attached to the active pointer.
             */
            if (
                this.isDragging &&
                sprite === this.draggedTile?.sprite
            ) {
                this.tweens.killTweensOf(sprite);

                sprite.setPosition(
                    activePointer.x,
                    activePointer.y
                );

                sprite.setAlpha(0.95);

                this.restoreTileDisplaySize(sprite);

                this.dragPointerOffset = {
                    x: 0,
                    y: 0
                };

                return;
            }

            /*
             * Stop any animation that was using the old
             * cell coordinates before the orientation change.
             */
            this.tweens.killTweensOf(sprite);

            /*
             * The logical tile position is authoritative.
             * Reparent the existing sprite to its current cell.
             */
            const destinationCell =
                this.cells[tile.position];

            if (!destinationCell) {
                return;
            }

            destinationCell.add(sprite);

            sprite.setPosition(
                this.tileSize / 2,
                this.tileSize / 2
            );

            sprite.setAlpha(1);

            sprite.setDepth(0);

            this.restoreTileDisplaySize(sprite);

            sprite.setData(
                "cellPosition",
                tile.position
            );

            tile.sprite = sprite;
        });

        /*
         * If a resize interrupted a tile animation,
         * the tile has already been placed in its current
         * logical position above.
         */
        if (this.isAnimating) {
            this.isAnimating = false;
        }

        /*
         * Keep the currently dragged tile outside its cell
         * and preserve its drag state.
         */
        if (this.isDragging && this.draggedTile) {
            this.draggedTile.sprite =
                this.draggedTile.sprite || null;
        }
    }

    updateControlsLayout() {
    if (!this.controlButtons.length) {
        return;
    }

    const positions = [];

    if (this.layout.orientation === "portrait") {
        const gap = 6;
        const margin = 6;

        const buttonWidth =
            (
                this.layout.width -
                margin * 2 -
                gap * 3
            ) / 4;

        const startX =
            margin + buttonWidth / 2;

        for (
            let index = 0;
            index < this.controlButtons.length;
            index++
        ) {
            positions.push({
                x: startX + index * (
                    buttonWidth + gap
                ),
                y: this.layout.controlsY,
                width: buttonWidth,
                height: this.layout.buttonHeight
            });
        }
    } else {
        const verticalGap = 20;

        const centerY =
            this.layout.height / 2;

        const topY =
            centerY -
            (
                this.layout.buttonHeight +
                verticalGap
            ) / 2;

        const bottomY =
            centerY +
            (
                this.layout.buttonHeight +
                verticalGap
            ) / 2;

        const buttonPositions = [
            {
                x: this.layout.leftControlsX,
                y: topY
            },
            {
                x: this.layout.leftControlsX,
                y: bottomY
            },
            {
                x: this.layout.rightControlsX,
                y: topY
            },
            {
                x: this.layout.rightControlsX,
                y: bottomY
            }
        ];

        buttonPositions.forEach((position) => {
            positions.push({
                x: position.x,
                y: position.y,
                width: this.layout.sideButtonWidth,
                height: this.layout.buttonHeight
            });
        });
    }

    this.controlButtons.forEach(
        (button, index) => {
            const position = positions[index];

            if (!button || !position) {
                return;
            }

            button.setPosition(
                position.x,
                position.y
            );

            button.setSize(
                position.width,
                position.height
            );
        }
    );
}

createSolvedBoard() {
    this.emptyTilePositions = getEmptyTilePositions(
        this.selectedImage
    );

    this.solvedPositionMaps = getSolvedPositionMaps(
        this.emptyTilePositions,
        this.gridSize
    );

    this.tiles = [];

    for (
        let index = 0;
        index < this.totalTiles;
        index++
    ) {
        const isEmpty = this.emptyTilePositions.includes(
            index
        );

        this.tiles.push({
            id: index,
            correctPosition: index,
            position: index,
            isEmpty,
            sprite: null
        });
    }
}
shuffleBoard() {
    let previousPosition = -1;

    for (
        let i = 0;
        i < this.shuffleCount;
        i++
    ) {
        const emptyTiles = this.tiles.filter(
            (tile) => tile.isEmpty
        );

        const possibleMoves = [];

        emptyTiles.forEach((emptyTile) => {
            const adjacentPositions =
                this.getAdjacentPositions(
                    emptyTile.position
                );

            adjacentPositions.forEach((position) => {
                if (position === previousPosition) {
                    return;
                }

                const tile = this.getTileAtPosition(
                    position
                );

                if (tile && !tile.isEmpty) {
                    possibleMoves.push({
                        emptyTile,
                        tile
                    });
                }
            });
        });

        const availableMoves =
            possibleMoves.length > 0
                ? possibleMoves
                : this.tiles
                    .filter((tile) => tile.isEmpty)
                    .flatMap((emptyTile) => {
                        return this.getAdjacentPositions(
                            emptyTile.position
                        )
                            .map((position) => ({
                                emptyTile,
                                tile: this.getTileAtPosition(
                                    position
                                )
                            }))
                            .filter((move) => {
                                return (
                                    move.tile &&
                                    !move.tile.isEmpty
                                );
                            });
                    });

        if (availableMoves.length === 0) {
            break;
        }

        const move = Phaser.Utils.Array.GetRandom(
            availableMoves
        );

        previousPosition = move.emptyTile.position;

        this.exchangeTilePositions(
            move.emptyTile,
            move.tile
        );
    }

    if (this.isSolved()) {
        const emptyTiles = this.tiles.filter(
            (tile) => tile.isEmpty
        );

        for (const emptyTile of emptyTiles) {
            const adjacentPositions =
                this.getAdjacentPositions(
                    emptyTile.position
                );

            const movableTile = adjacentPositions
                .map((position) => {
                    return this.getTileAtPosition(position);
                })
                .find((tile) => tile && !tile.isEmpty);

            if (movableTile) {
                this.exchangeTilePositions(
                    emptyTile,
                    movableTile
                );

                break;
            }
        }
    }
}

    createBoardCells() {
        this.boardContainer = this.add.container(0, 0);

        for (
            let position = 0;
            position < this.totalTiles;
            position++
        ) {
            const x = this.getCellX(position);
            const y = this.getCellY(position);

            const container = this.add.container(x, y);

            const background = this.add.rectangle(
                0,
                0,
                this.tileSize,
                this.tileSize,
                0x11182a
            ).setOrigin(0);

            background.setStrokeStyle(
                2,
                0x25334c
            );

            container.add(background);

            container.setSize(
                this.tileSize,
                this.tileSize
            );

            container.setData("position", position);
            container.setData("tile", null);

            this.boardContainer.add(container);

            this.cells.push(container);
        }

        this.refreshCellBackgrounds();
    }

    refreshCellBackgrounds() {
        this.cells.forEach((cell, position) => {
            const background = cell.list[0];

            if (!background) {
                return;
            }

            background.setSize(
                this.tileSize,
                this.tileSize
            );

            const tile = this.getTileAtPosition(position);

            if (tile && tile.isEmpty) {
                background.setFillStyle(0x050812);

                background.setStrokeStyle(
                    3,
                    0x20d9ff,
                    0.85
                );
            } else {
                background.setFillStyle(0x11182a);

                background.setStrokeStyle(
                    2,
                    0x25334c,
                    1
                );
            }
        });
    }

 createTileSprites() {
    const texture = this.textures.get(
        this.selectedImage
    );
    
    if (!texture) {
        console.error(
            `BlankShift: Image texture "${this.selectedImage}" was not found.`
        );
        
        return;
    }
    
    const source = texture.getSourceImage();
    
    const sourceTileWidth =
        source.width / this.gridSize;
    
    const sourceTileHeight =
        source.height / this.gridSize;
    
    this.imageKey = this.selectedImage;
    
    this.tiles.forEach((tile) => {
        const cell = this.cells[tile.position];
        
        if (!cell) {
            return;
        }
        
        cell.setData("tile", tile);
        
        if (tile.isEmpty) {
            tile.sprite = null;
            return;
        }
        
        const tileTextureKey =
            `blankshift_${this.selectedImage}_tile_${tile.id}`;
        
        if (this.textures.exists(tileTextureKey)) {
            this.textures.remove(tileTextureKey);
        }
        
        const canvasWidth = Math.max(
            1,
            Math.round(sourceTileWidth)
        );
        
        const canvasHeight = Math.max(
            1,
            Math.round(sourceTileHeight)
        );
        
        const canvasTexture =
            this.textures.createCanvas(
                tileTextureKey,
                canvasWidth,
                canvasHeight
            );
        
        if (!canvasTexture) {
            console.error(
                `BlankShift: Could not create texture "${tileTextureKey}".`
            );
            
            return;
        }
        
        const context = canvasTexture.getContext();
        
        const sourceX = Math.round(
            (tile.id % this.gridSize) * sourceTileWidth
        );
        
        const sourceY = Math.round(
            Math.floor(tile.id / this.gridSize) *
            sourceTileHeight
        );
        
        context.drawImage(
            source,
            sourceX,
            sourceY,
            Math.round(sourceTileWidth),
            Math.round(sourceTileHeight),
            0,
            0,
            canvasWidth,
            canvasHeight
        );
        
        canvasTexture.refresh();
        
        const sprite = this.add.image(
            this.tileSize / 2,
            this.tileSize / 2,
            tileTextureKey
        );
        
        this.restoreTileDisplaySize(sprite);
        
        sprite.setInteractive({
            draggable: true,
            useHandCursor: true
        });
        
        sprite.setData("tileId", tile.id);
        
        sprite.setData(
            "cellPosition",
            tile.position
        );
        
        cell.add(sprite);
        
        tile.sprite = sprite;
        
        this.tileSprites.push(sprite);
    });
    
    this.input.setDraggable(this.tileSprites);
    
    this.input.on(
        "dragstart",
        this.handleDragStart,
        this
    );
    
    this.input.on(
        "drag",
        this.handleDrag,
        this
    );
    
    this.input.on(
        "dragend",
        this.handleDragEnd,
        this
    );
}

    restoreTileDisplaySize(sprite) {
        if (!sprite) {
            return;
        }

        sprite.setDisplaySize(
            this.tileDisplaySize,
            this.tileDisplaySize
        );
    }

    handleDragStart(pointer, gameObject) {
        if (
            this.isAnimating ||
            this.isGameOver ||
            this.isDragging
        ) {
            return;
        }

        const tileId = gameObject.getData("tileId");

        const tile = this.tiles.find(
            (item) => item.id === tileId
        );

        if (!tile || tile.isEmpty) {
            return;
        }

        const cell = this.cells[tile.position];

        if (!cell) {
            return;
        }

        const bounds = gameObject.getBounds();

        const worldX = bounds.centerX;
        const worldY = bounds.centerY;

        this.isDragging = true;

        this.draggedTile = tile;

        this.dragStartPosition = tile.position;

        this.dragStartCoordinates = {
            x: worldX,
            y: worldY
        };

        this.dragPointerOffset = {
            x: pointer.x - worldX,
            y: pointer.y - worldY
        };

        cell.remove(gameObject);

        this.add.existing(gameObject);

        gameObject.setPosition(
            worldX,
            worldY
        );

        gameObject.setDepth(100);
        gameObject.setAlpha(0.95);

        this.restoreTileDisplaySize(gameObject);
    }

    handleDrag(pointer, gameObject, dragX, dragY) {
        if (
            !this.isDragging ||
            !this.draggedTile ||
            !this.dragPointerOffset
        ) {
            return;
        }

        if (this.isAnimating || this.isGameOver) {
            return;
        }

        gameObject.setPosition(
            pointer.x - this.dragPointerOffset.x,
            pointer.y - this.dragPointerOffset.y
        );

        this.restoreTileDisplaySize(gameObject);
    }

    handleDragEnd(pointer, gameObject) {
        if (
            !this.isDragging ||
            !this.draggedTile
        ) {
            return;
        }

        const draggedTile = this.draggedTile;

        const originalPosition =
            this.dragStartPosition;

        const targetPosition =
            this.getPositionFromPointer(
                pointer.x,
                pointer.y
            );

        this.isDragging = false;

        this.draggedTile = null;
        this.dragPointerOffset = null;

        gameObject.setAlpha(1);

        this.restoreTileDisplaySize(gameObject);

        if (
            targetPosition === null ||
            targetPosition === originalPosition
        ) {
            this.snapBack(
                gameObject,
                originalPosition
            );

            return;
        }

        const targetTile =
            this.getTileAtPosition(targetPosition);

        if (
            !targetTile ||
            !targetTile.isEmpty ||
            !this.areAdjacent(
                originalPosition,
                targetPosition
            )
        ) {
            this.snapBack(
                gameObject,
                originalPosition
            );

            return;
        }

        this.dragStartPosition = null;
        this.dragStartCoordinates = null;

        const movement = new TileMovement(
            this,
            draggedTile,
            targetPosition,
            gameObject
        );

        this.commandHandler.execute(movement);
    }

    exchangeTilePositions(firstTile, secondTile) {
        const firstPosition = firstTile.position;

        firstTile.position = secondTile.position;

        secondTile.position = firstPosition;
    }

    snapBack(sprite, originalPosition) {
        if (!sprite || this.isAnimating) {
            return;
        }

        const destinationCell =
            this.cells[originalPosition];

        if (!destinationCell) {
            return;
        }

        this.isAnimating = true;

        const targetX =
            destinationCell.x + this.tileSize / 2;

        const targetY =
            destinationCell.y + this.tileSize / 2;

        this.restoreTileDisplaySize(sprite);

        this.tweens.add({
            targets: sprite,

            x: targetX,
            y: targetY,
            alpha: 1,

            duration: 200,

            ease: "Cubic.easeOut",

            onComplete: () => {
                destinationCell.add(sprite);

                sprite.setPosition(
                    this.tileSize / 2,
                    this.tileSize / 2
                );

                sprite.setAlpha(1);

                this.restoreTileDisplaySize(sprite);

                const tile = this.tiles.find(
                    (item) => item.sprite === sprite
                );

                if (tile) {
                    destinationCell.setData(
                        "tile",
                        tile
                    );

                    sprite.setData(
                        "cellPosition",
                        originalPosition
                    );
                }

                this.dragStartPosition = null;
                this.dragStartCoordinates = null;
                this.dragPointerOffset = null;

                this.refreshCellBackgrounds();

                this.isAnimating = false;
            }
        });
    }

    getTileAtPosition(position) {
        return this.tiles.find(
            (tile) => tile.position === position
        );
    }

    getAdjacentPositions(position) {
        const row = Math.floor(
            position / this.gridSize
        );

        const column = position % this.gridSize;

        const positions = [];

        if (row > 0) {
            positions.push(
                position - this.gridSize
            );
        }

        if (row < this.gridSize - 1) {
            positions.push(
                position + this.gridSize
            );
        }

        if (column > 0) {
            positions.push(position - 1);
        }

        if (column < this.gridSize - 1) {
            positions.push(position + 1);
        }

        return positions;
    }

    areAdjacent(firstPosition, secondPosition) {
        const firstRow = Math.floor(
            firstPosition / this.gridSize
        );

        const firstColumn =
            firstPosition % this.gridSize;

        const secondRow = Math.floor(
            secondPosition / this.gridSize
        );

        const secondColumn =
            secondPosition % this.gridSize;

        return (
            Math.abs(firstRow - secondRow) +
            Math.abs(firstColumn - secondColumn) === 1
        );
    }

    getPositionFromPointer(x, y) {
        const boardWidth =
            this.tileSize * this.gridSize;

        const boardHeight = boardWidth;

        if (
            x < this.boardX ||
            x >= this.boardX + boardWidth ||
            y < this.boardY ||
            y >= this.boardY + boardHeight
        ) {
            return null;
        }

        const column = Math.floor(
            (x - this.boardX) / this.tileSize
        );

        const row = Math.floor(
            (y - this.boardY) / this.tileSize
        );

        return row * this.gridSize + column;
    }

    getCellX(position) {
        const column = position % this.gridSize;

        return this.boardX + column * this.tileSize;
    }

    getCellY(position) {
        const row = Math.floor(
            position / this.gridSize
        );

        return this.boardY + row * this.tileSize;
    }

    isSolved() {
    return isPuzzleSolved(
        this.tiles,
        this.solvedPositionMaps
    );
}

    restartPuzzle() {
        if (
            this.isAnimating ||
            this.isDragging
        ) {
            return;
        }

        this.scene.restart();
    }

    showVictory() {
        if (this.isGameOver) {
            return;
        }

        this.isGameOver = true;

        const width = this.scale.width;
        const height = this.scale.height;

        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x080b16,
            0.92
        );

        overlay.setDepth(200);

        const title = this.add.text(
            width / 2,
            height / 2 - 70,
            "PUZZLE SOLVED!",
            {
                fontFamily: "Arial",
                fontSize: "32px",
                fontStyle: "bold",
                color: "#20d9ff",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(201);

        const message = this.add.text(
            width / 2,
            height / 2,
            `You reconstructed the picture!\nMoves: ${this.moveCount}`,
            {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#f2f6ff",
                align: "center",
                lineSpacing: 12
            }
        ).setOrigin(0.5).setDepth(201);

        this.victoryObjects = [
            overlay,
            title,
            message
        ];

        this.victoryButton = new Button(
            this,
            width / 2,
            height / 2 + 100,
            200,
            56,
            "PLAY AGAIN",
            () => {
                this.scene.restart();
            }
        );

        this.victoryButton.setDepth(201);
    }

    updateVictoryLayout() {
        if (
            !this.isGameOver ||
            this.victoryObjects.length === 0
        ) {
            return;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        const [overlay, title, message] =
            this.victoryObjects;

        overlay.setPosition(
            width / 2,
            height / 2
        );

        overlay.setSize(
            width,
            height
        );

        title.setPosition(
            width / 2,
            height / 2 - 70
        );

        message.setPosition(
            width / 2,
            height / 2
        );

        if (this.victoryButton) {
            const background =
                this.victoryButton.background;

            const text =
                this.victoryButton.text;

            background.setPosition(
                width / 2,
                height / 2 + 100
            );

            text.setPosition(
                width / 2,
                height / 2 + 100
            );
        }
    }
}