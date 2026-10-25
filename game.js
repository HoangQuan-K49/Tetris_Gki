const rows = 20;
const cols = 10;
const fallSpeed = [1000, 800, 600, 500, 500, 500];
const lvUp = 10;
const garbageStep = 3;
const IChancePlus = 0.15;
const pieceName = {I: "chữ I", O: "vuông", T: "chữ T", S: "chữ S", Z: "chữ Z", J: "chữ J", L: "chữ L", I2: "chữ I hoa", U: "chữ U", Bomb: "bom"};
const comboMin = 2;
const comboMax = 4;
const lv2ChancePlus = 0.15;
const startButton = document.getElementById("start_button");
const stopButton = document.getElementById("stop_button");
const restartButton = document.getElementById("restart_button");
const title = document.querySelector("h1");
const scoreText = document.getElementById("score");
const totalScoreText = document.getElementById("total_score");
const lineText = document.getElementById("line");
const playField = document.getElementById("playfield");
const nextPieceBox = document.getElementById("next_piece");
const levelText = document.getElementById("level");
const levelInput = document.querySelectorAll('input[name="level"]');
const board = [];

for (let row = 0; row < rows; row++) {
    const newRow = [];
    for (let col = 0; col < cols; col++) {
        newRow.push(0);
    }
    board.push(newRow);
}

let pieceRow = 0;
let pieceCol = 0;
let gameOver = false;
let gameTime = null;
let score = 0;
let totalScore = 0;
let levelLine = 0;
let garbageLine = garbageStep;
let pieceCount = 0;
let rotationLock = false;
let currentPiece = null;
let nextPiece = null;
let paused = false;
let comboName = "";
let comboLeft = 0;
let comboTotal = 0;

function getSelectLevel() {
    return Number(document.querySelector('input[name="level"]:checked').value);
}

let level = getSelectLevel();

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
const shapeBomb = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
    [0, 1, 1, 0]
];

const basicPiece = [
    {name: "I", shape: shapeI},
    {name: "O", shape: shapeO},
    {name: "T", shape: shapeT},
    {name: "S", shape: shapeS},
    {name: "Z", shape: shapeZ},
    {name: "J", shape: shapeJ},
    {name: "L", shape: shapeL}
];
const specialPiece = [
    {name: "I2", shape: shapeIUpper},
    {name: "U", shape: shapeU}
];
const level5Piece = [];
for (let i = 0; i < basicPiece.length; i++) {
    level5Piece.push(basicPiece[i]);
}
level5Piece.push({name: "Bomb", shape: shapeBomb});

// lv2: khoi co ban ra theo nhom giong nhau lien tiep (2-4 khoi), het nhom thi doi sang loai khac
// khoi dac biet (I2, U) chen ngau nhien va khong tinh vao nhom
function getRandomPiece() {
    let pieceList = basicPiece;
    if (level === 5) {
        pieceList = level5Piece;
    }
    let piece = null;
    let comboPos = 0;
    let comboLength = 0;

    if (level === 2) {
        if (Math.random() < lv2ChancePlus) {
            const specialIndex = Math.floor(Math.random() * specialPiece.length);
            piece = specialPiece[specialIndex];
        } else {
            if (comboLeft <= 0) {
                let newIndex = Math.floor(Math.random() * basicPiece.length);
                while (basicPiece[newIndex].name === comboName) {
                    newIndex = Math.floor(Math.random() * basicPiece.length);
                }
                comboName = basicPiece[newIndex].name;
                comboTotal = comboMin + Math.floor(Math.random() * (comboMax - comboMin + 1));
                comboLeft = comboTotal;
            }
            for (let i = 0; i < basicPiece.length; i++) {
                if (basicPiece[i].name === comboName) {
                    piece = basicPiece[i];
                }
            }
            comboLeft--;
            comboPos = comboTotal - comboLeft;
            comboLength = comboTotal;
        }
    } else if (Math.random() < IChancePlus) {

        // co them IChancePlus de ra khoi I nhieu hon
        piece = basicPiece[0];
    } else {
        const randomNumber = Math.random();
        const randomIndex = Math.floor(randomNumber * pieceList.length);
        piece = pieceList[randomIndex];
    }
    const shapeCopy = [];
    for (let row = 0; row < piece.shape.length; row++) {
        const newRow = [];
        for (let col = 0; col < piece.shape[row].length; col++) {
            newRow.push(piece.shape[row][col]);
        }
        shapeCopy.push(newRow);
    }
    return {
        name: piece.name,
        shape: shapeCopy,
        comboPos: comboPos,
        comboLength: comboLength
    };
}

// ve luoi
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

// dat 3 vat can ngau nhien vao cac o trong o hang 16-18 khi bat dau lv6
function addObstacle() {
    const emptyCells = [];
    for (let row = 16; row <= 18; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === 0) {
                const position = [row, col];
                emptyCells.push(position);
            }
        }
    }
    let obstacleCount = 3;
    if (emptyCells.length < obstacleCount) {
        obstacleCount = emptyCells.length;
    }
    for (let i = 0; i < obstacleCount; i++) {
        const randomNumber = Math.random();
        const randomIndex = Math.floor(randomNumber * emptyCells.length);
        const position = emptyCells[randomIndex];
        const row = position[0];
        const col = position[1];
        board[row][col] = "obstacle";

        // Xoa vi tri da chon khoi danh sach de khong chon trung
        for (let j = randomIndex; j < emptyCells.length - 1; j++) {
            emptyCells[j] = emptyCells[j + 1];
        }
        emptyCells.length = emptyCells.length - 1;
    }
}

// xoa vat can
function clearObstacle() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === "obstacle") {
                board[row][col] = 0;
            }
        }
    }
}

// xoa sach board (dung khi qua lv moi va khi choi lai)
function clearBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            board[row][col] = 0;
        }
    }
}

// ve cac khoi khi da roi xuong cham day va khong nhuc nhich
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

// ve lai man game voi cac o
function drawBackground() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.className = "cell";
        }
    }
    drawSaveBlock();
    if (!gameOver && currentPiece !== null) {
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col] === 1) {
                    const screenRow = pieceRow + row;
                    const screenCol = pieceCol + col;
                    const cell = document.getElementById(`cell-${screenRow}-${screenCol}`);
                    if (cell) {
                        cell.classList.add(currentPiece.name);
                    }
                }
            }
        }
    }
}

// ve khoi tiep theo cho Ui khoi tiep theo
function drawNextPiece() {
    nextPieceBox.innerHTML = "";

    // lv4: khong hien thi khoi ke tiep
    if (level === 4) return;
    const pieceWidth = nextPiece.shape[0].length;
    let columnStyle = "";
    for (let i = 0; i < pieceWidth; i++) {
        columnStyle += "24px ";
    }
    nextPieceBox.style.display = "grid";
    nextPieceBox.style.gridTemplateColumns = columnStyle;
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

// kiem tra va cham voi khoi khac ,voi tuong va voi day
function haveBlock(rowCheck, colCheck) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                const rowLine = rowCheck + row;
                const colLine = colCheck + col;
                if (colLine < 0 || colLine >= cols || rowLine >= rows) return true;
                if (rowLine >= 0 && board[rowLine][colLine] !== 0) return true;
            }
        }
    }
    return false;
}

// luu khoi hien tai vao board khi da cham day hoac cham khoi khac
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

// xoa hang khi duoc lap day
function clearLine() {
    let lineCount = 0;
    for (let row = rows - 1; row >= 0; row--) {
        let isFull = true;
        let hasObstacle = false;
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === 0) {
                isFull = false;
            }
            if (board[row][col] === "obstacle") {
                hasObstacle = true;
            }
        }
        if (isFull && !hasObstacle) {

            // Dich cac hang phia tren xuong mot hang
            for (let moveRow = row; moveRow > 0; moveRow--) {
                board[moveRow] = board[moveRow - 1];
            }

            // Tao hang trong moi o tren cung
            const newRow = [];
            for (let col = 0; col < cols; col++) {
                newRow.push(0);
            }
            board[0] = newRow;

            lineCount++;
            row++;
        }
    }
    return lineCount;
}

// them 1 hang rac (co 2 lo ngau nhien) o day, day cac hang len; thua neu hang tren cung co khoi
function addGarbageRow() {
    for (let col = 0; col < cols; col++) {
        if (board[0][col] !== 0) {
            gameOver = true;
            pauseGame();
            title.textContent = "Game Over";
            return;
        }
    }
    const garbageRow = [];
    for (let col = 0; col < cols; col++) {
        garbageRow.push("garbage");
    }
    const randomNumber1 = Math.random();
    const hole1 = Math.floor(randomNumber1 * cols);
    let randomNumber2 = Math.random();
    let hole2 = Math.floor(randomNumber2 * cols);
    while (hole2 === hole1) {
        randomNumber2 = Math.random();
        hole2 = Math.floor(randomNumber2 * cols);
    }
    garbageRow[hole1] = 0;
    garbageRow[hole2] = 0;

    // Dich cac hang len tren mot hang
    for (let row = 0; row < rows - 1; row++) {
        board[row] = board[row + 1];
    }

    // Dua hang rac xuong vi tri cuoi cung
    board[rows - 1] = garbageRow;
}

// cap nhat diem va so hang cua lv sau moi lan xoa hang
function updateScore(lineCount) {
    const point = [0, 100, 300, 500, 700];
    let gainPoint = 0;
    if (lineCount >= 0 && lineCount < point.length) {
        gainPoint = point[lineCount];
    }
    score += gainPoint;
    levelLine += lineCount;
    scoreText.textContent = score;
    totalScoreText.textContent = totalScore;

    // hien thi toi da lvUp de khong bi "12/10"
    let showLine = levelLine;
    if (showLine > lvUp) {
        showLine = lvUp;
    }
    lineText.textContent = showLine + "/" + lvUp;
}

// dat khoi hien tai len dau man hinh, sinh khoi ke tiep, thua neu khong con cho de dat
function spawnPiece(piece) {
    currentPiece = piece;
    nextPiece = getRandomPiece();
    pieceRow = 0;
    pieceCol = Math.floor((cols - currentPiece.shape[0].length) / 2);
    pieceCount++;
    rotationLock = level === 4 && pieceCount % 5 === 0;
    if (rotationLock) {
        title.textContent = "Khối này không thể xoay";
    } else if (level === 2 && currentPiece.comboLength === 0) {
        title.textContent = "Khối đặc biệt " + (pieceName[currentPiece.name] || currentPiece.name) + "!";
    } else if (level === 2) {
        title.textContent = "Combo khối " + (pieceName[currentPiece.name] || currentPiece.name) + ": " + currentPiece.comboPos + "/" + currentPiece.comboLength;
    } else {
        title.textContent = "Welcome to Tetris";
    }
    drawNextPiece();
    if (haveBlock(pieceRow, pieceCol)) {
        gameOver = true;
        pauseGame();
        title.textContent = "Game Over";
    }
}

// khoa lv khi dang choi
function setLevelLock(lock) {
    for (let i = 0; i < levelInput.length; i++) {
        levelInput[i].disabled = lock;
    }
}

// chuyen sang lv moi: reset diem lv, dat lai bien cua lv, tao khoi moi
function selectLevel(newLevel) {
    clearObstacle();
    level = Number(newLevel);
    score = 0;
    scoreText.textContent = score;
    totalScoreText.textContent = totalScore;
    levelText.textContent = level;
    pieceCount = 0;
    levelLine = 0;
    lineText.textContent = levelLine + "/" + lvUp;
    garbageLine = garbageStep;
    rotationLock = false;
    comboName = "";
    comboLeft = 0;
    comboTotal = 0;
    if (level === 6) addObstacle();
    spawnPiece(getRandomPiece());
    drawBackground();
}

// co che no bomb 4x4 cua lv5 tinh tu than bomb tro xuong
function explodeBomb() {
    for (let row = pieceRow + 2; row < pieceRow + 6; row++) {
        for (let col = pieceCol; col < pieceCol + 4; col++) {
            if (row >= 0 && row < rows && col >= 0 && col < cols) {
                if (board[row][col] !== 0) {
                    board[row][col] = 0;
                    score += 10;
                }
            }
        }
    }
    scoreText.textContent = score;
    totalScoreText.textContent = totalScore;
}

// qua lv moi khi du so hang cua lv (lvUp); o lv6 thi thang game
function passLevel() {
    pauseGame();

    // chi cong diem lv vao tong diem khi qua man
    totalScore += score;
    totalScoreText.textContent = totalScore;
    if (level === 6) {
        gameOver = true;
        title.textContent = "Bạn đã phá đảo! Tổng điểm: " + totalScore;
        drawBackground();
        return;
    }
    levelInput[level].checked = true;

    // moi lv bat dau voi board sach (khong mang khoi/hang rac sang lv sau)
    clearBoard();
    selectLevel(level + 1);
    if (gameOver) return;
    title.textContent = "Lên Lv" + level + "!";
    gameTime = setInterval(moveDown, fallSpeed[level - 1]);
}

// khoi roi 1 o; neu cham thi luu khoi/no bomb, xoa hang, tinh diem, qua lv, sinh khoi moi
function moveDown() {
    if (!haveBlock(pieceRow + 1, pieceCol)) {
        pieceRow++;
    } else {
        if (currentPiece.name === "Bomb" && level === 5) {
            explodeBomb();
            const lineCount = clearLine();
            updateScore(lineCount);
            if (levelLine >= lvUp) {
                passLevel();
                return;
            }
        } else {
            saveBlock();
            const lineCount = clearLine();
            updateScore(lineCount);
            if (level === 3) {
                while (levelLine >= garbageLine) {
                    addGarbageRow();
                    garbageLine += garbageStep;
                    if (gameOver) {
                        drawBackground();
                        return;
                    }
                }
            }
            if (levelLine >= lvUp) {
                passLevel();
                return;
            }
        }
        spawnPiece(nextPiece);
    }
    drawBackground();
}

// nut bat dau
function startGame() {
    if (gameTime !== null || gameOver) return;
    paused = false;
    stopButton.textContent = "Tạm dừng";
    setLevelLock(true);
    gameTime = setInterval(moveDown, fallSpeed[level - 1]);
}

// nut tam dung
function pauseGame() {
    clearInterval(gameTime);
    gameTime = null;
}

// nut tam dung/tiep tuc: dang choi thi tam dung, dang tam dung thi choi tiep
function togglePause() {
    if (gameOver) return;
    if (gameTime !== null) {
        pauseGame();
        paused = true;
        stopButton.textContent = "Tiếp tục";
    } else if (paused) {
        startGame();
    }
}

// nut choi lai: xoa board, reset diem lv va so hang, giu tong diem
function restartGame() {
    pauseGame();
    clearBoard();
    gameOver = false;
    paused = false;
    stopButton.textContent = "Tạm dừng";
    score = 0;
    scoreText.textContent = score;
    totalScoreText.textContent = totalScore;
    title.textContent = "Welcome to Tetris";
    setLevelLock(false);
    selectLevel(getSelectLevel());
}

// di chuyen khoi qua lai
function movePiece(direction) {
    if (!haveBlock(pieceRow, pieceCol + direction)) {
        pieceCol += direction;
        drawBackground();
    }
}

// xoay khoi 90 do theo chieu kim dong ho
function rotatePiece() {
    if (rotationLock) return;
    const oldShape = currentPiece.shape;
    const oldHeight = oldShape.length;
    const oldWidth = oldShape[0].length;
    const newShape = [];
    for (let i = 0; i < oldWidth; i++) {
        const newRow = [];
        for (let j = 0; j < oldHeight; j++) {
            newRow.push(0);
        }
        newShape.push(newRow);
    }
    for (let row = 0; row < oldHeight; row++) {
        for (let col = 0; col < oldWidth; col++) {
            const newRow = col;
            const newCol = oldHeight - 1 - row;
            newShape[newRow][newCol] = oldShape[row][col];
        }
    }
    currentPiece.shape = newShape;
    if (haveBlock(pieceRow, pieceCol)) {
        currentPiece.shape = oldShape;
    }
    drawBackground();
}

drawGrid();
selectLevel(getSelectLevel());
for (let i = 0; i < levelInput.length; i++) {
    levelInput[i].addEventListener("change", function () {
        selectLevel(this.value);
    });
}

// gan cac nut vao su kien choi game
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", function (event) {
    const arrowKey = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp"
    ];
    let isArrowKey = false;
    for (let i = 0; i < arrowKey.length; i++) {
        if (event.key === arrowKey[i]) {
            isArrowKey = true;
            break;
        }
    }
    if (isArrowKey) {
        event.preventDefault();
    }
    if (gameTime === null || gameOver) return;
    switch (event.key) {
        case "ArrowLeft":
            movePiece(-1);
            break;
        case "ArrowRight":
            movePiece(1);
            break;
        case "ArrowDown":
            moveDown();
            break;
        case "ArrowUp":
            if (!event.repeat) rotatePiece();
            break;
    }
});