export function calculatePuzzleLayout(
    width,
    height,
    gridSize = 4
) {
    const orientation =
        width >= height ? "landscape" : "portrait";

    /*
     * Portrait: use the full screen width.
     * Landscape: use the full screen height.
     */
    const boardSize =
        orientation === "portrait"
            ? width
            : height;

    const tileSize = boardSize / gridSize;

    /*
     * Center the square puzzle on both axes.
     */
    const boardX = (width - boardSize) / 2;
    const boardY = (height - boardSize) / 2;

    const layout = {
        width,
        height,
        orientation,

        boardSize,
        boardX,
        boardY,

        tileSize,

        tileDisplaySize: Math.max(
            1,
            tileSize - 4
        )
    };

    if (orientation === "portrait") {
        /*
         * All four buttons occupy the space
         * beneath the board.
         */
        const boardBottom = boardY + boardSize;

        const availableHeight =
            height - boardBottom;

        layout.controlsY =
            boardBottom + availableHeight / 2;

        layout.buttonHeight = Math.min(
            64,
            Math.max(36, availableHeight - 12)
        );

        return layout;
    }

    /*
     * Landscape:
     * The board fills the screen height.
     *
     * Use the remaining horizontal space
     * for two buttons on each side.
     */
    const sideSpace = boardX;

    layout.leftControlsX = sideSpace / 2;

    layout.rightControlsX =
        boardX + boardSize + sideSpace / 2;

    layout.sideButtonWidth = Math.max(
        1,
        sideSpace - 16
    );

    layout.buttonHeight = Math.min(
        72,
        height * 0.16
    );

    return layout;
}