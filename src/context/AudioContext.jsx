import { PitchDetector } from "pitchy"
import { createContext, use, useEffect, useRef, useState } from "react"
import { getExactNoteFromFrequency } from "../utilities/tuningUtils"
// import usePitchHistory from "../hooks/usePitchHistory"
import scale from '../assets/scale.m4a'
import hz1000 from '../assets/hz1000.wav'
import sweep from '../assets/sweep.wav'

// TODO: refactor some of the state passing to be more sane

// TODO: this controls the ultimate precision in FFT
// I think beyond compute time there's some other tradeoffs here? but smaller seems better
// initial test this seems waaay better with E2 than the default 2048 size; wonder if can go even higher?
// but wonder what the negative tradeoff is gonna be
// see https://hackernoon.com/guitar-tuner-pitch-detection-for-dummies-ok8e35o9#:~:text=To%20determine%20which%20frequencies%20are%20in%20which%20bin%2C%20we%20can%20use%20the%20following%20formula%3A
// for a bit of explanation, but should find a better one for more details

const USE_FAKE_INPUT = false
// const FAKE_INPUT_DATA = new Audio(scale)
// const FAKE_INPUT_DATA = new Audio(hz1000)
const FAKE_INPUT_DATA = new Audio(sweep)


//CONSTANTS-----------------------------------------------------
const FFT_SIZE = 8192
// const FFT_SIZE = 16384
const MIN_DECIBALS = -20
const MIN_CLARITY = 0.9
// const MIN_FREQ = 24.5 // G0
const MIN_FREQ = 36.71 // D0

const HISTORY_SIZE = 1000 //50
//--------------------------------------------------------------

// const AudioContext = createContext(undefined)
const AudioStateContext = createContext(undefined)
const AudioControlContext = createContext(undefined)

/**
 * Provider for global audio state and control functions via AudioStateContext and AudioControlContext
 * 
 * Rapidly-changing state is isolated inside the AudioStateContext
 * 
 * Can subscribe to just the AudioControlContext to manage the audio but not consume it's rapid state changes
 * @param {Object} param0 children to render inside the audio provider with access to its contexts
 * @returns provider with AudioStateContext and AudioControlContext
 */
const AudioProvider = ({ children }) => {
    const audioContextRef = useRef(undefined)
    const audioDataRef = useRef(undefined) // [AnalyzerNode, PitchDetector, Float32Array (getFloatTimeDomainData)]
    const animationFrameRef = useRef(undefined)

    const [audioTimeData, setAudioTimeData] = useState(new Float32Array(0)) // data from AnalyzerNode
    const [audioFrequencyData, setAudioFrequencyData] = useState(new Float32Array(0)) // data from AnalyzerNode
    const [started, setStarted] = useState(false) // whether audio is started
    const [pitch, setPitch] = useState(0)
    const [clarity, setClarity] = useState(0)
    const [updates, setUpdates] = useState(0) // number of updates

    /**
     * @typedef {Object} HistoryEntry
     * @property {number} pitch pitch detected by PitchDetector
     * @property {number} clarity clarity (confidence) in pitch detected by PitchDetector
     * @property {number} exactNote midi note with cents (ex: 69.03) for 3 cents above A4
     * @property {Date} time time of history entry
     */
    const [history, setHistory] = useState(/** @type {HistoryEntry[]} */([]))
    const resetHistory = () => {
        setHistory([])
    }

    useEffect(() => {
        // Cleanup when component destroyed/etc
        return killAudio
    }, [])

    /**
     * Initializes audio context from `window` and creates AnalyzerNode and PitchDetector for audio and pitch detection
     * 
     * Sets `audioDataRef` to contain [AnalyzerNode, PitchDetector, audioData[]]
     * @returns void
     */
    const initAudio = async () => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        const analyserNode = audioContextRef.current.createAnalyser()
        analyserNode.fftSize = FFT_SIZE

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log(audioContextRef, analyserNode)
        if (USE_FAKE_INPUT) {
            FAKE_INPUT_DATA.loop = true
            FAKE_INPUT_DATA.play()
            audioContextRef.current.createMediaElementSource(FAKE_INPUT_DATA).connect(analyserNode)
        } else {
            audioContextRef.current.createMediaStreamSource(stream).connect(analyserNode)
        }
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize)
        detector.minVolumeDecibels = MIN_DECIBALS
        const inputTime = new Float32Array(detector.inputLength)
        const inputFreq = new Float32Array(analyserNode.frequencyBinCount)
        audioDataRef.current = [analyserNode, detector, inputTime, inputFreq]
    }

    /**
     * Stops audio and closes the window AudioContext
     */
    const killAudio = () => {
        stopAudio()
        audioContextRef.current?.close()
    }

    /**
     * Initializes audio if unintializes or resumes AudioContext if stopped
     * 
     * This is the method that should be called to begin processing audio
     */
    const startAudio = () => {
        if (!audioContextRef.current) {
            initAudio().then(() => updatePitch(...audioDataRef.current, audioContextRef.current.sampleRate))
        } else {
            audioContextRef.current?.resume()
            // updatePitch(analyserNode, detector, input, audioContextRef.current.sampleRate)
            updatePitch(...audioDataRef.current, audioContextRef.current.sampleRate)
        }
        setStarted(true)
    }

    /**
     * Stops audio updates and suspends the AudioContext
     */
    const stopAudio = () => {
        cancelAnimationFrame(animationFrameRef.current)
        audioContextRef.current?.suspend()
        setStarted(false)
    }

    /**
     * Performs a pitch update by reading data from the analyzerNode and supplying it to the pitchDetector
     * 
     * updatePitch calls itself in an indirect infinite loop with requestAnimationFrame
     * 
     * Note this method should not be called directly but is instead controlled by audio control methods (startAudio, stopAudio, killAudio)
     * that handle supplying correct parameters and stopping/resuming the requestAnimationFrame loop
     * @param {AnalyserNode} analyserNode the window's AnalyzerNode to get audio data from
     * @param {PitchDetector} detector PitchDetector instance attached to analyzerNode to determine pitch/clarity
     * @param {Float32Array} inputTime float array to copy analyzerNode data into to supply to detector
     * @param {number} sampleRate audio sample rate of the analyzerNode (ex: 48000 Hz)
     */
    const updatePitch = (analyserNode, detector, inputTime, inputFreq, sampleRate) => {
        analyserNode.getFloatTimeDomainData(inputTime)
        analyserNode.getFloatFrequencyData(inputFreq)
        const [detPitch, detClarity] = detector.findPitch(inputTime, sampleRate)

        // Update react state
        if ((detClarity >= MIN_CLARITY) && (detPitch >= MIN_FREQ)) {
            setAudioTimeData(inputTime) // NOTE: this will on it's own not trigger updates bc same object!
            setAudioFrequencyData(inputFreq)
            setPitch(detPitch)
            setClarity(detClarity)
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

            // Update history
            // usePitchHistory({ pitch: detPitch, clarity: detClarity })

            setUpdates((u) => u + 1)
        }

        // Always increment updates
        // setUpdates((oldUpd) => oldUpd + 1)
        // TODO: set 'updating' true/false thing; if we are updating, set true, once no longer, set to false
        // that way will set 'updating' to false as final thing of a pitch detection sequence, so then can
        // clear things like waveforms, defocus after X seconds, etc
        // alternatively could set timer since last update in each component, reset on an update, and then if it goes thru
        // run the cleanup

        // Keep updating
        //TODO: can bind this somehow to get updated state? idk
        animationFrameRef.current = requestAnimationFrame(() => updatePitch(analyserNode, detector, inputTime, inputFreq, sampleRate))
    }

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