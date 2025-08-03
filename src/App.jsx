import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AudioProvider } from './context/AudioContext'
import { TuningProvider } from './context/TuningContext'
import PitchDisplay from './components/PitchDisplay/PitchDisplay'
import TunerDisplay from './components/TunerDisplay/TunerDisplay'
import StartButton from './components/StartButton/StartButton'
import DarkmodeToggle from './components/DarkmodeToggle/DarkmodeToggle'
import CampingScene from './components/CampingScene/CampingScene'

function App() {
  const isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

  const [darkMode, setDarkMode] = useState(isSystemDarkMode)
  const [resetAnimation, setResetAnimation] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  const toggleDark = () => {
    setDarkMode(!darkMode)

    if (darkMode) {
      // Transitioning to light mode, so reset the smoke animation
      setResetAnimation(true)
      setTimeout(() => {
        setResetAnimation(false)
      }, 10) // Small delay for reflow
    }

  }

  return (
    <>
      <AudioProvider>
        <TuningProvider>
          <div className={`app-container`}>
            <DarkmodeToggle darkMode={darkMode} toggleDark={toggleDark}></DarkmodeToggle>
            <div className='all-container'>
              <StartButton></StartButton>
              <TunerDisplay></TunerDisplay>
              <PitchDisplay></PitchDisplay>
            </div>
            <div className='sidebar sidebar-left'>
              <CampingScene resetAnimation={resetAnimation} darkMode={darkMode} toggleDark={toggleDark}></CampingScene>
            </div>
            <div className='sidebar sidebar-right'></div>
          </div>
        </TuningProvider>
      </AudioProvider>
    </>
  )
}

export default App
