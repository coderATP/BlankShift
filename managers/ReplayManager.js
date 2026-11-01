import { TileMovement } from "../movements/TileMovement.js";
import { Button } from "../entities/Button.js";

export class ReplayManager {
    constructor(scene) {
        this.scene = scene;

        this.moves = [];

        this.currentIndex = 0;

        this.isPlaying = false;
        this.stopRequested = false;

        this.replayTimer = null;
        this.replaySpeed = 150;
        this.stopButton = null;

        this.completedPositions = null;
    }

    start() {
        if (
            this.isPlaying ||
            this.scene.commandHandler.moves.length === 0
        ) {
            return;
        }

        this.moves = [
            ...this.scene.commandHandler.moves
        ];

        /*
         * Preserve the completed board arrangement.
         */

        if (!this.completedPositions) {
            this.completedPositions = new Map();

            this.scene.tiles.forEach(tile => {
                this.completedPositions.set(
                    tile,
                    tile.position
                );
            });
        }

        /*
         * Restore the original shuffled arrangement.
         */

        this.restoreStartingBoard();

        this.isPlaying = true;

        this.stopRequested = false;

        this.currentIndex = 0;

        this.scene.isReplaying = true;

        this.scene.isGameOver = false;
        /*
 * Hide the normal game controls during replay.
 */

this.scene.controlButtons.forEach(button => {
    button.setVisible(false);
}); 
        /*
         * Keep scene input enabled so the STOP REPLAY
         * button can receive pointer events.
         *
         * Board interactions are prevented by isReplaying
         * guards in PlayScene.
         */

        this.createStopButton();

        this.scene.time.delayedCall(
    this.replaySpeed,
    () => {
        this.playNextMove();
    }
);
    }

    restoreStartingBoard() {
        const positions = new Map(
            this.completedPositions
        );

        /*
         * Reverse the recorded movements to reconstruct
         * the original shuffled board.
         */

        for (
            let index = this.moves.length - 1;
            index >= 0;
            index--
        ) {
            const command = this.moves[index];

            positions.set(
                command.tile,
                command.sourcePosition
            );

            positions.set(
                command.emptyTile,
                command.destinationPosition
            );
        }

        this.applyBoardPositions(positions);
    }

    restoreCompletedBoard() {
        if (!this.completedPositions) {
            return;
        }

        this.applyBoardPositions(
            this.completedPositions
        );
    }

    applyBoardPositions(positions) {
        const scene = this.scene;

        /*
         * Restore every tile's logical position.
         */

        scene.tiles.forEach(tile => {
            tile.position = positions.get(tile);
        });

        /*
         * Rebuild cell ownership.
         */

        scene.cells.forEach(cell => {
            cell.setData("tile", null);
        });

        scene.tiles.forEach(tile => {
            const cell = scene.cells[tile.position];

            if (!cell) {
                return;
            }

            cell.setData("tile", tile);

            /*
             * Restore the visual tile sprite.
             */

            if (tile.sprite) {
                tile.sprite.removeFromDisplayList();

                cell.add(tile.sprite);

                tile.sprite.setPosition(
                    scene.tileSize / 2,
                    scene.tileSize / 2
                );

                tile.sprite.setAlpha(1);

                scene.restoreTileDisplaySize(
                    tile.sprite
                );

                tile.sprite.setData(
                    "cellPosition",
                    tile.position
                );
            }
        });

        scene.refreshCellBackgrounds();
    }

    playNextMove() {
        if (!this.isPlaying) {
            return;
        }

        if (
            this.stopRequested ||
            this.currentIndex >= this.moves.length
        ) {
            this.finish();

            return;
        }

        const originalCommand =
            this.moves[this.currentIndex];

        const replayCommand = new TileMovement(
            this.scene,
            originalCommand.tile,
            originalCommand.destinationPosition,
            originalCommand.sprite
        );

        replayCommand.execute();

        if (!replayCommand.isValid) {
            console.error(
                "BlankShift: Invalid replay movement.",
                {
                    moveIndex: this.currentIndex,
                    sourcePosition: originalCommand.sourcePosition,
                    destinationPosition: originalCommand.destinationPosition,
                    tilePosition: originalCommand.tile.position,
                    emptyTilePosition: originalCommand.emptyTile.position
                }
            );

            this.finish();

            return;
        }

        this.currentIndex++;

        this.waitForMovement();
    }

    waitForMovement() {
        if (!this.isPlaying) {
            return;
        }

        this.replayTimer = this.scene.time.addEvent({
            delay: 750,

            loop: true,

            callback: () => {
                if (this.scene.isAnimating) {
                    return;
                }

                this.replayTimer.remove(false);

                this.replayTimer = null;

                if (this.stopRequested) {
                    this.finish();

                    return;
                }

                this.playNextMove();
            }
        });
    }

    createStopButton() {
        const layout = this.scene.layout;

        let x;
        let y;
        let width;

        if (layout.orientation === "portrait") {
            x = layout.width / 2;

            y = layout.controlsY;

            width = Math.min(
                layout.width - 24,
                220
            );
        } else {
            x = layout.width / 2;

            y = layout.height - 35;

            width = 220;
        }

        this.stopButton = new Button(
            this.scene,
            x,
            y,
            width,
            layout.buttonHeight,
            "STOP REPLAY",
            () => {
                this.stop();
            },
            0x7a2638
        );

        this.stopButton.setDepth(200);
    }

    updateButtonLayout() {
        if (!this.stopButton) {
            return;
        }

        const layout = this.scene.layout;

        let x;
        let y;
        let width;

        if (layout.orientation === "portrait") {
            x = layout.width / 2;

            y = layout.controlsY;

            width = Math.min(
                layout.width - 24,
                220
            );
        } else {
            x = layout.width / 2;

            y = layout.height - 35;

            width = 220;
        }

        this.stopButton.setPosition(x, y);

        this.stopButton.setSize(
            width,
            layout.buttonHeight
        );
    }

    stop() {
        if (!this.isPlaying) {
            return;
        }

        this.stopRequested = true;

        if (!this.scene.isAnimating) {
            this.finish();
        }
    }

    finish() {
        if (!this.isPlaying) {
            return;
        }

        this.isPlaying = false;

        this.stopRequested = false;

        if (this.replayTimer) {
            this.replayTimer.remove(false);

            this.replayTimer = null;
        }

        if (this.stopButton) {
            this.stopButton.destroy();

            this.stopButton = null;
        }

        /*
         * Restore the completed puzzle.
         */

        this.restoreCompletedBoard();

        this.scene.isReplaying = false;

        this.scene.isGameOver = true;
        /*
 * Restore the normal game controls.
 */

this.scene.controlButtons.forEach(button => {
    button.setVisible(true);
});
        /*
         * Clear the replay copy only.
         */

        this.moves = [];

        this.currentIndex = 0;

        /*
         * Return to the completion screen.
         */

        this.scene.scene.sleep("PlayScene");

        this.scene.scene.wake("LevelCompleteScene");

        this.scene.scene.bringToTop(
            "LevelCompleteScene"
        );

        const levelCompleteScene =
            this.scene.scene.get("LevelCompleteScene");

        levelCompleteScene.onReplayFinished();
    }

    destroy() {
        if (this.replayTimer) {
            this.replayTimer.remove(false);

            this.replayTimer = null;
        }

        if (this.stopButton) {
            this.stopButton.destroy();

            this.stopButton = null;
        }

        this.moves = [];

        this.completedPositions = null;

        this.isPlaying = false;
    }
}