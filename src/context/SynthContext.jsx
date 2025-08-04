import { createContext, use, useRef, useState } from "react"
import * as Tone from "tone"

const SynthContext = createContext(undefined)

const SynthProvider = ({ children }) => {
    const synthRef = useRef(undefined)
    // const activeToggleFreqRef = useRef(0)
    // const [synth, setSynth] = useState(undefined)
    const [activeToggleFreq, setActiveToggleFreq] = useState(0)

    const startSynth = async () => {
        if (!synthRef.current) {
            await Tone.start()
            synthRef.current = new Tone.PolySynth().toDestination()
        }
    }

    const triggerTone = (freq, duration = '8n') => {
        // Trigger tone for duration
        startSynth().then(
            () => synthRef.current.triggerAttackRelease(freq, duration)
        )
    }

    const stopTone = () => {
        if (activeToggleFreq != 0) {
            // Stop current tone
            synthRef.current.triggerRelease(activeToggleFreq)
        }
        setActiveToggleFreq(0)
    }

    const holdTone = (freq) => {
        startSynth().then(() => {
            // Stop currently held
            if (activeToggleFreq != 0) {
                // Stop current tone
                synthRef.current.triggerRelease(activeToggleFreq)
            }

            // If new, hold
            if (activeToggleFreq != freq) {
                // Play new frequency
                setActiveToggleFreq(freq)
                synthRef.current.triggerAttack(freq)

            } else {
                setActiveToggleFreq(0)
            }
        })
    }

    return (
        <SynthContext value={{ startSynth, synth: synthRef.current, triggerTone, holdTone, heldFreq: activeToggleFreq, stopTone }}>
            {children}
        </SynthContext>
    )
}

const useSynth = () => {
    return use(SynthContext)
}

export { SynthProvider, SynthContext, useSynth }