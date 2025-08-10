import { useRef, useState } from "react"
import * as Tone from "tone"

/**
 * TODO
 * @returns TODO
 */
const useSynthEngine = () => {
    const synthRef = useRef(undefined)
    const [heldFreq, setHeldFreq] = useState(0)

    const startSynth = async () => {
        if (!synthRef.current) {
            await Tone.start()
            synthRef.current = new Tone.PolySynth().toDestination()
        }
    }

    const playFreq = async (freq, duration = '8n') => {
        // Trigger tone for duration
        await startSynth()
        synthRef.current.triggerAttackRelease(freq, duration)
    }

    const stopHeldFreq = () => {
        if (heldFreq !== 0) {
            // Stop current tone
            synthRef.current.triggerRelease(heldFreq)
        }
        setHeldFreq(0)
    }

    const holdFreq = async (freq) => {
        await startSynth()

        // Stop currently held
        if (heldFreq !== 0) {
            // Stop current tone
            synthRef.current.triggerRelease(heldFreq)
        }

        if (heldFreq !== freq) {
            // New frequency, so play it
            synthRef.current.triggerAttack(freq)
            setHeldFreq(freq)

        } else {
            // Same frequency, so just toggled off and none held now
            setHeldFreq(0)
        }
    }

    return { heldFreq, startSynth, playFreq, holdFreq, stopHeldFreq }
}

export default useSynthEngine