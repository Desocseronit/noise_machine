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

class Preset {
    static allInstance = []
    _name;
    _json;
    _node;
    _isGlobal = false;
    isChanging = false;

    get json() {
        return this._json
    }

    get node() {
        return this._node
    }

    get isGlobal() {
        return this._isGlobal
    }

    get name() {
        return this._name
    }

    set isGlobal(newVal) {
        if (!this.isGlobal && newVal) {
            this._isGlobal = newVal
            this.node.classList.add('global')
        }
    }

    set name(name) {
        name = name.trim() == '' ? 'Untitled preset' : name.trim()
        this._name = name
        this.node.querySelector('span').textContent = name
    }

    constructor(node, json) {
        this._node = node
        this._json = json
        this.node.dataset.JSON = json
        presetList.appendChild(node)
        this.changeName()

        Preset.setControlHandler(this)
        Preset.allInstance.push(this)
    }

    changeName() {
        nameInput.focus()
        nameInput.value = ''
        this.node.classList.add('changing')

        const stopChange = () => {
            nameInput.removeEventListener('input', onInput);
            nameInput.removeEventListener('keydown', onKeyDown);
            nameInput.removeEventListener('blur', onBlur);
            nameInput.blur()
            this.node.classList.remove('changing')
            this.isChanging = false
            this.name = nameInput.value
            nameInput.value = ''
        }

        const onInput = (e) => {
            this.name = e.target.value
        }

        const onKeyDown = (e) => {
            if (e.key == 'Enter') {
                stopChange()
            }
        }

        const onBlur = (e) => {
            stopChange()
        }

        nameInput.addEventListener('input', onInput)
        nameInput.addEventListener('keydown', onKeyDown)
        nameInput.addEventListener('blur', onBlur)
    }

    delete() {
        this.node.remove()
        Preset.allInstance.splice(Preset.allInstance.findIndex(item => item == this), 1)
    }

    static setControlHandler(preset) {
        const onDel = (e) => {
            e.stopPropagation();
            let dialog = preset.node.querySelector('#on-delete')
            dialog.show()
            dialog.style.display = 'flex'
            dialog.querySelector('#yes').addEventListener('click', e => {
                e.stopPropagation();
                preset.delete()
            })
            dialog.querySelector('#no').addEventListener('click', e => {
                e.stopPropagation();
                dialog.style.removeProperty('display')
                dialog.close()
            })
        }

        const onGlobal = (e) => {
            e.stopPropagation();
            if (!preset.node.classList.contains('global')) {
                let dialog = preset.node.querySelector('#on-global')
                dialog.show()
                dialog.style.display = 'flex'
                dialog.querySelector('#yes').addEventListener('click', e => {
                    e.stopPropagation()
                    preset.isGlobal = true
                    dialog.style.removeProperty('display')
                    dialog.close()
                })
                dialog.querySelector('#no').addEventListener('click', e => {
                    e.stopPropagation()
                    dialog.style.removeProperty('display')
                    dialog.close()
                })
            }
        }

        const onLoadPreset = (e) => {
            if (preset.node.classList.contains('changing')) {
                return;
            }
            soundCell.loadFromJSON(preset.json);
        }

        preset.node.addEventListener('contextmenu', e => {
            e.preventDefault();
            preset.node.classList.toggle('active');
        })

        preset.node.addEventListener('click' , onLoadPreset)

        preset.node.querySelector('#delete').addEventListener('click' , onDel)

        preset.node.querySelector('#global').addEventListener('click' , onGlobal)

        preset.node.querySelector('#rename').addEventListener('click' , e => {
            preset.changeName()
        })
    }

}

saveBut.addEventListener('click', () => {
    let clone = presetTemplate.content.cloneNode(true);
    let presetElement = clone.firstElementChild;

    new Preset(presetElement, JSON.stringify(window.preset))
});