import { createContext, use, useEffect, useState } from "react"
import useAudioEngine from "../hooks/engines/useAudioEngine"

const AudioStateContext = createContext(undefined)
const AudioControlContext = createContext(undefined)

/**
 * Provider for global audio state and control functions via AudioStateContext and AudioControlContext
 * 
 * Rapidly-changing state is isolated inside the AudioStateContext
 * 
 * Can subscribe to just the AudioControlContext to manage the audio but not consume it's rapid state changes
 * @param {Object} param
 * @param {Object} param.children children to render inside the audio provider with access to its contexts
 * @returns provider with AudioStateContext and AudioControlContext
 */
const AudioProvider = ({ children }) => {
    const [audioTimeData, setAudioTimeData] = useState(new Float32Array(0)) // data from AnalyzerNode
    const [audioFrequencyData, setAudioFrequencyData] = useState(new Float32Array(0)) // data from AnalyzerNode
    const [pitch, setPitch] = useState(0)
    const [clarity, setClarity] = useState(0)
    const [updates, setUpdates] = useState(0) // number of updates

    const handlePitchData = ({ pitch: detPitch, clarity: detClarity, inputTime, inputFreq }) => {
        setPitch(detPitch)
        setClarity(detClarity)

        setAudioTimeData(inputTime) // NOTE: this will on it's own not trigger updates bc same object!
        setAudioFrequencyData(inputFreq)

        setUpdates((u) => u + 1)
    }

    const { started, startAudio, stopAudio, killAudio } = useAudioEngine({
        onPitchData: handlePitchData
    })

    useEffect(() => {
        // Cleanup when component destroyed/etc
        return killAudio
    }, [])

    return (
        <AudioStateContext value={{ pitch, clarity, updates, audioTimeData, audioFrequencyData }}>
            <AudioControlContext value={{ started, startAudio, stopAudio, killAudio }}>
                {children}
            </AudioControlContext>
        </AudioStateContext>
    )
}

/**
 * Hook to access the AudioStateContext
 * @returns use(AudioStateContext) - uses the AudioStateContext and returns its current values
 */
const useAudioState = () => {
    return use(AudioStateContext)
}

/**
 * Hook to access the AudioControlContext
 * @returns use(AudioControlContext) - uses the AudioControlContext and returns its current values
 */
const useAudioControls = () => {
    return use(AudioControlContext)
}

export { AudioProvider, AudioStateContext, AudioControlContext, useAudioState, useAudioControls }