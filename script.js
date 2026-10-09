const rows = 20;
const cols = 10;

let pieceRow = 0;
let pieceCol = 4;
let gameOver = false;

let gameTime = null;

const startButton = document.getElementById("start_button");
const stopButton = document.getElementById("stop_button");
const restartButton = document.getElementById("restart_button");
const gameTitle = document.querySelector("h1");

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

function spamRandom() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return pieces[randomIndex];
}

let currentPiece = spamRandom();
pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

const board = [];

for (let row = 0; row < rows; row++) {
    board[row] = [];

    for (let col = 0; col < cols; col++) {
        board[row][col] = 0;
    }
}

function drawGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");

            cell.id = `cell-${row}-${col}`;
            cell.classList.add("cell");
            playField.appendChild(cell);
        }
    }
}

function haveBlock(rowCheck, colCheck) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                const rowLine = rowCheck + row;
                const colLine = colCheck + col;

                if (
                    colLine < 0 ||
                    colLine >= cols ||
                    rowLine >= rows
                ) {
                    return true;
                }

                if (rowLine >= 0 && board[rowLine][colLine] !== 0) {
                    return true;
                }
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

function drawBackGround() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.className = "cell";
        }
    }

    drawSaveBlock();

    if (!gameOver) {
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
}

function moveDown() {
    if (!haveBlock(pieceRow + 1, pieceCol)) {
        pieceRow++;
    } else {
        saveBlock();

        currentPiece = spamRandom();
        pieceRow = 0;
        pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

        if (haveBlock(pieceRow, pieceCol)) {
            gameOver = true;
            pauseGame();
            gameTitle.textContent = "Game Over";
        }
    }

    drawBackGround();
}

function startGame() {
    if (gameTime !== null || gameOver) {
        return;
    }

    gameTime = setInterval(moveDown, 1000);
}

function pauseGame() {
    clearInterval(gameTime);
    gameTime = null;
}

function restartGame() {
    pauseGame();

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            board[row][col] = 0;
        }
    }

    gameOver = false;
    currentPiece = spamRandom();
    pieceRow = 0;
    pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);
    gameTitle.textContent = "Welcome to Tetris";

    drawBackGround();
    startGame();
}

drawGrid();
drawBackGround();

startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", restartGame);