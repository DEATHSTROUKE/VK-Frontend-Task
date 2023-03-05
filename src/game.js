'use strict';

function startGame() {
    // Задание переменных для игры
    const cellCount = WIDTH * HEIGHT; // Число ячеек
    let flagCount = BOMBS_COUNT; // Количество флагов
    let closedCellsCount = WIDTH * HEIGHT - BOMBS_COUNT; // Количество оставшихся закрытых ячеек
    let timer = 0; // Время на таймере в секундах
    let timerElem = null; // Ссылка на setInterval
    let bombs = []; // Массив с минами
    let firstMove = true; // Флаг первого хода
    let stateField = []; // Массив состояний клеток поля
    let finishStatus = null; // Статус окончания игры ('win', 'lose', null)
    let isClick = false; // Флаг нажатия
    let timeStampCellDownEvent; // Метка нажатия на кнопку (для регистрации долгого нажатия)

    // Получение элементов из DOM
    const field = document.querySelector('.field');
    const smile = document.querySelector('.game__restart');

    field.innerHTML = '<div class="cell"></div>'.repeat(cellCount); // Создание клеток поля
    const cells = Array.from(field.children); // Массив клеток поля

    const counterItems = Array.from(document.querySelector('.counter').children);
    const timerItems = Array.from(document.querySelector('.timer').children);

    // Предзагрузка изображений для оптимизации
    const imgs = [...IMAGES.map(el => new Image().src = el)]

    // Регистрация игровых событий
    smile.addEventListener('mousedown', () => updateSmile('tapped'));
    smile.addEventListener('mouseout', () =>
        updateSmile(finishStatus ?? 'default'));
    smile.addEventListener('mouseup', resetGame); // Перезапуск игры

    field.addEventListener('mousedown', e => onCellDown(e, false));
    field.addEventListener('mouseup', e => onCellUp(e, false));
    field.addEventListener('contextmenu', e => e.preventDefault());
    // Эффект ведения по клеткам при зажатой мыши
    cells.forEach(el => {
        // Клетка на которую перешли становится 'tapped', а с которой - 'closed'
        el.addEventListener('mouseover', e =>
            onCellOver(e, 'closed', 'tapped'));

        el.addEventListener('mouseout', e => {
            onCellOver(e, 'tapped', 'closed');
            // Если курсор вышел за границу поля
            if (!cells.includes(e.relatedTarget)) {
                updateSmile(finishStatus ?? 'default');
                isClick = false;
            }
        });
    });

    // Для поддержки мобильных устройств
    field.addEventListener('dblclick', e => e.preventDefault());
    field.addEventListener("touchstart", e => onCellDown(e, true));
    field.addEventListener("touchend", e => onCellUp(e, true));

    resetGame();

    function onCellOver(e, changeFrom, changeTo) {
        // Функция для события перемещения мыши
        if (isClick) {
            // Эффект работает только при клике
            let indexTarget = cells.indexOf(e.target);
            if (stateField[indexTarget] === changeFrom) {
                stateField[indexTarget] = changeTo;
                updateCellImg(e.target, changeTo);
            }
        }
    }

    function onCellDown(e, isMobile) {
        // Функция для события нажатия мыши

        //Если нажали не на клетку или игра закончилась
        if (!e.target.classList.contains("cell") || finishStatus) return;
        updateSmile('scared');

        if (isMobile) {
            // Записываем метку нажития для мобильных устройств
            timeStampCellDownEvent = e.timeStamp;
            return;
        }

        isClick = true; // Фиксируем клик
        let index = cells.indexOf(e.target); // Получаем индекс клетки и ее саму
        let cell = cells[index];

        if (e.button === 0) {
            //Нажатие левой кнопки мыши
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
        // Функция для события отпускания мыши

        //Если нажали не на клетку или игра закончилась или
        if (!e.target.classList.contains("cell") || finishStatus || (!isMobile && e.buttons !== 0)) return;
        updateSmile('default');

        isClick = false;
        let index = cells.indexOf(e.target); // Получаем необходимые параметры
        let cell = cells[index]
        let cellRow = Math.floor(index / WIDTH);
        let cellColumn = index % WIDTH;

        if (e.button === 0) {

            //Нажатие левой кнопки мыши
            if (firstMove) {
                // Если первый ход, то генерирум поле и запускаем таймер
                firstMove = false;
                generateBombs(index);
                timerElem = setInterval(() => {
                    timer++;
                    updateTimer(timer);
                }, 1000);
            }

            openCell(cellRow, cellColumn); // Открытие клетки
        } else if (e.button === 2 || (isMobile && e.timeStamp -
            timeStampCellDownEvent >= 300)) {

            //Нажатие левой кнопки мыши
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
        // Функция перезапуска игры
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

        // Закрытие клеток
        for (let cell of cells) {
            updateCellImg(cell, 'closed');
        }
    }

    function shuffle(array) {
        // Перемешивание массива
        array.sort(() => Math.random() - 0.5);
        return array;
    }

    function generateBombs(index) {
        // Генерация мин на поле (генерируем на 1 больше)
        bombs = shuffle(Array.from(Array(cellCount).keys())).slice(0, BOMBS_COUNT + 1);
        if (bombs.includes(index)) {
            // Если кликнули на поле с миной, то убираем ее из массива
            bombs.splice(bombs.indexOf(index), 1);
        } else {
            // Иначе удаляем последнюю мину из массива
            bombs.pop();
        }
    }

    function openCell(cellRow, cellColumn) {
        // Рекурсивная функция раскрытия клеток
        if (!isCellExist(cellRow, cellColumn)) return;

        let index = cellRow * WIDTH + cellColumn;
        let cell = cells[index];

        // Попытка открыть флаг или открытую клетку
        if (stateField[index] === 'opened' || stateField[index] === 'flag') return;

        if (isBomb(cellRow, cellColumn)) {
            // Проигрыш, нажата мина
            stateField[index] = 'boom';
            finishGame('lose');
            return;
        }

        // Подсчет мин и изменение состояния клетки
        let bombCount = getBombCount(cellRow, cellColumn);
        stateField[index] = 'opened'
        bombCount !== 0 ? updateCellImg(cell, bombCount) : updateCellImg(cell, 'tapped');
        closedCellsCount--;

        if (closedCellsCount === 0) {
            // Победа, если все пустые клетки открыты
            finishGame('win');
        }

        if (bombCount === 0) {
            // Рекурсивное открытие, если мин поблизости нет
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    openCell(cellRow + i, cellColumn + j);
                }
            }
        }
    }

    function getBombCount(cellRow, cellColumn) {
        // Получение количества мин поблизости
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
        // Проверка на наличие мины по координатам
        if (!isCellExist(cellRow, cellColumn)) return;
        let index = cellRow * WIDTH + cellColumn;
        return bombs.includes(index);

    }

    function isCellExist(cellRow, cellColumn) {
        // Проверка корректности координат клетки
        return cellRow >= 0 && cellRow < HEIGHT && cellColumn >= 0 && cellColumn < WIDTH;
    }

    function finishGame(status) {
        // Функция для завершения игры
        clearInterval(timerElem);
        finishStatus = status;
        updateSmile(status);

        // Раскрытие поля
        for (let i = 0; i < cellCount; i++) {
            if (stateField[i] === 'boom') {
                // Поле с взорванной миной
                updateCellImg(cells[i], 'bomb_dead');
            } else if ((stateField[i] === 'closed' || stateField[i] === 'question') &&
                bombs.includes(i)) {
                // Поле с закрытой миной
                updateCellImg(cells[i], 'bomb');
            } else if (stateField[i] === 'flag' && !bombs.includes(i)) {
                // Поле с неправильно отмеченной миной
                updateCellImg(cells[i], 'bomb_wrong');
            }
        }
    }

    function updateSmile(icon) {
        // Обновление кнопки со смайликом
        smile.style.backgroundImage = `url('./img/smiles/smile_${icon}.png')`;
    }

    function updateCellImg(cell, img) {
        // Обновление клетки поля
        cell.style.backgroundImage = `url('./img/cells/cell_${img}.png')`;
    }

    function updateCounter(count) {
        // Обновление счетчика мин
        count = Math.max(count, 0).toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            updateNumberElement(counterItems[i], count[i]);
        }
    }

    function updateTimer(count) {
        // Обновление таймера
        count = Math.min(count, 999).toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            updateNumberElement(timerItems[i], count[i]);
        }
    }

    function updateNumberElement(elem, num) {
        // Обновление цифры
        elem.style.backgroundImage = `url('./img/numbers/number_${num}.png')`;
    }
}


startGame();