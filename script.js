
const rows = 20;
const cols = 10;

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

// Khối I: thanh dài
const shapeI = [
    [1, 1, 1, 1]
];

// Khối O: hình vuông
const shapeO = [
    [1, 1],
    [1, 1]
];

// Khối T
const shapeT = [
    [0, 1, 0],
    [1, 1, 1]
];

// Khối S
const shapeS = [
    [0, 1, 1],
    [1, 1, 0]
];

// Khối Z
const shapeZ = [
    [1, 1, 0],
    [0, 1, 1]
];

// Khối J
const shapeJ = [
    [1, 0, 0],
    [1, 1, 1]
];

// Khối L
const shapeL = [
    [0, 0, 1],
    [1, 1, 1]
];

