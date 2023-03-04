'use strict';

function startGame() {
    const cellCount = WIDTH * HEIGHT;
    let flagCount = BOMBS_COUNT;
    let closedCellsCount = WIDTH * HEIGHT - BOMBS_COUNT;
    let timer = 0;
    let timerElem = null;
    let bombs = [];
    let firstMove = true;
    let stateField = [];
    let finishStatus = null;
    let isClick = false;
    let timeStampCellDownEvent;

    const field = document.querySelector('.field');
    const smile = document.querySelector('.game__restart');
    field.innerHTML = '<div class="cell"></div>'.repeat(cellCount);
    const cells = Array.from(field.children);
    const counterItems = Array.from(document.querySelector('.counter').children);
    const timerItems = Array.from(document.querySelector('.timer').children);
    const imgs = [...IMAGES.map(el => new Image().src = el)] //preload images

    smile.addEventListener('mousedown', () => updateSmile('tapped'));
    smile.addEventListener('mouseout', () =>
        updateSmile(finishStatus ?? 'default'));
    smile.addEventListener('mouseup', resetGame);

    field.addEventListener('mousedown', e => onCellDown(e, false));
    field.addEventListener('mouseup', e => onCellUp(e, false));
    field.addEventListener('contextmenu', e => e.preventDefault());
    field.addEventListener('dblclick', e => e.preventDefault());
    field.addEventListener("touchstart", e => onCellDown(e, true));
    field.addEventListener("touchend", e => onCellUp(e, true));
    cells.forEach(el => {
        el.addEventListener('mouseover', e =>
            onCellOver(e, 'closed', 'tapped'));

        el.addEventListener('mouseout', e =>
            onCellOver(e, 'tapped', 'closed'));
    });
    resetGame();

    function onCellOver(e, changeFrom, changeTo) {
        if (isClick) {
            let indexTarget = cells.indexOf(e.target);
            if (stateField[indexTarget] === changeFrom) {
                stateField[indexTarget] = changeTo;
                updateCellImg(e.target, changeTo);
            }
        }
    }

    function onCellDown(e, isMobile) {
        if (!e.target.classList.contains("cell") || finishStatus) return;
        updateSmile('scared');
        if (isMobile) {
            timeStampCellDownEvent = e.timeStamp;
            return;
        }
        isClick = true;
        let index = cells.indexOf(e.target);
        let cell = cells[index];
        if (e.button === 0) {
            console.log(stateField[index])
            if (stateField[index] === 'closed') {
                stateField[index] = 'tapped';
                updateCellImg(cell, 'tapped');
            } else if (stateField[index] === 'question') {
                stateField[index] = 'tapped';
                updateCellImg(cell, 'question_tapped');
            }
        }
    }

    function onCellUp(e, isMobile) {
        if (!e.target.classList.contains("cell") || finishStatus || e.buttons !== 0) return;
        updateSmile('default');
        isClick = false;
        let index = cells.indexOf(e.target);
        let cell = cells[index]
        let cellRow = Math.floor(index / WIDTH);
        let cellColumn = index % WIDTH;
        if (e.button === 0) {
            if (firstMove) {
                firstMove = false;
                generateBombs(index);
                timerElem = setInterval(() => {
                    timer++;
                    updateTimer(timer);
                }, 1000);
            }

            openCell(cellRow, cellColumn);
        } else if (e.button === 2 || (isMobile && e.timeStamp - timeStampCellDownEvent >= 300)) {
            console.log(stateField[index])
            e.preventDefault();
            if (stateField[index] === 'closed') {
                stateField[index] = 'flag';
                updateCellImg(cell, 'flag');
                flagCount--;
                updateCounter(flagCount);
            } else if (stateField[index] === 'flag') {
                stateField[index] = 'question';
                updateCellImg(cell, 'question');
                flagCount++;
                updateCounter(flagCount);
            } else if (stateField[index] === 'question') {
                stateField[index] = 'closed';
                updateCellImg(cell, 'closed');
            }
        }
    }

    function resetGame() {
        clearInterval(timerElem);
        updateTimer(0);
        flagCount = BOMBS_COUNT;
        closedCellsCount = WIDTH * HEIGHT - BOMBS_COUNT;
        timer = 0;
        firstMove = true;
        finishStatus = null;
        isClick = false;
        stateField = Array(cellCount).fill('closed');
        updateSmile('default');
        updateCounter(flagCount);
        for (let cell of cells) {
            updateCellImg(cell, 'closed');
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
        if (!isCellExist(cellRow, cellColumn)) return;
        let index = cellRow * WIDTH + cellColumn;
        let cell = cells[index];
        if (stateField[index] === 'opened' || stateField[index] === 'flag') return;
        if (isBomb(cellRow, cellColumn)) {
            stateField[index] = 'boom';
            finishGame('lose');
            return;
        }

        let bombCount = getBombCount(cellRow, cellColumn);
        stateField[index] = 'opened'
        bombCount !== 0 ? updateCellImg(cell, bombCount) : updateCellImg(cell, 'tapped');
        closedCellsCount--;
        if (closedCellsCount === 0) {
            finishGame('win');
        }

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

    function finishGame(status) {
        clearInterval(timerElem);
        finishStatus = status;
        updateSmile(status);
        for (let i = 0; i < cellCount; i++) {
            if (stateField[i] === 'boom') {
                updateCellImg(cells[i], 'bomb_dead');
            } else if ((stateField[i] === 'closed' || stateField[i] === 'question') &&
                bombs.includes(i)) {
                updateCellImg(cells[i], 'bomb');
            } else if (stateField[i] === 'flag' && !bombs.includes(i)) {
                updateCellImg(cells[i], 'bomb_wrong');
            }
        }
    }

    function updateSmile(icon) {
        smile.style.backgroundImage = `url('./img/smiles/smile_${icon}.png')`;
    }

    function updateCellImg(cell, img) {
        cell.style.backgroundImage = `url('./img/cells/cell_${img}.png')`;
    }

    function updateCounter(count) {
        count = Math.max(count, 0).toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            updateNumberElement(counterItems[i], count[i]);
        }
    }

    function updateTimer(count) {
        count = Math.min(count, 999).toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            updateNumberElement(timerItems[i], count[i]);
        }
    }

    function updateNumberElement(elem, num) {
        elem.style.backgroundImage = `url('./img/numbers/number_${num}.png')`;
    }
}


startGame();