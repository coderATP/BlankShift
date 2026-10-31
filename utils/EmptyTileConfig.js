const EMPTY_TILE_CONFIG = {
  "123": [15],
  "abc": [15],
  "alligator": [0],
  "bear": [3],
  "chicken": [12, 15],
  "dog": [3, 7],
  "elephant": [3],
  "fox": [3, 7]
};

export function getEmptyTilePositions(imageKey) {
  const positions = EMPTY_TILE_CONFIG[imageKey];
  
  if (!positions) {
    console.warn(
      `BlankShift: No empty-tile configuration found for "${imageKey}".`
    );
    
    return [0];
  }
  
  return [...positions];
}

export function hasEmptyTileConfig(imageKey) {
  return Object.prototype.hasOwnProperty.call(
    EMPTY_TILE_CONFIG,
    imageKey
  );
}

export function getEmptyTileCount(imageKey) {
  return getEmptyTilePositions(imageKey).length;
}