// по нажатию сохранить появляется ярлык присета и пользоваетль там сразу задает имя (после можно удалить (  при удалении глобального , удаление из локалки, но остается в бд)), сделать глобальным (загрузка в бд) , включить (просто клик))
// открытие инструментов с помощью правой кнопки мыши (поялвяются ниже присета)
// скрываются как только мышь ливнет
// у глобальных и локальных разные стили
// поменять с датасетов на локалстор
const presetTemplate = document.querySelector('.preset-template')
const presetList = document.querySelector('#presets-list')
const nameInput = presetList.querySelector('input')
const saveBut = document.querySelector('#save')
const downloadBut = document.querySelector('#download')
const uploadBut = document.querySelector('#upload')

saveBut.addEventListener('click', () => {
    let clone = presetTemplate.content.cloneNode(true);
    let presetElement = clone.firstElementChild;

    setPresetEvents(presetElement);
    presetElement.dataset.JSON = JSON.stringify(window.preset)
    presetList.appendChild(presetElement);

    nameInput.value = "";
    nameInput.focus();
});

function setPresetEvents(preset) {
    const span = preset.querySelector('span');
    const delBut = preset.querySelector('#delete');
    const renameBut = preset.querySelector('#rename');
    const globalBut = preset.querySelector('#global');
    
    let isChanging = false; // Добавляем флаг для отслеживания режима изменения

    preset.classList.add('changing')
    isChanging = true;

    const onInput = (e) => {
        span.textContent = e.target.value
        preset.classList.add('changing')
        isChanging = true;
    }

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            nameInput.blur();
        }
    }

    const onBlur = (e) => {
        e.stopPropagation()
        nameInput.removeEventListener('input', onInput);
        nameInput.removeEventListener('keydown', onKeyDown);
        nameInput.removeEventListener('blur', onBlur);
        preset.classList.remove('changing')
        isChanging = false; // Выходим из режима изменения
        span.textContent = e.target.value;
        if (span.textContent.trim() == "") {
            span.textContent = "Unnamed Preset";
        }
        e.target.value = ''
    }

    const onDel = (e) => {
        e.stopPropagation();
        let dialog = preset.querySelector('#on-delete')
        dialog.show()
        dialog.style.display = 'flex'
        dialog.querySelector('#yes').addEventListener('click', e => {
            preset.remove()
        })
        dialog.querySelector('#no').addEventListener('click', e => {
            dialog.style.removeProperty('display')
            dialog.close()
        })
    }

    const onGlobal = (e) => {
        e.stopPropagation();
        if (!preset.classList.contains('global')) {
            let dialog = preset.querySelector('#on-global')
            dialog.show()
            dialog.style.display = 'flex'
            dialog.querySelector('#yes').addEventListener('click', e => {
                preset.classList.add('global')
                dialog.style.removeProperty('display')
                dialog.close()
            })
            dialog.querySelector('#no').addEventListener('click', e => {
                dialog.style.removeProperty('display')
                dialog.close()
            })
        }
    }

    const onLoadPreset = (e) => {
        // Проверяем оба условия: класс changing И флаг isChanging
        if (isChanging || preset.classList.contains('changing')) {
            console.log('Preset is in changing mode, skipping load');
            return;
        }
        console.log('Loading preset');
        if (window.soundCell && window.soundCell.loadFromJSON) {
            window.soundCell.loadFromJSON(preset.dataset.JSON);
        }
    }

    nameInput.addEventListener('input', onInput);
    nameInput.addEventListener('keydown', onKeyDown);
    nameInput.addEventListener('blur', onBlur)

    preset.addEventListener('contextmenu', e => {
        e.preventDefault();
        preset.classList.toggle('active');
    });

    delBut.addEventListener('click', onDel)
    globalBut.addEventListener('click', onGlobal)

    renameBut.addEventListener('click', e => {
        e.stopPropagation();
        span.textContent = '';
        nameInput.focus();
        preset.classList.add('changing')
        isChanging = true; // Включаем режим изменения
        nameInput.removeEventListener('input', onInput);
        nameInput.removeEventListener('keydown', onKeyDown);
        nameInput.removeEventListener('blur', onBlur);

        nameInput.addEventListener('input', onInput);
        nameInput.addEventListener('keydown', onKeyDown);
        nameInput.addEventListener('blur', onBlur);
    })

    preset.addEventListener('click', onLoadPreset)
}