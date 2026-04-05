const presetTemplate = document.querySelector('.preset-template')
const presetList = document.querySelector('#presets-list')
const nameInput = presetList.querySelector('input')
const saveBut = document.querySelector('#save')
const downloadBut = document.querySelector('#download')
const uploadBut = document.querySelector('#upload')
const searchInput = document.querySelector('#search input')

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
        this.isChanging = true
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
            preset.node.classList.add('active');
        })

        preset.node.addEventListener('mouseleave', e => {
            e.preventDefault();
            preset.node.classList.remove('active');
        })

        preset.node.addEventListener('click', onLoadPreset)

        preset.node.querySelector('#delete').addEventListener('click', onDel)

        preset.node.querySelector('#global').addEventListener('click', onGlobal)

        preset.node.querySelector('#rename').addEventListener('click', e => {
            preset.changeName()
        })
    }

    hide() {
        this.node.style.display = 'none'
    }

    show() {
        this.node.style.display = 'flex'
    }

    makeGlobal() {
        let json = {
            type: 'create',
            id: this.id,
            name: this.name,
            json: this.json
        }
        console.log(json)
        fetch('/globalPresets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        }).then(resp => {
            return resp.json()
        }).then(json => {
            console.table(json)
        })
    }

    static loadGlobal(reqName){
        let json = {
            type: 'load',
            requiredName: reqName
        }
        fetch('/globalPresets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        }).then(resp => {
            return resp.json()
        }).then(json => {
            console.table(json)
        })
    }

    static loadFromJSON(json) {
        let clone = presetTemplate.content.cloneNode(true)
        let presetElement = clone.firstElementChild
        new Preset(presetElement, json.json, json.id, json.name, json.isGlobal)
    }

    static findPresets(substr) {
        substr = substr.toLowerCase()

        // Экранируем спецсимволы HTML в строке поиска
        const escapedSubstr = escapeHtml(substr)

        Object.keys(Preset.allInstance).forEach(key => {
            let preset = Preset.allInstance[key]
            let name = preset.name
            let nameLower = name.toLowerCase()

            if (nameLower.includes(substr)) {
                preset.show()
                let span = preset.node.querySelector('span')
                let index = nameLower.indexOf(substr)
                if (index != -1) {

                    let before = name.slice(0, index)
                    let match = name.slice(index, index + substr.length)
                    let after = name.slice(index + substr.length)

                    let safeHtml = escapeHtml(before) +
                        '<b>' + escapeHtml(match) + '</b>' +
                        escapeHtml(after)

                    span.innerHTML = safeHtml
                } else {
                    span.textContent = name
                }
            }
            else {
                preset.hide()
                preset.node.querySelector('span').textContent = preset.name
            }
        });
    }

}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

Object.keys(localStorage).forEach(key => {
    Preset.loadFromJSON(JSON.parse(localStorage.getItem(key)))
})

saveBut.addEventListener('click', () => {
    let clone = presetTemplate.content.cloneNode(true);
    let presetElement = clone.firstElementChild;

    new Preset(presetElement, JSON.stringify(window.preset))
})

searchInput.addEventListener('input', e => {
    Preset.findPresets(e.target.value)
})

