export class Movement {
  constructor(scene, tile, targetPosition) {
    this.scene = scene;
    this.tile = tile;
    this.targetPosition = targetPosition;
    
    this.id = "movement";
    this.isValid = false;
  }
  
  execute() {
    throw new Error(
      "Movement.execute() must be implemented by a subclass."
    );
  }
  
  undo() {
    throw new Error(
      "Movement.undo() must be implemented by a subclass."
    );
  }
}