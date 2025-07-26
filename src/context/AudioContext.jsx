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

const AudioContext = createContext(undefined)

const AudioProvider = ({ children }) => {
    const audioContextRef = useRef(undefined)
    const audioDataRef = useRef(undefined)
    const [pitch, setPitch] = useState(0)
    const [clarity, setClarity] = useState(0)
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
        if(!audioContextRef.current) {
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
        // if((detPitch !== 0 || detClarity !== 0)) {
        //     setPitch(detPitch)
        //     setClarity(detClarity)
        // }

        if((detClarity >= MIN_CLARITY) && (detPitch >= MIN_FREQ)) {
            setPitch(detPitch)
            setClarity(detClarity)
            // console.log(detPitch, detClarity)
        }

        // Keep updating
        animationFrameRef.current = requestAnimationFrame(() => updatePitch(analyserNode, detector, input, sampleRate))
    }

    return (
        <AudioContext value={{ pitch, clarity, started, startAudio, stopAudio, killAudio }}>
            {children}
        </AudioContext>
    )
}

// Hook for ease/clarity
const useAudio = () => {
    return use(AudioContext)
}


export { AudioProvider, AudioContext, useAudio }