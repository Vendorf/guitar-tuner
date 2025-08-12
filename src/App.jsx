import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AudioProvider } from './context/AudioContext'
import { TuningProvider } from './context/TuningContext'
import PitchDisplay from './components/ui/PitchDisplay/PitchDisplay'
import TunerDisplay from './components/ui/TunerDisplay/TunerDisplay'
import StartButton from './components/ui/StartButton/StartButton'
import DarkmodeToggle from './components/ui/DarkmodeToggle/DarkmodeToggle'
import CampingScene from './components/ui/CampingScene/CampingScene'
import { SynthProvider } from './context/SynthContext'

const LIGHT_MODE_BACKGROUND_COLOR = 'hsl(0, 0%, 91%)';
const DARK_MODE_BACKGROUND_COLOR = 'hsl(0, 0%, 12%)';

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
      <meta name='theme-color' content={darkMode ? DARK_MODE_BACKGROUND_COLOR : LIGHT_MODE_BACKGROUND_COLOR}></meta>
      <AudioProvider>
        <TuningProvider>
          <SynthProvider>
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
          </SynthProvider>
        </TuningProvider>
      </AudioProvider>
    </>
  )
}

export default App
