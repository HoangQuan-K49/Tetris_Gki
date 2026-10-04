const rows = 20;
const cols = 10;

let pieceRow = 0;
let pieceCol = 4;

const panel = [];

for (let row = 0; row < rows; row++) {
    panel[row] = [];

    for (let col = 0; col < cols; col++) {
        panel[row][col] = 0;
    }
}
const playField = document.getElementById("playfield");

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        playField.appendChild(cell);
    }
}
const pieces = [
    {name: "I", shape: shapeI},
    {name: "O", shape: shapeO},
    {name: "T", shape: shapeT},
    {name: "S", shape: shapeS},
    {name: "Z", shape: shapeZ},
    {name: "J", shape: shapeJ},
    {name: "L", shape: shapeL}
];
const square = [
    [1, 1],
    [1, 1]
];

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

function draw() {
    const cells = playField.children;
    for (let i = 0; i < cells.length; i++) {
        cells[i].className = "cell";
    }
    for (let row = 0; row < square.length; row++) {
        for (let col = 0; col < square[row].length; col++) {
            if (square[row][col] === 1) {
                const index = (pieceRow + row) * col + (pieceCol + col);
                cells[index].classList.add("O");
            }
        }
    }
}

draw();

setInterval(function () {
    pieceRow ++;
    draw();
}, 1000);


