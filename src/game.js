const WIDTH = 16;
const HEIGHT = 16;
const BOMBS_COUNT = 40;

function startGame() {
    const cellCount = WIDTH * HEIGHT;
    let bomb_counter = BOMBS_COUNT;
    let timer = 0;
    let bombs = [];
    let firstMove = true;

    const field = document.querySelector('.field');
    const smile = document.querySelector('.game__restart');
    field.innerHTML = '<button class="cell"></button>'.repeat(cellCount);
    const cells = Array.from(field.children);

    smile.addEventListener('mousedown', () => {
        smileChange(smile, 'tapped');
    });
    smile.addEventListener('mouseup', resetGame);

    field.addEventListener('mousedown', onCellDown);
    field.addEventListener('mouseup', onCellUp);
    field.addEventListener('contextmenu', e => e.preventDefault());
    resetGame();

    //TODO добавить обработчики на события mousedown / mouseup,
    // клик на смайл (mousedown / mouseup) и contextmenu на поле

    function onCellDown(e) {
        if (!e.target.classList.contains("cell")) return;
        //TODO запустить таймер

        if (e.button === 0) {
            // e.target.classList.add('cell--open');
        } else if (e.button === 2) {
            e.preventDefault();
            e.target.classList.add('cell--flag');
        }
    }

    function onCellUp(e) {
        if (!e.target.classList.contains("cell")) return;

        if (e.button === 0) {
            let index = cells.indexOf(e.target);
            let cellRow = Math.floor(index / WIDTH);
            let cellColumn = index % WIDTH;
            console.log(index, cellRow, cellColumn)
            if (firstMove) {
                firstMove = false;
                generateBombs(index);
            }

            openCell(cellRow, cellColumn);
        }
    }

    function resetGame() {
        bomb_counter = BOMBS_COUNT;
        timer = 0;
        firstMove = true;
        smileChange(smile, 'default');
        for (let cell of cells) {
            cell.classList = 'cell';
            changeCellImg(cell, 'closed');
        }
    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
        return array;
    }

    function generateBombs(index) {
        bombs = shuffle(Array.from(Array(cellCount).keys())).slice(0, BOMBS_COUNT + 1);
        if (bombs.includes(index)) {
            bombs.splice(bombs.indexOf(index), 1);
        } else {
            bombs.pop();
        }
    }

    function openCell(cellRow, cellColumn) {
        //TODO провека на бомбу, если да, то завершение игры
        if (!isCellExist(cellRow, cellColumn)) return;
        if (isBomb(cellRow, cellColumn)) return;
        let index = cellRow * WIDTH + cellColumn;
        let cell = cells[index];
        if (cell.classList.contains('cell--open')) return;

        let bombCount = getBombCount(cellRow, cellColumn);
        cell.classList.add('cell--open');
        bombCount !== 0 ? changeCellImg(cell, bombCount) : changeCellImg(cell, 'tapped');
        console.log(bombCount);

        if (bombCount === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    openCell(cellRow + i, cellColumn + j);
                }
            }
        }
    }

    function getBombCount(cellRow, cellColumn) {
        let bombCount = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (isBomb(cellRow + i, cellColumn + j)) {
                    bombCount++;
                }
            }
        }
        return bombCount;
    }

    function isBomb(cellRow, cellColumn) {
        if (!isCellExist(cellRow, cellColumn)) return;
        let index = cellRow * WIDTH + cellColumn;
        return bombs.includes(index);

    }

    function isCellExist(cellRow, cellColumn) {
        return cellRow >= 0 && cellRow < HEIGHT && cellColumn >= 0 && cellColumn < WIDTH;
    }

    function finishGame() {
        //TODO Открыть все ячейки, остановить таймер
    }

    function smileChange(smile, icon) {
        smile.style.backgroundImage = `url('./img/smiles/smile_${icon}.png')`;
    }

    function changeCellImg(cell, img) {
        cell.style.backgroundImage = `url('./img/cells/cell_${img}.png')`;
    }

    function changeCounter() {
        //TODO смена картинки на счетчике
    }

    function timerChange() {
        //TODO изменение таймера
    }
}


startGame();