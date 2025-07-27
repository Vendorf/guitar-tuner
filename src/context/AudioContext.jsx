import { PitchDetector } from "pitchy"
import { createContext, use, useEffect, useRef, useState } from "react"

// TODO: this controls the ultimate precision in FFT
// I think beyond compute time there's some other tradeoffs here? but smaller seems better
// initial test this seems waaay better with E2 than the default 2048 size; wonder if can go even higher?
// but wonder what the negative tradeoff is gonna be
// see https://hackernoon.com/guitar-tuner-pitch-detection-for-dummies-ok8e35o9#:~:text=To%20determine%20which%20frequencies%20are%20in%20which%20bin%2C%20we%20can%20use%20the%20following%20formula%3A
// for a bit of explanation, but should find a better one for more details
const FFT_SIZE = 8192

const MIN_DECIBALS = -20
const MIN_CLARITY = 0.9
// const MIN_FREQ = 24.5 // G0
const MIN_FREQ = 36.71 // D0

const HISTORY_SIZE = 50

const AudioContext = createContext(undefined)

const AudioProvider = ({ children }) => {
    const audioContextRef = useRef(undefined)
    const audioDataRef = useRef(undefined) // [AnalyzerNode, PitchDetector, Float32Array (getFloatTimeDomainData)]

    const [audioTimeData, setAudioTimeData] = useState(new Float32Array(0))

    const [updates, setUpdates] = useState(0) // number of updates
    const [pitch, setPitch] = useState(0)
    const [clarity, setClarity] = useState(0)
    /**
     * Structure:
     * [
     *   {
     *      pitch: number,
     *      clarity: number,
     *      time: Date()
     *   }, 
     * ]
     */
    const [history, setHistory] = useState([])
    const [started, setStarted] = useState(false)
    const animationFrameRef = useRef(undefined)

    useEffect(() => {
        // Cleanup when component destroyed/etc
        return killAudio
    }, [])

    const initAudio = () => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        const analyserNode = audioContextRef.current.createAnalyser()
        analyserNode.fftSize = FFT_SIZE
        return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            console.log(audioContextRef, analyserNode)
            audioContextRef.current.createMediaStreamSource(stream).connect(analyserNode)
            const detector = PitchDetector.forFloat32Array(analyserNode.fftSize)
            detector.minVolumeDecibels = MIN_DECIBALS
            const input = new Float32Array(detector.inputLength)

            audioDataRef.current = [analyserNode, detector, input]
            // updatePitch(analyserNode, detector, input, audioContextRef.current.sampleRate)
        })
    }

    const killAudio = () => {
        stopAudio()
        audioContextRef.current?.close()
    }

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

    const stopAudio = () => {
        cancelAnimationFrame(animationFrameRef.current)
        audioContextRef.current?.suspend()
        setStarted(false)
    }

    const updatePitch = (analyserNode, detector, input, sampleRate) => {
        analyserNode.getFloatTimeDomainData(input)
        // console.log(input)
        const [detPitch, detClarity] = detector.findPitch(input, sampleRate)

        // Update react state
        if ((detClarity >= MIN_CLARITY) && (detPitch >= MIN_FREQ)) {
            setAudioTimeData(input) // NOTE: this will on it's own not trigger updates bc same object!
            setPitch(detPitch)
            setClarity(detClarity)
            setHistory((oldHist) => {
                const newHistory = [...oldHist, {pitch: detPitch, clarity: detClarity, time: (new Date())}]
                if(newHistory.length > HISTORY_SIZE) {
                    newHistory.shift()
                }
                return newHistory
            })
            setUpdates((oldUpd) => oldUpd+1)
            // console.log(detPitch, detClarity)
        }
        // TODO: set 'updating' true/false thing; if we are updating, set true, once no longer, set to false
        // that way will set 'updating' to false as final thing of a pitch detection sequence, so then can
        // clear things like waveforms, defocus after X seconds, etc
        // alternatively could set timer since last update in each component, reset on an update, and then if it goes thru
        // run the cleanup

        // Keep updating
        //TODO: can bind this somehow to get updated state? idk
        animationFrameRef.current = requestAnimationFrame(() => updatePitch(analyserNode, detector, input, sampleRate))
    }

    return (
        <AudioContext value={{ pitch, clarity, started, history, updates, startAudio, stopAudio, killAudio, audioTimeData }}>
            {children}
        </AudioContext>
    )
}

// Hook for ease/clarity
const useAudio = () => {
    return use(AudioContext)
}


export { AudioProvider, AudioContext, useAudio }