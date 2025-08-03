import { useEffect, useMemo, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AudioProvider } from './context/AudioContext'
import { TuningProvider } from './context/TuningContext'
import PitchDisplay from './components/PitchDisplay/PitchDisplay'
import TunerDisplay from './components/TunerDisplay/TunerDisplay'
import StartButton from './components/StartButton/StartButton'
import bear from './assets/bear.png'
import campfire from './assets/campfire.png'
import flame from './assets/flame.png'
import soot from './assets/soot.png'

import guitar1 from './assets/guitars/Guitar 1.mp3'
import guitar2 from './assets/guitars/Guitar 2.mp3'
import guitar3 from './assets/guitars/Guitar 3.mp3'
import guitar4 from './assets/guitars/Guitar 4.mp3'
import guitar5 from './assets/guitars/Guitar 5.mp3'
import guitar6 from './assets/guitars/Guitar 6.mp3'
import guitar7 from './assets/guitars/Guitar 7.mp3'
import guitar8 from './assets/guitars/Guitar 8.mp3'
import guitar9 from './assets/guitars/Guitar 9.mp3'
import guitar10 from './assets/guitars/Guitar 10.mp3'
import guitar11 from './assets/guitars/Guitar 11.mp3'

import { shuffleArray } from './utilities/arrayUtils'

// Guitar from STALKER OST (https://archive.org/details/12.-alexey-omelchuk-call-of-pripyat-ost-outro/S.T.A.L.K.E.R/stalker_cs_ost_flac.mp3)
// Zustand Bear from Zustand (https://zustand-demo.pmnd.rs/)

const AUDIO_FILES = [guitar1, guitar2, guitar3, guitar4, guitar5, guitar6, guitar7, guitar8, guitar9, guitar10, guitar11]

function App() {
  //TODO: encase bear in proper div that scales correctly so that not stepping on top of content

  //TODO: playing, setPlaying
  //when click --> if playing, stop. if not, start
  // also add multiple tracks and select a random one

  //audio.pause()
  //audio.currenTime = 0 to reset it
  //
  //audio.play() to start
  //
  //some event for when finishes to set to playing --> false

  const isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

  const [darkMode, setDarkMode] = useState(isSystemDarkMode)
  const [resetAnimation, setResetAnimation] = useState(false)
  // const audiosRef = useRef(AUDIO_FILES.map(file => new Audio(file)))
  const [currAudio, setCurrAudio] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleDark = () => {
    setDarkMode(!darkMode)

    if (darkMode) {
      // Transitioning to light mode, so reset the smoke animation
      setResetAnimation(true); // Remove animation class
      setTimeout(() => {
        setResetAnimation(false); // Add animation class back after a short delay
      }, 10) // A small delay for reflow
    }

  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Only compute once (no dependencies in useMemo so won't fire again)
  const audios = useMemo(() => {
    const audioElements = AUDIO_FILES.map(file => new Audio(file))
    // Randomize order
    shuffleArray(audioElements)

    console.log(audioElements)

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
    <>
      <AudioProvider>
        <TuningProvider>
          {/* <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}> */}
          <div className={`app-container`}>
            <div className='darkmode-float-wrapper'>
              <div className='darkmode-toggle' onClick={() => toggleDark()}>
                {/* <div className={`sun ${darkMode ? 'sun-off' : ''}`}>A</div> */}
                {/* <div className={`moon ${darkMode ? '' : 'moon-off'}`}>B</div> */}

                <svg
                  className={`sun ${darkMode ? 'sun-off' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  // width="1em"
                  // height="1em"
                  fill="hsla(41, 100%, 65%, 1.00)"
                  // class="theme-toggle__expand"
                  viewBox="0 0 32 32"
                >
                  <clipPath id="theme-toggle__expand__cutout">
                    <path d="M0-11h25a1 1 0 0017 13v30H0Z" />
                  </clipPath>
                  <g clipPath="url(#theme-toggle__expand__cutout)">
                    <circle cx="16" cy="16" r="8.4" />
                    <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
                  </g>
                </svg>

                <svg
                  className={`moon ${darkMode ? '' : 'moon-off'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32">
                  <defs>
                    <mask id="Mask">
                      <rect width="32" height="32" fill="white" />
                      <circle cx="22" cy="10" r="10" fill="black" />
                    </mask>
                  </defs>
                  <circle cx="16" cy="16" r="10" fill="hsl(0, 0%, 78%)" mask="url(#Mask)" />
                </svg>

              </div>
            </div>

            {/* <div className='darkmode-tray-wrapper'>
              <div className='darkmode-tray'>
                <div className='darkmode-tray-handle'>bbbbbbbb</div>
              </div>
            </div> */}
            {/* <img src={bear} className="logo" alt="Zustand Bear" onClick={() => audio.play()} /> */}
            <div className='all-container'>
              <StartButton></StartButton>
              <TunerDisplay></TunerDisplay>
              <PitchDisplay></PitchDisplay>
            </div>
            <div className='sidebar sidebar-left'>
              <div className='camping-scene'>
                <div className='camping-box'>
                  <img src={bear} className="bear" alt="Zustand Bear" onClick={() => playAudio()} />
                  <img src={campfire} className="campfire" alt="Campfire" onClick={() => toggleDark()} />
                  {/* <img src={flame} className='flame' style={{display: darkMode ? '' : 'none'}} alt='Flame' /> */}
                  {/* <img src={flame} className={`flame ${darkMode ? '' : 'flame-off'}`} alt='Flame' /> */}
                  {/* <img src={soot} className={`soot ${darkMode ? '' : ''}`} alt='Soot' style={{ display: darkMode ? 'none' : '' }} /> */}
                  <img src={soot} className={`soot`} alt='Soot' />
                  {/* <div className={`smoke-container ${darkMode ? 'smoke-off' : ''}`} style={{ display: darkMode ? 'none' : '' }}> */}
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


                  {/* TODO: replace these with some sort of image ig */}
                  {/* TODO: fire animation: 3 parts (orange, light orange, yellow) that sway back/forth; circle particles that come off and dissapear; black stroke around it? */}
                  {/* <div class="smoke">
                    <span class="s-0"></span>
                    <span class="s-1"></span>
                    <span class="s-2"></span>
                    <span class="s-3"></span>
                    <span class="s-4"></span>
                    <span class="s-5"></span>
                    <span class="s-6"></span>
                    <span class="s-7"></span>
                    <span class="s-8"></span>
                    <span class="s-9"></span>
                  </div> */}
                </div>
              </div>
            </div>
            <div className='sidebar sidebar-right'></div>
          </div>
        </TuningProvider>
      </AudioProvider>
    </>
  )
}

export default App
