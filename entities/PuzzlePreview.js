export class PuzzlePreview {
    constructor(scene, imageKey) {
        this.scene = scene;
        this.imageKey = imageKey;

        this.container = null;
        this.image = null;
        this.grid = null;

        this.create();
    }

    create() {
        this.container = this.scene.add.container(
            12,
            12
        );

        this.container.setDepth(50);

        // Display the original puzzle image.
        this.image = this.scene.add.image(
            0,
            0,
            this.imageKey
        );

        this.image.setOrigin(0);

        // Draw the 4x4 black grid.
        this.grid = this.scene.add.graphics();

        this.container.add([
            this.image,
            this.grid
        ]);
    }

    updateLayout(width, height) {
        const previewSize = Math.max(
            56,
            Math.min(
                112,
                width * 0.22,
                height * 0.16
            )
        );

        // Keep the preview at the top-left corner.
        this.container.setPosition(
            12,
            12
        );

        // Resize the original image.
        this.image.setDisplaySize(
            previewSize,
            previewSize
        );

        this.drawGrid(previewSize);
    }

    drawGrid(size) {
        this.grid.clear();

        this.grid.lineStyle(
            2,
            0x000000,
            1
        );

        const cellSize = size / 4;

        // Vertical grid lines.
        for (let column = 0; column <= 4; column++) {
            const x = column * cellSize;

            this.grid.beginPath();

            this.grid.moveTo(
                x,
                0
            );

            this.grid.lineTo(
                x,
                size
            );

            this.grid.strokePath();
        }

        // Horizontal grid lines.
        for (let row = 0; row <= 4; row++) {
            const y = row * cellSize;

            this.grid.beginPath();

            this.grid.moveTo(
                0,
                y
            );

            this.grid.lineTo(
                size,
                y
            );

            this.grid.strokePath();
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy(true);

            this.container = null;
            this.image = null;
            this.grid = null;
        }
    }
}