import { createContext, use, useEffect, useState } from "react"
import { getExactNoteFromFrequency } from "../utilities/tuningUtils"
import useAudioEngine from "../hooks/engines/useAudioEngine"

//// TYPEDEFS /////////////////////////////////////////////////////////////////
/**
 * @typedef {Object} HistoryEntry
 * @property {number} pitch pitch detected by PitchDetector
 * @property {number} clarity clarity (confidence) in pitch detected by PitchDetector
 * @property {number} exactNote midi note with cents (ex: 69.03) for 3 cents above A4
 * @property {Date} time time of history entry
 */
///////////////////////////////////////////////////////////////////////////////

//// CONSTANTS ////////////////////////////////////////////////////////////////
const HISTORY_SIZE = 1000
///////////////////////////////////////////////////////////////////////////////

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

    const [history, setHistory] = useState(/** @type {HistoryEntry[]} */([]))
    const resetHistory = () => {
        setHistory([])
    }

    const handlePitchData = ({ pitch: detPitch, clarity: detClarity, inputTime, inputFreq }) => {
        setPitch(detPitch)
        setClarity(detClarity)

        setAudioTimeData(inputTime) // NOTE: this will on it's own not trigger updates bc same object!
        setAudioFrequencyData(inputFreq)

        setHistory((oldHist) => {
            const newHistory = [...oldHist, {
                pitch: detPitch,
                clarity: detClarity,
                exactNote: getExactNoteFromFrequency(detPitch),
                time: (new Date())
            }]
            if (newHistory.length > HISTORY_SIZE) {
                newHistory.shift()
            }
            return newHistory
        })

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
        <AudioStateContext value={{ pitch, clarity, history, updates, audioTimeData, audioFrequencyData }}>
            <AudioControlContext value={{ started, startAudio, stopAudio, killAudio, resetHistory }}>
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