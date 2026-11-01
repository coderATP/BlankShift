const EMPTY_TILE_CONFIG = {
  "123": [15],
  "abc": [15],
  "alligator": [0],
  "bear": [3],
  "chicken": [12, 15],
  "dog": [3, 7],
  "elephant": [3],
  "fox": [3, 7],
  "giraffe": [2, 3, 4, 7, 8, 11, 12, 15 ],
  "horse": [0, 1],
  "iguana": [0],
  "jaguar": [0, 14, 15],
  "lion": [2],
  "monkey": [0],
  "newt": [0, 15],
  "octopus": [3, 12],
  "parrot": [0, 1, 4, 14, 15],
  "quail": [2,3],
  "rat": [3, 12],
  "snake": [0, 1],
  "tiger": [12, 13],
  "turtle": [0, 3, 12, 15],
  "urial": [0, 1],
  "vulture": [0, 1],
  "wolf": [2, 3],
  "x-ray tetra": [0, 3, 12, 13, 15],
  "yak": [3],
  "zebra": [0, 1],

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