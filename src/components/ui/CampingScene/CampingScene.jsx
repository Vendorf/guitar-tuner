import bear from '../../../assets/bear.png'
import campfire from '../../../assets/campfire.png'
import flame from '../../../assets/flame.png'
import soot from '../../../assets/soot.png'

import guitar1 from '../../../assets/guitars/Guitar 1.mp3'
import guitar2 from '../../../assets/guitars/Guitar 2.mp3'
import guitar3 from '../../../assets/guitars/Guitar 3.mp3'
import guitar4 from '../../../assets/guitars/Guitar 4.mp3'
import guitar5 from '../../../assets/guitars/Guitar 5.mp3'
import guitar6 from '../../../assets/guitars/Guitar 6.mp3'
import guitar7 from '../../../assets/guitars/Guitar 7.mp3'
import guitar8 from '../../../assets/guitars/Guitar 8.mp3'
import guitar9 from '../../../assets/guitars/Guitar 9.mp3'
import guitar10 from '../../../assets/guitars/Guitar 10.mp3'
import guitar11 from '../../../assets/guitars/Guitar 11.mp3'

import './CampingScene.css'
import { useMemo, useState } from 'react'
import { shuffleArray } from '../../../utilities/arrayUtils'

//TODO: refactor so not so tightly coupled

// Guitar from STALKER OST (https://archive.org/details/12.-alexey-omelchuk-call-of-pripyat-ost-outro/S.T.A.L.K.E.R/stalker_cs_ost_flac.mp3)
// Zustand Bear from Zustand (https://zustand-demo.pmnd.rs/)

const AUDIO_FILES = [guitar1, guitar2, guitar3, guitar4, guitar5, guitar6, guitar7, guitar8, guitar9, guitar10, guitar11]

/**
 * Creates a camping scene with the Zustand bear and a campfire that burns/smokes depending on user's dark mode setting
 * 
 * The bear also plays some songs :)
 * @param {Object} param
 * @param {boolean} param.resetAnimation whether animation being reset
 * @param {boolean} param.darkMode whether dark mode is on
 * @param {()=>void} param.toggleDark callback for toggling dark mode
 * @returns camping scene div
 */
const CampingScene = ({ resetAnimation, darkMode, toggleDark }) => {
    const [currAudio, setCurrAudio] = useState(-1)

    // Only compute once (no dependencies in useMemo so won't fire again)
    const audios = useMemo(() => {
        const audioElements = AUDIO_FILES.map(file => new Audio(file))
        // Randomize order
        shuffleArray(audioElements)
        return audioElements
    }, [])

    /**
    * Stops current audio if playing, or plays next (random) audio from the shuffles audios array
    */
    const playAudio = () => {
        if (audios.length == 0) {
            return
        }

        // If we are already paused, or the audio ended, then we can advance to the next audio
        const playNext = audios[currAudio] ? (audios[currAudio].paused || audios[currAudio].ended) : true

        // Always pause the current audio
        if (audios[currAudio]) {
            audios[currAudio].pause()
            audios[currAudio].currentTime = 0 // rewind to start if we get back around to it
        }

        if (playNext) {
            // Otherwise, the current audio is already paused, so we play next audio
            const nextAudio = (currAudio + 1) % audios.length
            audios[nextAudio].play()
            setCurrAudio(nextAudio)
        }
    }

    return (
        <div className='camping-scene'>
            <div className='camping-box'>
                <img src={bear} className="bear" alt="Zustand Bear" onClick={() => playAudio()} />
                <img src={campfire} className="campfire" alt="Campfire" onClick={() => toggleDark()} />
                <img src={soot} className={`soot`} alt='Soot' />
                {!resetAnimation && <div className={`smoke-container ${darkMode ? 'smoke-off' : ''}`} >
                    <div className="smoke-particle sp0"></div>
                    <div className="smoke-particle sp1"></div>
                    <div className="smoke-particle sp2"></div>
                    <div className="smoke-particle sp3"></div>
                    <div className="smoke-particle sp4"></div>
                </div>}
                <div className={`flame-container ${darkMode ? '' : 'flame-off'}`}>
                    <img src={flame} className={`flame ${darkMode ? '' : 'flame-off'}`} alt='Flame' />
                </div>
            </div>
        </div>
    )
}

export default CampingScene