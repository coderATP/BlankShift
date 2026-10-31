import { CommandHandler } from "../CommandHandler.js";
import { TileMovement } from "../movements/TileMovement.js";

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

        this.commandHandler = new CommandHandler(this);
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
    
    this.boardContainer = null;
    
    /*
     * Calculate the exact square board dimensions
     * and center it on the screen.
     */
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
    
    /*
     * No heading, subtitle, move counter,
     * footer, or instruction text.
     */
    this.moveText = null;
    
    /*
     * Create the puzzle.
     */
    this.createSolvedBoard();
    
    this.shuffleBoard();
    
    this.createBoardCells();
    
    this.createTileSprites();
    
    /*
     * Create the four responsive controls.
     */
    createGameControls(
        this,
        this.layout
    );
}

    createSolvedBoard() {
        this.tiles = [];

        for (
            let index = 0;
            index < this.totalTiles;
            index++
        ) {
            this.tiles.push({
                id: index,
                correctPosition: index,
                position: index,
                isEmpty: index === 0,
                sprite: null
            });
        }
    }

    shuffleBoard() {
        /*
         * Shuffle using legal adjacent swaps.
         * This guarantees a solvable puzzle.
         */
        let previousBlankPosition = -1;

        for (let i = 0; i < this.shuffleCount; i++) {
            const blankTile = this.tiles.find(
                (tile) => tile.isEmpty
            );

            const adjacentPositions =
                this.getAdjacentPositions(
                    blankTile.position
                );

            let availablePositions =
                adjacentPositions.filter(
                    (position) => {
                        return position !== previousBlankPosition;
                    }
                );

            if (availablePositions.length === 0) {
                availablePositions = adjacentPositions;
            }

            const targetPosition =
                Phaser.Utils.Array.GetRandom(
                    availablePositions
                );

            const targetTile =
                this.getTileAtPosition(targetPosition);

            previousBlankPosition = blankTile.position;

            this.exchangeTilePositions(
                blankTile,
                targetTile
            );
        }

        if (this.isSolved()) {
            const blankTile = this.tiles.find(
                (tile) => tile.isEmpty
            );

            const targetPosition =
                Phaser.Utils.Array.GetRandom(
                    this.getAdjacentPositions(
                        blankTile.position
                    )
                );

            const targetTile =
                this.getTileAtPosition(targetPosition);

            this.exchangeTilePositions(
                blankTile,
                targetTile
            );
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

        for (
            let index = 0;
            index < this.totalTiles;
            index++
        ) {
            if (index === 0) {
                continue;
            }

            const tileTextureKey =
                `blankshift_${this.selectedImage}_tile_${index}`;

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

                continue;
            }

            const context = canvasTexture.getContext();

            const sourceX = Math.round(
                (index % this.gridSize) * sourceTileWidth
            );

            const sourceY = Math.round(
                Math.floor(index / this.gridSize) *
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
        }

        this.tiles.forEach((tile) => {
            const cell = this.cells[tile.position];

            cell.setData("tile", tile);

            if (tile.isEmpty) {
                tile.sprite = null;
                return;
            }

            const tileTextureKey =
                `blankshift_${this.selectedImage}_tile_${tile.id}`;

            if (!this.textures.exists(tileTextureKey)) {
                console.error(
                    `BlankShift: Tile texture "${tileTextureKey}" was not found.`
                );

                tile.sprite = null;
                return;
            }

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
        return this.tiles.every((tile) => {
            return tile.position === tile.correctPosition;
        });
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

        this.add.text(
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

        this.add.text(
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

        const playAgainButton = new Button(
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

        playAgainButton.setDepth(201);
    }
}