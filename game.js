const rows = 20;
const cols = 10;
const fallSpeed = [1000, 800, 600, 500, 300, 200];

let pieceRow = 0;
let pieceCol = 0;
let gameOver = false;
let gameTime = null;
let score = 0;
let totalLines = 0;
let garbageLine = 5;
let pieceCount = 0;
let rotationLocked = false;

const startButton = document.getElementById("start_button");
const stopButton = document.getElementById("stop_button");
const restartButton = document.getElementById("restart_button");
const title = document.querySelector("h1");
const scoreText = document.getElementById("score");
const linesText = document.getElementById("lines");
const playField = document.getElementById("playfield");
const nextPieceBox = document.getElementById("next_piece");
const levelText = document.getElementById("level");
const levelInputs = document.querySelectorAll('input[name="level"]');

function getSelectedLevel() {
    return Number(document.querySelector('input[name="level"]:checked').value);
}

let level = getSelectedLevel();

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

const shapeIUpper = [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1]
];

const shapeU = [
    [1, 0, 1],
    [1, 1, 1]
];

const basicPieces = [
    {name: "I", shape: shapeI},
    {name: "O", shape: shapeO},
    {name: "T", shape: shapeT},
    {name: "S", shape: shapeS},
    {name: "Z", shape: shapeZ},
    {name: "J", shape: shapeJ},
    {name: "L", shape: shapeL}
];

const lv2Pieces = [
    {name: "I", shape: shapeI},
    {name: "O", shape: shapeO},
    {name: "T", shape: shapeT},
    {name: "S", shape: shapeS},
    {name: "Z", shape: shapeZ},
    {name: "J", shape: shapeJ},
    {name: "L", shape: shapeL},
    {name: "I2", shape: shapeIUpper},
    {name: "U", shape: shapeU}
];

function getRandomPiece() {
    let availablePieces = basicPieces;
    if (level >= 2) {
        availablePieces = lv2Pieces;
    }
    const randomIndex = Math.floor(Math.random() * availablePieces.length);
    const piece = availablePieces[randomIndex];
    return {
        name: piece.name,
        shape: piece.shape.map(row => row.slice())
    };
}

let currentPiece = null;
let nextPiece = null;
const board = Array.from(
    {length: rows},
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

function drawSavedBlocks() {
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
            } else {
                cell.classList.add("empty");
            }
            nextPieceBox.appendChild(cell);
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

function clearLines() {
    let clearedLines = 0;
    for (let row = rows - 1; row >= 0; row--) {
        let isFull = true;

        for (let col = 0; col < cols; col++) {
            if (board[row][col] === 0) {
                isFull = false;
            }
        }
        if (isFull) {
            board.splice(row, 1);
            board.unshift(Array(cols).fill(0));
            clearedLines++;
            row++;
        }
    }

    return clearedLines;
}

function addGarbageRow() {
    for (let col = 0; col < cols; col++) {
        if (board[0][col] !== 0) {
            gameOver = true;
            pauseGame();
            title.textContent = "Game Over";
            return;
        }
    }

    const garbageRow = Array(cols).fill("garbage");
    const hole1 = Math.floor(Math.random() * cols);
    let hole2 = Math.floor(Math.random() * cols);
    while (hole2 === hole1) {
        hole2 = Math.floor(Math.random() * cols);
    }

    garbageRow[hole1] = 0;
    garbageRow[hole2] = 0;
    board.shift();
    board.push(garbageRow);
}

function updateScore(clearedLines) {
    const points = [0, 100, 300, 500, 800];
    score += points[clearedLines] || 0;
    totalLines += clearedLines;
    scoreText.textContent = score;
    linesText.textContent = totalLines;
}

function spawnPiece(piece) {
    currentPiece = piece;
    nextPiece = getRandomPiece();
    pieceRow = 0;
    pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);
    pieceCount++;
    rotationLocked = level >= 4 && pieceCount % 5 === 0;

    if (rotationLocked) {
        title.textContent = "Khối này không thể xoay";
    } else {
        title.textContent = "Welcome to Tetris";
    }
    drawNextPiece();
}

function setLevelLocked(locked) {
    levelInputs.forEach(input => {
        input.disabled = locked;
    });
}

function selectLevel(selectedLevel) {
    level = Number(selectedLevel);
    levelText.textContent = level;
    pieceCount = 0;
    spawnPiece(getRandomPiece());
    drawBackGround();
}

function moveDown() {
    if (!haveBlock(pieceRow + 1, pieceCol)) {
        pieceRow++;
    } else {
        saveBlock();
        const clearedLines = clearLines();
        updateScore(clearedLines);
        if (level >= 3 && totalLines >= garbageLine) {
            addGarbageRow();
            garbageLine += 5;
            if (gameOver) {
                drawBackGround();
                return;
            }
        }

        spawnPiece(nextPiece);
        if (haveBlock(pieceRow, pieceCol)) {
            gameOver = true;
            pauseGame();
            title.textContent = "Game Over";
        }
    }
    drawBackGround();
}

function startGame() {
    if (gameTime !== null || gameOver) {
        return;
    }
    setLevelLocked(true);
    gameTime = setInterval(moveDown, fallSpeed[level - 1]);
}

function pauseGame() {
    clearInterval(gameTime);
    gameTime = null;
}

function restartGame() {
    pauseGame();
    garbageLine = 5;
    for (let row = 0; row < rows; row++) {
        board[row].fill(0);
    }
    gameOver = false;
    score = 0;
    totalLines = 0;
    scoreText.textContent = score;
    linesText.textContent = totalLines;
    title.textContent = "Welcome to Tetris";
    setLevelLocked(false);
    selectLevel(getSelectedLevel());
}

function movePiece(direction) {
    if (!haveBlock(pieceRow, pieceCol + direction)) {
        pieceCol += direction;
        drawBackGround();
    }
}

function rotatePiece() {
    if (rotationLocked) {
        return;
    }
    const oldShape = currentPiece.shape;
    const oldHeight = oldShape.length;
    const oldWidth = oldShape[0].length;
    const newShape = [];
    for (let i = 0; i < oldWidth; i++) {
        newShape.push(Array(oldHeight).fill(0));
    }
    for (let r = 0; r < oldHeight; r++) {
        for (let c = 0; c < oldWidth; c++) {
            newShape[c][oldHeight - 1 - r] = oldShape[r][c];
        }
    }

    currentPiece.shape = newShape;
    if (haveBlock(pieceRow, pieceCol)) {
        currentPiece.shape = oldShape;
    }
    drawBackGround();
}

drawGrid();
selectLevel(getSelectedLevel());
levelInputs.forEach(input => {
    input.addEventListener("change", function () {
        selectLevel(this.value);
    });
});

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