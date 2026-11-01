export function getSolvedPositionMaps(
emptyTilePositions,
gridSize
) {
const totalTiles = gridSize * gridSize;

const solvedMaps = [];

// Original arrangement is always accepted.
const originalMap = Array.from(
    { length: totalTiles },
    (_, index) => index
);

solvedMaps.push(originalMap);

// Check for completely empty columns.
for (
    let column = 0;
    column < gridSize;
    column++
) {
    const isEmptyColumn = Array.from(
        { length: gridSize },
        (_, row) => row * gridSize + column
    ).every((position) => {
        return emptyTilePositions.includes(position);
    });

    if (!isEmptyColumn) {
        continue;
    }

    // Move the empty column to the rightmost edge.
    const rightShift = gridSize - 1 - column;

    addUniqueMap(
        solvedMaps,
        createHorizontalPositionMap(
            gridSize,
            rightShift
        )
    );

    // Move the empty column to the leftmost edge.
    const leftShift = -column;

    addUniqueMap(
        solvedMaps,
        createHorizontalPositionMap(
            gridSize,
            leftShift
        )
    );
}

// Check for completely empty rows.
for (
    let row = 0;
    row < gridSize;
    row++
) {
    const isEmptyRow = Array.from(
        { length: gridSize },
        (_, column) => row * gridSize + column
    ).every((position) => {
        return emptyTilePositions.includes(position);
    });

    if (!isEmptyRow) {
        continue;
    }

    // Move the empty row to the bottommost edge.
    const downShift = gridSize - 1 - row;

    addUniqueMap(
        solvedMaps,
        createVerticalPositionMap(
            gridSize,
            downShift
        )
    );

    // Move the empty row to the topmost edge.
    const upShift = -row;

    addUniqueMap(
        solvedMaps,
        createVerticalPositionMap(
            gridSize,
            upShift
        )
    );
}

return solvedMaps;

}

function addUniqueMap(
solvedMaps,
newMap
) {
const alreadyExists = solvedMaps.some(
(existingMap) => {
return existingMap.every(
(position, index) => {
return position === newMap[index];
}
);
}
);

if (!alreadyExists) {
    solvedMaps.push(newMap);
}

}

function createHorizontalPositionMap(
gridSize,
shift
) {
const totalTiles = gridSize * gridSize;

const positionMap = [];

for (
    let tileId = 0;
    tileId < totalTiles;
    tileId++
) {
    const row = Math.floor(
        tileId / gridSize
    );

    const column = tileId % gridSize;

    const newColumn = (
        column + shift + gridSize
    ) % gridSize;

    positionMap.push(
        row * gridSize + newColumn
    );
}

return positionMap;

}

function createVerticalPositionMap(
gridSize,
shift
) {
const totalTiles = gridSize * gridSize;

const positionMap = [];

for (
    let tileId = 0;
    tileId < totalTiles;
    tileId++
) {
    const row = Math.floor(
        tileId / gridSize
    );

    const column = tileId % gridSize;

    const newRow = (
        row + shift + gridSize
    ) % gridSize;

    positionMap.push(
        newRow * gridSize + column
    );
}

return positionMap;

}

export function isPuzzleSolved(
tiles,
solvedPositionMaps
) {
return solvedPositionMaps.some(
(positionMap) => {
return tiles.every((tile) => {

            // Empty tiles are interchangeable.
            if (tile.isEmpty) {
                return true;
            }

            // Every non-empty tile must occupy
            // its expected position.
            return (
                tile.position === positionMap[tile.id]
            );
        });
    }
);

}