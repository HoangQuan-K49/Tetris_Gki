const rows = 20;
const cols = 10;

let pieceRow = 0;
let pieceCol = 0;
let gameOver = false;
let gameTime = null;
let score = 0;
let totalLines = 0;

const startButton = document.getElementById("start_button");
const stopButton = document.getElementById("stop_button");
const restartButton = document.getElementById("restart_button");
const gameTitle = document.querySelector("h1");
const scoreText = document.getElementById("score");
const linesText = document.getElementById("lines");
const playField = document.getElementById("playfield");
const nextPieceBox = document.getElementById("next_piece");

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
    const piece = pieces[randomIndex];

    return {
        name: piece.name,
        shape: piece.shape.map(row => row.slice())
    };
}

let currentPiece = spamRandom();
let nextPiece = spamRandom();

pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

const board = Array.from(
    { length: rows },
    () => Array(cols).fill(0)
);

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

                if (rowLine >= 0) {
                    board[rowLine][colLine] = currentPiece.name;
                }
            }
        }
    }
}

function drawSavedBlocks() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== 0) {
                const cell = document.getElementById(`cell-${row}-${col}`);

                if (cell) {
                    cell.classList.add(board[row][col]);
                }
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

    drawSavedBlocks();

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

function clearLines() {
    let clearedLines = 0;

    for (let row = rows - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(cols).fill(0));
            clearedLines++;
            row++;
        }
    }

    return clearedLines;
}

function updateScore(clearedLines) {
    const points = [0, 100, 300, 500, 800];

    score += points[clearedLines] || 0;
    totalLines += clearedLines;

    scoreText.textContent = score;
    linesText.textContent = totalLines;
}

function drawNextPiece() {
    nextPieceBox.innerHTML = "";
    nextPieceBox.style.display = "grid";
    nextPieceBox.style.gridTemplateColumns =
        `repeat(${nextPiece.shape[0].length}, 24px)`;
    nextPieceBox.style.gap = "2px";

    for (let row = 0; row < nextPiece.shape.length; row++) {
        for (let col = 0; col < nextPiece.shape[row].length; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (nextPiece.shape[row][col] === 1) {
                cell.classList.add(nextPiece.name);
            }

            nextPieceBox.appendChild(cell);
        }
    }
}

function moveDown() {
    if (!haveBlock(pieceRow + 1, pieceCol)) {
        pieceRow++;
    } else {
        saveBlock();

        const clearedLines = clearLines();
        updateScore(clearedLines);

        currentPiece = nextPiece;
        nextPiece = spamRandom();

        pieceRow = 0;
        pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

        drawNextPiece();

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
        board[row].fill(0);
    }

    gameOver = false;
    score = 0;
    totalLines = 0;
    scoreText.textContent = score;
    linesText.textContent = totalLines;

    currentPiece = spamRandom();
    nextPiece = spamRandom();

    pieceRow = 0;
    pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);

    gameTitle.textContent = "Welcome to Tetris";

    drawNextPiece();
    drawBackGround();
    startGame();
}

function movePiece(direction) {
    if (!haveBlock(pieceRow, pieceCol + direction)) {
        pieceCol += direction;
        drawBackGround();
    }
}

function rotatePiece() {
    const oldShape = currentPiece.shape;

    currentPiece.shape = oldShape[0].map((_, col) =>
        oldShape.map(row => row[col]).reverse()
    );

    if (haveBlock(pieceRow, pieceCol)) {
        currentPiece.shape = oldShape;
    }

    drawBackGround();
}

drawGrid();
drawNextPiece();
drawBackGround();

startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", restartGame);

document.addEventListener("keydown", function (event) {
    const arrowKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp"
    ];

    if (arrowKeys.includes(event.key)) {
        event.preventDefault();
    }

    if (gameTime === null || gameOver) {
        return;
    }

    if (event.key === "ArrowLeft") {
        movePiece(-1);
    } else if (event.key === "ArrowRight") {
        movePiece(1);
    } else if (event.key === "ArrowDown") {
        moveDown();
    } else if (event.key === "ArrowUp" && !event.repeat) {
        rotatePiece();
    }
});