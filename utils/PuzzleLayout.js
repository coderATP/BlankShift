export function calculatePuzzleLayout(
    width,
    height,
    gridSize = 4
) {
    const orientation =
        width >= height ? "landscape" : "portrait";
    
    const borderThickness = 15;
    
    /*
     * Reserve space for the outer board border.
     */
    const availableBoardSize =
        orientation === "portrait" ?
        width :
        height;
    
    const boardSize = Math.max(
        1,
        availableBoardSize -
        borderThickness * 2
    );
    
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
        
        borderThickness,
        
        tileSize,
        
        tileDisplaySize: Math.max(
            1,
            tileSize - 4
        )
    };
    
    if (orientation === "portrait") {
        const boardBottom =
            boardY + boardSize;
        
        const availableHeight =
            height - boardBottom - borderThickness;
        
        layout.controlsY =
            boardBottom +
            borderThickness +
            availableHeight / 2;
        
        layout.buttonHeight = Math.min(
            64,
            Math.max(36, availableHeight - 12)
        );
        
        return layout;
    }
    
    /*
     * Landscape layout.
     */
    const outerBoardLeft =
        boardX - borderThickness;
    
    const outerBoardRight =
        boardX + boardSize + borderThickness;
    
    const sideSpace = outerBoardLeft;
    
    layout.leftControlsX = sideSpace / 2;
    
    layout.rightControlsX =
        outerBoardRight + sideSpace / 2;
    
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