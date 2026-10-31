export class CommandHandler {
  constructor(scene) {
    this.scene = scene;
    
    this.moves = [];
    
    this.totalMovesCount = 0;
  }
  
  getTotalMoves() {
    return this.totalMovesCount;
  }
  
  execute(command) {
    if (!command) {
      return;
    }
    
    command.execute();
    
    /*
     * Invalid commands must never enter the history.
     */
    
    if (!command.isValid || !command.hasExecuted) {
      return;
    }
    
    this.moves.push(command);
    
    this.totalMovesCount++;
    
    this.updateMoveCount();
    
    return command;
  }
  
  undo() {
    if (this.moves.length === 0) {
      return;
    }
    
    if (
      this.scene.isAnimating ||
      this.scene.isDragging ||
      this.scene.isGameOver
    ) {
      return;
    }
    
    const command = this.moves.pop();
    
    if (!command) {
      return;
    }
    
    command.undo();
    
    /*
     * As in Solitaire, undo is included in the
     * total number of moves made.
     */
    
    this.totalMovesCount++;
    
    this.updateMoveCount();
    
    return command;
  }
  
  updateMoveCount() {
    this.scene.moveCount = this.totalMovesCount;
    
    if (this.scene.moveText) {
      this.scene.moveText.setText(
        `Moves: ${this.totalMovesCount}`
      );
    }
  }
  
  reset() {
    this.moves = [];
    
    this.totalMovesCount = 0;
    
    this.scene.moveCount = 0;
    
    if (this.scene.moveText) {
      this.scene.moveText.setText("Moves: 0");
    }
  }
}