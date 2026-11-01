import { Movement } from "./Movement.js";

export class TileMovement extends Movement {
    constructor(scene, tile, targetPosition, sprite) {
        super(scene, tile, targetPosition);

        this.id = "tileMovement";

        this.sprite = sprite;

        this.emptyTile = null;

        this.sourcePosition = null;
        this.destinationPosition = null;

        this.hasExecuted = false;
    }

    execute() {
        const scene = this.scene;

        /*
         * Do not execute a movement while the board is busy.
         */

        if (
            scene.isAnimating ||
            scene.isGameOver ||
            this.hasExecuted
        ) {
            return this;
        }

        this.sourcePosition = this.tile.position;
        this.destinationPosition = this.targetPosition;

        /*
         * Find the tile occupying the destination position.
         */

        this.emptyTile = scene.getTileAtPosition(
            this.destinationPosition
        );

        /*
         * Validate the requested movement before changing
         * the logical board state.
         */

        if (!this.isMoveValid()) {
            this.isValid = false;

            scene.snapBack(
                this.sprite,
                this.sourcePosition
            );

            return this;
        }

        const sourceCell = scene.cells[
            this.sourcePosition
        ];

        const destinationCell = scene.cells[
            this.destinationPosition
        ];

        if (!sourceCell || !destinationCell) {
            this.isValid = false;

            scene.snapBack(
                this.sprite,
                this.sourcePosition
            );

            return this;
        }

        this.isValid = true;
        this.hasExecuted = true;

        scene.isAnimating = true;

        /*
         * Capture the sprite's actual world-space position
         * before removing it from its parent cell.
         */

        const bounds = this.sprite.getBounds();

        const worldX = bounds.centerX;
        const worldY = bounds.centerY;

        /*
         * Detach the sprite from its source cell and place
         * it on the scene display list.
         */

        sourceCell.remove(this.sprite);

        scene.add.existing(this.sprite);

        this.sprite.setPosition(
            worldX,
            worldY
        );

        /*
         * Exchange the logical positions of the moving tile
         * and the empty tile.
         */

        scene.exchangeTilePositions(
            this.tile,
            this.emptyTile
        );

        /*
         * Update the tile references stored by each cell.
         */

        sourceCell.setData(
            "tile",
            this.emptyTile
        );

        destinationCell.setData(
            "tile",
            this.tile
        );

        /*
         * Keep the sprite associated with the moving tile.
         */

        this.tile.sprite = this.sprite;
        this.emptyTile.sprite = null;

        this.sprite.setData(
            "cellPosition",
            this.destinationPosition
        );

        /*
         * Calculate the destination in scene coordinates.
         */

        const targetX =
            destinationCell.x +
            scene.tileSize / 2;

        const targetY =
            destinationCell.y +
            scene.tileSize / 2;

        /*
         * Preserve the tile's intended display dimensions.
         */

        scene.restoreTileDisplaySize(this.sprite);

        this.sprite.setAlpha(1);

        /*
         * Animate the tile into the empty cell.
         */

        scene.tweens.add({
            targets: this.sprite,

            x: targetX,
            y: targetY,

            alpha: 1,

            duration: 150,

            ease: "Cubic.easeOut",

            onComplete: () => {
                /*
                 * Return the sprite to the destination cell.
                 */

                destinationCell.add(this.sprite);

                this.sprite.setPosition(
                    scene.tileSize / 2,
                    scene.tileSize / 2
                );

                this.sprite.setAlpha(1);

                scene.restoreTileDisplaySize(this.sprite);

                this.sprite.setData(
                    "cellPosition",
                    this.destinationPosition
                );

                /*
                 * Refresh the visual state of the empty cell.
                 */

                scene.refreshCellBackgrounds();

                scene.isAnimating = false;

                /*
                 * Check for victory after the animation.
                 */

                if (
                    !scene.isReplaying &&
                    scene.isSolved()
                ) {
                    scene.showVictory();
                }
            }
        });

        return this;
    }

    undo() {
        const scene = this.scene;

        /*
         * Undo is only available for a successfully executed
         * movement when no other animation is running.
         */

        if (
            !this.isValid ||
            !this.hasExecuted ||
            scene.isAnimating ||
            scene.isDragging ||
            !this.emptyTile ||
            !this.sprite
        ) {
            return this;
        }

        /*
         * Confirm that the board still matches the state
         * expected by this command.
         */

        if (
            this.tile.position !== this.destinationPosition ||
            this.emptyTile.position !== this.sourcePosition
        ) {
            return this;
        }

        const currentCell = scene.cells[
            this.destinationPosition
        ];

        const originalCell = scene.cells[
            this.sourcePosition
        ];

        if (!currentCell || !originalCell) {
            return this;
        }

        scene.isAnimating = true;

        /*
         * Capture the sprite's actual world-space center
         * before removing it from its current cell.
         */

        const bounds = this.sprite.getBounds();

        const worldX = bounds.centerX;
        const worldY = bounds.centerY;

        /*
         * Detach the sprite from its current cell and place
         * it on the scene display list for the undo animation.
         */

        currentCell.remove(this.sprite);

        scene.add.existing(this.sprite);

        this.sprite.setPosition(
            worldX,
            worldY
        );

        scene.restoreTileDisplaySize(this.sprite);

        /*
         * Restore the logical board state.
         */

        scene.exchangeTilePositions(
            this.tile,
            this.emptyTile
        );

        currentCell.setData(
            "tile",
            this.emptyTile
        );

        originalCell.setData(
            "tile",
            this.tile
        );

        this.tile.sprite = this.sprite;
        this.emptyTile.sprite = null;

        this.sprite.setData(
            "cellPosition",
            this.sourcePosition
        );

        /*
         * Calculate the original position in scene coordinates.
         */

        const targetX =
            originalCell.x +
            scene.tileSize / 2;

        const targetY =
            originalCell.y +
            scene.tileSize / 2;

        /*
         * Animate the tile back to its original cell.
         */

        scene.tweens.add({
            targets: this.sprite,

            x: targetX,
            y: targetY,

            alpha: 1,

            duration: 150,

            ease: "Cubic.easeOut",

            onComplete: () => {
                originalCell.add(this.sprite);

                this.sprite.setPosition(
                    scene.tileSize / 2,
                    scene.tileSize / 2
                );

                this.sprite.setAlpha(1);

                scene.restoreTileDisplaySize(this.sprite);

                this.sprite.setData(
                    "cellPosition",
                    this.sourcePosition
                );

                scene.refreshCellBackgrounds();

                scene.isAnimating = false;

                if (scene.isSolved()) {
                    scene.showVictory();
                }
            }
        });

        this.hasExecuted = false;

        return this;
    }

    isMoveValid() {
        const scene = this.scene;

        if (
            !this.tile ||
            !this.emptyTile ||
            !this.sprite
        ) {
            return false;
        }

        if (this.tile.isEmpty || !this.emptyTile.isEmpty) {
            return false;
        }

        if (
            this.tile.position === this.emptyTile.position
        ) {
            return false;
        }

        if (
            !scene.areAdjacent(
                this.tile.position,
                this.emptyTile.position
            )
        ) {
            return false;
        }

        if (this.tile.sprite !== this.sprite) {
            return false;
        }

        if (
            this.emptyTile.position !== this.destinationPosition
        ) {
            return false;
        }

        return true;
    }
}