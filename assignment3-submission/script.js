const board = document.getElementById("game-board");
const blockTray = document.getElementById("block-tray");
const scoreDisplay = document.getElementById("score");

const BOARD_SIZE = 10;
let boardState = Array(100).fill(0);
let currentBlocks = [];
let score = 0;
let currentDragBlock = null;


const blockShapes = [
  { width: 1, height: 1, shape: [1] },
  { width: 2, height: 1, shape: [1, 1] },
  { width: 3, height: 1, shape: [1, 1, 1] },
  { width: 2, height: 2, shape: [1, 0, 1, 0] },
  { width: 2, height: 2, shape: [1, 1, 0, 1] }
];

const createBoard = () => {
  board.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    board.appendChild(cell);
  }
};

const renderBlocks = () => {
  currentBlocks = [];
  blockTray.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const blockData = blockShapes[Math.floor(Math.random() * blockShapes.length)];
    currentBlocks.push(blockData);

    const { width, height, shape } = blockData;
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.gridTemplateColumns = `repeat(${width}, 20px)`;
    block.style.gridTemplateRows = `repeat(${height}, 20px)`;
    block.draggable = true;

    shape.forEach(val => {
      const cell = document.createElement("div");
      cell.classList.add("block-cell");
      if (!val) cell.style.visibility = "hidden";
      block.appendChild(cell);
    });

    block.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ blockData, index: i }));
      currentDragBlock = { blockData, index: i };
    });

    blockTray.appendChild(block);
  }
};

board.addEventListener("dragover", (e) => {
  e.preventDefault();

  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / BOARD_SIZE));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / BOARD_SIZE));

  highlightDropPreview(x, y);
});

board.addEventListener("dragleave", () => {
  clearDropPreview();
});

document.addEventListener("dragend", () => {
  clearDropPreview();
  currentDragBlock = null;
});

board.addEventListener("drop", (e) => {
  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / BOARD_SIZE));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / BOARD_SIZE));

  const { blockData, index } = JSON.parse(e.dataTransfer.getData("text/plain"));
  const { shape, width, height } = blockData;

  let valid = true;
  let positions = [];

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const shapeIndex = dy * width + dx;
      if (!shape[shapeIndex]) continue;

      const boardX = x + dx;
      const boardY = y + dy;

      if (boardX >= BOARD_SIZE || boardY >= BOARD_SIZE) {
        valid = false;
        break;
      }

      const boardIndex = boardY * BOARD_SIZE + boardX;
      if (boardState[boardIndex] === 1) {
        valid = false;
        break;
      }

      positions.push(boardIndex);
    }
  }

  if (valid) {
    positions.forEach(i => {
      boardState[i] = 1;
      const cell = board.querySelector(`[data-index='${i}']`);
      if (cell) cell.style.backgroundColor = "#ff8800";
    });

    const cleared = clearFullLines();
    score += cleared * 10;
    scoreDisplay.textContent = score;

    currentBlocks[index] = null;
    blockTray.children[index].remove();

    if (currentBlocks.every(b => b === null)) {
      renderBlocks();
      if (checkGameOver()) {
        console.log("Game over!");
      }
    }

    clearDropPreview();
    currentDragBlock = null;
  } else {
    alert("Invalid block placement!");
    clearDropPreview();
    currentDragBlock = null;
  }
});

function clearFullLines() {
  const filledRows = [];
  const filledCols = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    let full = true;
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!boardState[y * BOARD_SIZE + x]) {
        full = false;
        break;
      }
    }
    if (full) filledRows.push(y);
  }

  for (let x = 0; x < BOARD_SIZE; x++) {
    let full = true;
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (!boardState[y * BOARD_SIZE + x]) {
        full = false;
        break;
      }
    }
    if (full) filledCols.push(x);
  }

  filledRows.forEach(y => {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const i = y * BOARD_SIZE + x;
      boardState[i] = 0;
      board.querySelector(`[data-index='${i}']`).style.backgroundColor = "";
    }
  });

  filledCols.forEach(x => {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const i = y * BOARD_SIZE + x;
      boardState[i] = 0;
      board.querySelector(`[data-index='${i}']`).style.backgroundColor = "";
    }
  });

  return filledRows.length + filledCols.length;
}

function checkGameOver() {
  for (const block of currentBlocks) {
    if (!block) continue;

    const { shape, width, height } = block;

    for (let y = 0; y <= BOARD_SIZE - height; y++) {
      for (let x = 0; x <= BOARD_SIZE - width; x++) {
        let fits = true;

        for (let dy = 0; dy < height; dy++) {
          for (let dx = 0; dx < width; dx++) {
            const shapeIndex = dy * width + dx;
            if (!shape[shapeIndex]) continue;

            const boardX = x + dx;
            const boardY = y + dy;
            const boardIndex = boardY * BOARD_SIZE + boardX;

            if (boardState[boardIndex] === 1) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }

        if (fits) return false;
      }
    }
  }

  document.getElementById("game-over").style.display = "block";
  blockTray.innerHTML = "";
  return true;
}

function highlightDropPreview(x, y) {
  if (!currentDragBlock) return;

  const { blockData } = currentDragBlock;
  const { shape, width, height } = blockData;

  let valid = true;
  let positions = [];

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const shapeIndex = dy * width + dx;
      if (!shape[shapeIndex]) continue;

      const boardX = x + dx;
      const boardY = y + dy;

      if (boardX >= BOARD_SIZE || boardY >= BOARD_SIZE) {
        valid = false;
        continue;
      }

      const boardIndex = boardY * BOARD_SIZE + boardX;
      if (boardState[boardIndex]) valid = false;

      positions.push(boardIndex);
    }
  }

  positions.forEach(i => {
    const cell = board.querySelector(`[data-index='${i}']`);
    if (cell) {
      cell.style.backgroundColor = valid ? "#aaffaa" : "#ffaaaa";
    }
  });
}

function clearDropPreview() {
  for (let i = 0; i < 100; i++) {
    if (boardState[i]) continue;
    const cell = board.querySelector(`[data-index='${i}']`);
    if (cell) cell.style.backgroundColor = "";
  }

  for (let i = 0; i < 100; i++) {
    if (boardState[i]) {
      const cell = board.querySelector(`[data-index='${i}']`);
      if (cell) cell.style.backgroundColor = "#ff8800";
    }
  }
}

createBoard();
renderBlocks();
setTimeout(checkGameOver, 100);