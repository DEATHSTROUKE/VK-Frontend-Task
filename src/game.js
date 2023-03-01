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
    const cells = field.children

    smile.addEventListener('mousedown', () => smileChange(smile, 'tapped'))
    smile.addEventListener('mouseup', resetGame)
    field.addEventListener('mousedown', onFieldClick);
    field.addEventListener('contextmenu', () => {
    });
    resetGame();

    //TODO добавить обработчики на события mousedown / mouseup,
    // клик на смайл (mousedown / mouseup) и contextmenu на поле

    function onFieldClick(e) {
        //TODO проверка на то что кликнули по ячейке
        e.target.classList.add('cell--open')
    }

    function resetGame() {
        bomb_counter = BOMBS_COUNT;
        timer = 0;
        bombs = shuffle(Array.from(Array(cellCount).keys())).slice(0, BOMBS_COUNT);
        smileChange(smile, 'default');
        for (let cell of cells) {
            cell.classList = 'cell';
        }
        //TODO Закрыть все ячейки и поставить дефолтный смайл
    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
        return array
    }

    function generateField() {
        //TODO cгенерировать массив с бомбами
    }

    function timerChange() {
        //TODO изменение таймера
    }

    function smileChange(smile, icon) {
        smile.style.backgroundImage = `url('./img/smiles/smile_${icon}.png')`;
        //TODO иземенение смайла
    }

    function openCell() {
        //TODO открыть ячейку + делать это рекурсивно
    }

    function isBomb() {
    }

    function isCellExist() {
    }

    function changeCounter() {
        //TODO смена картинки на счетчике
    }

    function changeCellImg() {
        //TODO Поменять картинку клетки в зависимости от количества ячеек
    }

    function getBombCount() {
        //TODO найти количество бомб поблизости
    }

    function putMark() {
        //TODO в зависимости от класса установить метку
    }

    function finishGame() {
        //TODO Открыть все ячейки, остановить таймер
    }
}


startGame()