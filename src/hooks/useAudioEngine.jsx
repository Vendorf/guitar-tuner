import { PitchDetector } from "pitchy"
import { useRef, useState } from "react"
// import usePitchHistory from "../hooks/usePitchHistory"
import scale from '../assets/scale.m4a'
import hz1000 from '../assets/hz1000.wav'
import sweep from '../assets/sweep.wav'

// TODO: set 'updating' true/false thing; if we are updating, set true, once no longer, set to false
// that way will set 'updating' to false as final thing of a pitch detection sequence, so then can
// clear things like waveforms, defocus after X seconds, etc
// alternatively could set timer since last update in each component, reset on an update, and then if it goes thru
// run the cleanup

const USE_FAKE_INPUT = false
// const FAKE_INPUT_DATA = new Audio(scale)
// const FAKE_INPUT_DATA = new Audio(hz1000)
const FAKE_INPUT_DATA = new Audio(sweep)

//CONSTANTS-----------------------------------------------------

// TODO: this controls the ultimate precision in FFT
// I think beyond compute time there's some other tradeoffs here? but smaller seems better
// initial test this seems waaay better with E2 than the default 2048 size; wonder if can go even higher?
// but wonder what the negative tradeoff is gonna be
// see https://hackernoon.com/guitar-tuner-pitch-detection-for-dummies-ok8e35o9#:~:text=To%20determine%20which%20frequencies%20are%20in%20which%20bin%2C%20we%20can%20use%20the%20following%20formula%3A
// for a bit of explanation, but should find a better one for more details

const FFT_SIZE = 8192
// const FFT_SIZE = 16384
const MIN_DECIBALS = -20
const MIN_CLARITY = 0.9
// const MIN_FREQ = 24.5 // G0
const MIN_FREQ = 36.71 // D0
//--------------------------------------------------------------

/**
 * TODO fix doc
 * @param {Object} param
 * @param {() => void} param.onPitchData
 * @returns {Object}
 */
const useAudioEngine = ({ onPitchData }) => {
    const audioContextRef = useRef(undefined)
    //TODO fix this type
    const audioDataRef = useRef(undefined) // [AnalyzerNode, PitchDetector, Float32Array (getFloatTimeDomainData)]
    const animationFrameRef = useRef(undefined)

    const [started, setStarted] = useState(false) // whether audio is started


    /**
     * TODO fix this doc
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

        const sampleRate = audioContextRef.current.sampleRate

        audioDataRef.current = { analyserNode, detector, inputTime, inputFreq, sampleRate }
    }

    /**
     * TODO fix this doc
     * Performs a pitch update by reading data from the analyzerNode and supplying it to the pitchDetector
     * 
     * updatePitch calls itself in an indirect infinite loop with requestAnimationFrame
     * 
     * Note this method should not be called directly but is instead controlled by audio control methods (startAudio, stopAudio, killAudio)
     * that handle supplying correct parameters and stopping/resuming the requestAnimationFrame loop
     */
    const updatePitch = () => {
        const { analyserNode, detector, inputTime, inputFreq, sampleRate } = audioDataRef.current

        analyserNode.getFloatTimeDomainData(inputTime)
        analyserNode.getFloatFrequencyData(inputFreq)

        const [pitch, clarity] = detector.findPitch(inputTime, sampleRate)

        if ((clarity >= MIN_CLARITY) && (pitch >= MIN_FREQ)) {
            // Trigger callback for pitch update
            onPitchData({ pitch, clarity, inputTime, inputFreq })
        }

        // Keep updating
        animationFrameRef.current = requestAnimationFrame(updatePitch)
    }

    /**
     * Initializes audio if unintialized or resumes AudioContext if stopped
     * 
     * This is the method that should be called to begin processing audio
     */
    const startAudio = async () => {
        if (!audioContextRef.current) {
            await initAudio()
        } else {
            audioContextRef.current?.resume()
            // updatePitch(analyserNode, detector, input, audioContextRef.current.sampleRate)
        }
        setStarted(true)
        updatePitch()
    }

    /**
     * Stops audio updates and pauses (suspends) the AudioContext
     */
    const stopAudio = () => {
        cancelAnimationFrame(animationFrameRef.current)
        audioContextRef.current?.suspend()
        setStarted(false)
    }
    /**
     * Stops audio and closes the window AudioContext
     */
    const killAudio = () => {
        stopAudio()
        audioContextRef.current?.close()
    }

    return { started, startAudio, stopAudio, killAudio }
}

export default useAudioEngine