import { PitchDetector } from "pitchy"
import { createContext, use, useEffect, useRef, useState } from "react"

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