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
         * The empty tile does not have a sprite.
         */

        this.tile.sprite = this.sprite;
        this.emptyTile.sprite = null;

        this.sprite.setData(
            "cellPosition",
            this.destinationPosition
        );

        /*
         * Calculate the destination in scene coordinates.
         *
         * The sprite is temporarily a scene-level object,
         * not a child of its original cell.
         */

        const targetX =
            destinationCell.x +
            scene.tileSize / 2;

        const targetY =
            destinationCell.y +
            scene.tileSize / 2;

        /*
         * Preserve the tile's intended display dimensions.
         * Do not use scale: 1 or setScale(1).
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

                if (scene.isSolved()) {
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
         *
         * getBounds() avoids assuming that local sprite
         * coordinates are also world coordinates.
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
         *
         * The moving tile returns to its original position,
         * and the empty tile returns to the destination.
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
         * Animate the tile back to its original cell without
         * changing its scale.
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
                 * Restore cell ownership after the animation.
                 */

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

                /*
                 * Check the restored board state.
                 */

                if (scene.isSolved()) {
                    scene.showVictory();
                }
            }
        });

        /*
         * Mark this command as undone so it cannot be
         * executed again accidentally.
         */

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

        /*
         * The moving tile must not be the empty tile.
         */

        if (this.tile.isEmpty || !this.emptyTile.isEmpty) {
            return false;
        }

        /*
         * A tile cannot move into its own position.
         */

        if (
            this.tile.position === this.emptyTile.position
        ) {
            return false;
        }

        /*
         * The destination must be adjacent to the moving tile.
         */

        if (
            !scene.areAdjacent(
                this.tile.position,
                this.emptyTile.position
            )
        ) {
            return false;
        }

        /*
         * The sprite must belong to the tile being moved.
         */

        if (this.tile.sprite !== this.sprite) {
            return false;
        }

        /*
         * Confirm the destination is the requested position.
         */

        if (
            this.emptyTile.position !== this.destinationPosition
        ) {
            return false;
        }

        return true;
    }
}