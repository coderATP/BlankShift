export class BoardBorder {
  constructor(scene) {
    this.scene = scene;
    
    this.graphics = this.scene.add.graphics();
    
    this.graphics.setDepth(-1);
    
    this.borderThickness = 15;
    
    this.draw();
  }
  
  draw() {
    const graphics = this.graphics;
    const thickness = this.borderThickness;
    
    graphics.clear();
    
    /*
     * Outer dark green frame.
     */
    graphics.fillStyle(
      0x064e3b,
      1
    );
    
    graphics.fillRect(
      0,
      0,
      thickness,
      thickness
    );
    
    /*
     * The frame is drawn using four sides.
     * Each layer creates a groove-like appearance.
     */
  }
  
  updateLayout(boardX, boardY, boardSize) {
    const thickness = this.borderThickness;
    
    const outerSize =
      boardSize + thickness * 2;
    
    this.graphics.clear();
    
    /*
     * Layer 1: Outer dark green frame.
     */
    this.drawFrame(
      0,
      0,
      outerSize,
      0x064e3b
    );
    
    /*
     * Layer 2: Main green surface.
     */
    this.drawFrame(
      3,
      3,
      outerSize - 6,
      0x15803d
    );
    
    /*
     * Layer 3: Dark recessed groove.
     */
    this.drawFrame(
      6,
      6,
      outerSize - 12,
      0x14532d
    );
    
    /*
     * Layer 4: Inner green bevel.
     */
    this.drawFrame(
      9,
      9,
      outerSize - 18,
      0x22c55e
    );
    
    /*
     * Position the frame around the puzzle.
     */
    this.graphics.setPosition(
      boardX - thickness,
      boardY - thickness
    );
  }
  
  drawFrame(inset, size, outerSize, color) {
    const graphics = this.graphics;
    
    const thickness = 3;
    
    graphics.fillStyle(
      color,
      1
    );
    
    // Top.
    graphics.fillRect(
      inset,
      inset,
      outerSize,
      thickness
    );
    
    // Bottom.
    graphics.fillRect(
      inset,
      inset + outerSize - thickness,
      outerSize,
      thickness
    );
    
    // Left.
    graphics.fillRect(
      inset,
      inset,
      thickness,
      outerSize
    );
    
    // Right.
    graphics.fillRect(
      inset + outerSize - thickness,
      inset,
      thickness,
      outerSize
    );
  }
  
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
      
      this.graphics = null;
    }
  }
}