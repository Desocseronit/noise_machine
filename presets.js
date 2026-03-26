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
    static allInstance = {}
    _id;
    _name = 'Unnamed';
    _json;
    _node;
    _isGlobal = false;
    isChanging = false;

    get id() {
        return this._id
    }

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
            let newPreset = JSON.parse(localStorage.getItem(this.id))
            newPreset.isGlobal = newVal
            localStorage.setItem(this.id, JSON.stringify(newPreset))
        }
    }

    set name(newName) {
        newName = newName.trim() == '' ? 'Untitled preset' : newName.trim()
        this._name = newName
        this.node.querySelector('span').textContent = newName
        Preset.allInstance[this.id]._name = newName

        let newPreset = JSON.parse(localStorage.getItem(this.id))
        newPreset.name = newName
        localStorage.setItem(this.id, JSON.stringify(newPreset))
    }

    constructor(node, json, id = null, name = null, isGlobal = null) {
        
        this._id = id ?? `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        this._node = node
        this._json = json
        this.isGlobal = isGlobal

        this.node.dataset.JSON = json

        Preset.allInstance[this.id] = this

        presetList.appendChild(node)

        if (id == null && name == null && isGlobal == null) {
            this.saveIntoLocalStorage()
        }
        console.log(this)
        if (name != null) {
            this.name = name;
        }
        else {
            this.changeName()
        }

        Preset.setControlHandler(this)
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
        delete Preset.allInstance[this.id]
        localStorage.removeItem(this.id)
    }

    saveIntoLocalStorage() {
        let json = {
            id: this.id,
            name: this.name,
            json: this.json,
            isGlobal: this.isGlobal
        }
        localStorage.setItem(this.id, JSON.stringify(json))
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
            preset.isChanging = true
            preset.node.classList.toggle('active');
        })

        preset.node.addEventListener('click', onLoadPreset)

        preset.node.querySelector('#delete').addEventListener('click', onDel)

        preset.node.querySelector('#global').addEventListener('click', onGlobal)

        preset.node.querySelector('#rename').addEventListener('click', e => {
            preset.changeName()
        })
    }

    static loadFromLocalStorage() {
        Object.keys(localStorage).forEach(key => {
            let preset = JSON.parse(localStorage.getItem(key))
            let clone = presetTemplate.content.cloneNode(true)
            let presetElement = clone.firstElementChild
            new Preset(presetElement, preset.json, preset.id, preset.name, preset.isGlobal)
        })
    }

}

Preset.loadFromLocalStorage()

saveBut.addEventListener('click', () => {
    let clone = presetTemplate.content.cloneNode(true);
    let presetElement = clone.firstElementChild;

    new Preset(presetElement, JSON.stringify(window.preset))
});