//presets panel
const presets = document.getElementById('presets');
const arrowLabel = document.querySelector('#presets-arrow i');
arrowLabel.addEventListener('click', e => {
    arrowLabel.className = arrowLabel.className == 'fa-solid fa-caret-right' ? 'fa-solid fa-caret-left' : 'fa-solid fa-caret-right';
    presets.classList.toggle('collapsed');
    presets.classList.toggle('open');
    presets.querySelectorAll('.preset').forEach(preset => preset.classList.remove('active'))
});

//play/pause
const playButt = document.querySelector('#play');
window.isPause = true
playButt.addEventListener('click', e => {
    playButt.className = playButt.className == 'fa-solid fa-play' ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    window.isPause = window.isPause == true ? window.isPause = false : window.isPause = true
    console.log(window.isPause)
    if (window.isPause) {
        for (let i = 0; i < soundCell.allInstance.length; i++) {
            soundCell.allInstance[i].node.querySelector('audio').pause()
        }
    }
    else {
        for (let i = 0; i < soundCell.allInstance.length; i++) {
            if (soundCell.allInstance[i].isPlaying) {
                soundCell.allInstance[i].node.querySelector('audio').play()
            }
        }
    }
});


window.nowPlay = []
// icon
document.querySelectorAll('#sounds td').forEach(cell => {
    cell.addEventListener('mousedown', e => {
        target = e.target.closest('td')
        if (target.classList.contains('active')) {
            target.classList.remove('active')
            window.nowPlay.splice(window.nowPlay.indexOf(target), 1)
        }
        else {
            target.classList.add('active')
            window.nowPlay.push(target)
        }

        if (window.isPause && target.classList.contains('active')) {
            playButt.classList = 'fa-solid fa-pause'
            window.isPause = false
        }
        console.log(window.nowPlay)
    });
});

// master volume
let volumeSkins = ['fa-solid fa-volume-off', 'fa-solid fa-volume-low', 'fa-solid fa-volume-high']
let masterVolume = document.querySelector('#master-volume-slider')
let masterTrack = document.querySelector('#master-volume-slider #track')
let masterVolumeThumb = document.querySelector('#master-volume-slider #thumb')
let volume = document.querySelector('#volume')
let isChanging = true

function changeMasterVolumeSlider(mode) {
    if (mode == 'show') {
        masterVolume.classList.add('active')
        masterVolume.style.display = 'flex'
        masterVolume.style.opacity = '1'
    }
    else if (mode == 'hide') {
        if (!isChanging) {
            masterVolume.classList.remove('active')
            masterVolume.style.opacity = '0'
            setTimeout(() => {
                if (masterVolume.style.opacity == '0') {
                    masterVolume.style.display = 'none'
                }
            }, 1000)
        }
    }
}

function changeVolumeSkin(percent){
    if(percent <= 33) return volumeSkins[0]
    else if(percent <= 66) return volumeSkins[1]
    else if(percent <= 100) return volumeSkins[2]
}
volume.addEventListener('mouseenter', e => {
    changeMasterVolumeSlider('show')
})

volume.addEventListener('mouseleave', e => {
    if (!masterVolume.contains(e.relatedTarget)) {
        isChanging = false
        changeMasterVolumeSlider('hide')
    }
})

masterVolume.addEventListener('mouseleave', e => {
    if (!volume.contains(e.relatedTarget)) {
        isChanging = false
        changeMasterVolumeSlider('hide')
    }
})

let startPoint = 0;
let currentMasterPercent = 50; 

function changeMasterVolume(e) {
    let trackRect = masterTrack.getBoundingClientRect();
    let percent = ((e.clientX - trackRect.left) / trackRect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    

    masterVolumeThumb.style.left = percent + '%';
    volume.className = changeVolumeSkin(percent);

    let delta = percent - startPoint;


    soundCell.allInstance.forEach(cell => {

        if (window.nowPlay.includes(cell.node)) {
            cell.masterVolume = delta; 
        }
    });

    startPoint = percent;
    currentMasterPercent = percent;
}


masterVolumeThumb.addEventListener('mousedown', e => {
    e.stopPropagation();
    isChanging = true;
    let trackRect = masterTrack.getBoundingClientRect();
    startPoint = ((e.clientX - trackRect.left) / trackRect.width) * 100;

    const onMove = (event) => {
        changeMasterVolume(event)
        changeMasterVolumeSlider('show')
    }
    const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
});

masterTrack.addEventListener('click', e => {
    startPoint = currentMasterPercent; 
    changeMasterVolume(e);
});
//clear

let clearBut = document.querySelector('#clear')

clearBut.addEventListener('click' , e => {
    soundCell.allInstance.forEach(cell => {
        cell.isPlaying = false
    })
})