const rows = 20;
const cols = 10;

let pieceRow = 0;
let pieceCol = 4;

const playField = document.getElementById("playfield");

const shapeI = [
    [1, 1, 1, 1]
];

const shapeO = [
    [1, 1],
    [1, 1]
];

const shapeT = [
    [0, 1, 0],
    [1, 1, 1]
];

const shapeS = [
    [0, 1, 1],
    [1, 1, 0]
];

const shapeZ = [
    [1, 1, 0],
    [0, 1, 1]
];

const shapeJ = [
    [1, 0, 0],
    [1, 1, 1]
];

const shapeL = [
    [0, 0, 1],
    [1, 1, 1]
];

const pieces = [
    { name: "I", shape: shapeI },
    { name: "O", shape: shapeO },
    { name: "T", shape: shapeT },
    { name: "S", shape: shapeS },
    { name: "Z", shape: shapeZ },
    { name: "J", shape: shapeJ },
    { name: "L", shape: shapeL }
];

function getRandomPiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return pieces[randomIndex];
}

let currentPiece = getRandomPiece();
pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

function createGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");

            cell.id = `cell-${row}-${col}`;
            cell.classList.add("cell");
            playField.appendChild(cell);
        }
    }
}

function draw() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.className = "cell";
        }
    }

    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                const screenRow = pieceRow + row;
                const screenCol = pieceCol + col;
                const cell = document.getElementById(
                    `cell-${screenRow}-${screenCol}`
                );

                if (cell) {
                    cell.classList.add(currentPiece.name);
                }
            }
        }
    }
}
createGrid();
draw();

setInterval(function () {
    if (pieceRow + currentPiece.shape.length < rows) {
        pieceRow++;
    } else {
        pieceRow = 0;
        currentPiece = getRandomPiece();
        pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);
    }

    draw();
}, 1000);

const board = [];

for (let row = 0; row < rows; row++) {
    board[row] = [];

    for (let col = 0; col < cols; col++) {
        board[row][col] = 0;
    }
}

function haveBlock(rowCheck, colCheck) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 0) {
                continue;
            }

            const rowLine = rowCheck + row;
            const colLine = colCheck + col;

            if (colLine < 0 || colLIne >= cols || rowLine >= rows) {
                return true;
            }

            if (rowLine >= 0 && board[rowLine][colLine] !== 0) {
                return true;
            }
        }
    }
    return false;
}

function saveBlock() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                const rowLine = pieceRow + row;
                const colLine = pieceCol + col;

                board[rowLine][colLine] = currentPiece.name;
            }
        }
    }
}

function drawSaveBlock() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== 0) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.classList.add(board[row][col]);
            }
        }
    }
}