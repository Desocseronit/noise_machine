window.preset = {} // {...soundName: volume} 

class soundCell {
    static allInstance = [];
    _name;
    _node;
    _volume;
    _audioNode;
    _isPlaying = false;
    isChanging = false;

    get name() {
        return this._name
    }
    get node() {
        return this._node
    }
    get volume() {
        return this._volume
    }
    get audioNode() {
        return this._audioNode
    }

    constructor(name, node) {
        this._name = name
        this._node = node
        this._audioNode = node.querySelector('audio')
        this._volume = 0.5
        soundCell.allInstance.push(this)
        soundCell.setVolumeHandler(this)
        soundCell.setClickHandler(this)
    }

    set volume(vol) {
        let formatedVol = 0
        if (vol > 0 && vol < 100) {
            formatedVol = 1 - (vol * 0.01)
        }
        else if (vol == 0) {
            formatedVol = 1
            vol = 1
        }
        else if (vol == 1) {
            formatedVol = 0
            vol = 1
        }

        window.preset[this.name] = formatedVol

        this._volume = formatedVol
        this.node.dataset.volume = formatedVol
        this.audioNode.volume = formatedVol
        this.node.querySelector('audio').volume = formatedVol
        this.node.querySelector('.mask').style.clipPath = `inset(0 0 ${100 - vol}% 0)`
        this.node.querySelector('.volume-slider').style.top = `${vol}%`
        console.log(window.preset)
    }

    set masterVolume(deltaPercent) {
        let delta = deltaPercent * 0.01;
        let newVol = Math.max(0, Math.min(1, this.volume + delta));

        this._volume = newVol;
        this.audioNode.volume = newVol;
        window.preset[this.name] = newVol;
        this.node.dataset.volume = newVol;

        let topPercent = (1 - newVol) * 100;

        this.node.querySelector('.volume-slider').style.top = `${topPercent}%`;
        this.node.querySelector('.mask').style.clipPath = `inset(0 0 ${100 - topPercent}% 0)`;
        console.log(window.preset)
    }

    get isPlaying() {
        return this._isPlaying
    }

    set isPlaying(state) {
        this._isPlaying = state === true || state === false ? state : td._isPlaying
        if (this._isPlaying) {
            this.node.classList.add('active')
            this.volume = 50
            this.audioNode.play()
            this.changeSlider('show')
            this.changeSlider('hide')
        }
        else {
            this.node.classList.remove('active')
            this.audioNode.pause()
            this.changeSlider('exit')
            delete window.preset[this.name]
        }
    }

    static setVolumeHandler(td) {
        let slider = td.node.querySelector('.volume-slider')

        function changeVol(e) {
            let containerRect = td.node.getBoundingClientRect();
            let percent = ((e.clientY - containerRect.top) / containerRect.height) * 100;
            percent = Math.max(0, Math.min(100, percent));
            td.volume = percent;
        }

        slider.addEventListener('mousedown', e => {
            e.stopPropagation();
            td.isChanging = true;
            changeVol(e);

            const onMouseMove = (moveEvent) => {
                if (td.isChanging) changeVol(moveEvent);
                td.changeSlider('show')
            };

            const onMouseUp = () => {
                td.isChanging = false;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        td.node.addEventListener('mouseenter', e => {
            if (td.isPlaying) td.changeSlider('show')
        })

        td.node.addEventListener('mouseleave', e => {
            td.changeSlider('hide')
        })
    }

    static setClickHandler(td) {
        td.node.addEventListener('mousedown', e => {
            td.isPlaying = window.nowPlay.includes(td.node)
        })
    }

    changeSlider(mode) {
        let slider = this.node.querySelector('.volume-slider')
        if (mode == 'show') {
            slider.style.display = 'block';
            slider.style.opacity = '1';
        }
        else if (mode == 'hide') {
            slider.style.opacity = '0';
            setTimeout(() => {
                if (slider.style.opacity == '0') {
                    slider.style.display = 'none';
                }
            }, 1000);
        }
        else if (mode == 'exit') {
            slider.style.top = '50%'
            slider.style.display = 'none';
            slider.style.opacity = '0';
        }
    }

    static loadFromJSON(json) {
        json = JSON.parse(json)
        console.log(json)
        soundCell.allInstance.forEach(instance => {
            instance.isPlaying = false
        })
        for (let [name, volume] of Object.entries(json)) {
            let target = soundCell.allInstance.find(instance => instance.name == name)
            if (target) {
                target.isPlaying = true
                target.volume = 100 - (volume * 100)
            }
        }
    }
}

document.querySelectorAll('#sounds td').forEach(e => {
    new soundCell(e.id, e)
})


