import { useState } from 'react'
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
// import scale from './assets/scale.m4a'
import guitar1_stalker from './assets/guitar1_stalker.mp3'

// Guitar from STALKER OST (https://archive.org/details/12.-alexey-omelchuk-call-of-pripyat-ost-outro/S.T.A.L.K.E.R/stalker_cs_ost_flac.mp3)
// Zustand Bear from Zustand (https://zustand-demo.pmnd.rs/)

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


  const [darkMode, setDarkMode] = useState(false)
  const [resetAnimation, setResetAnimation] = useState(false);

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

  const audio = new Audio(guitar1_stalker)

  // const [playAudio, stopPlayAudio]
  // const [count, setCount] = useState(0)

  // return (
  //   <>
  //     <div>
  //       <a href="https://vite.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //     <AudioProvider>
  //       <PitchDisplay></PitchDisplay>
  //     </AudioProvider>
  //   </>
  // )

  return (
    <>
      <AudioProvider>
        <TuningProvider>
          <div className='app-container'>
            {/* <img src={bear} className="logo" alt="Zustand Bear" onClick={() => audio.play()} /> */}
            <div className='all-container'>
              <StartButton></StartButton>
              <TunerDisplay></TunerDisplay>
              <PitchDisplay></PitchDisplay>
            </div>
            <div className='sidebar sidebar-left'>
              <div className='camping-scene'>
                <div className='camping-box'>
                  <img src={bear} className="bear" alt="Zustand Bear" onClick={() => audio.play()} />
                  <img src={campfire} className="campfire" alt="Campfire" onClick={() => toggleDark()}/>
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
