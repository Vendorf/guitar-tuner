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
          <img src={bear} className="logo" alt="Zustand Bear" onClick={() => audio.play()}/>
          <StartButton></StartButton>
          <TunerDisplay></TunerDisplay>
          <PitchDisplay></PitchDisplay>
        </TuningProvider>
      </AudioProvider>
    </>
  )
}

export default App
