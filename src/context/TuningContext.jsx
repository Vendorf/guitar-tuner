import { createContext, use, useEffect, useRef, useState } from "react";
import { useAudioControls, useAudioState } from "./AudioContext";
import { generateNotes, recomputeFrequencies, getNearestNoteFromFrequency, getExactNoteFromFrequency, toNearestNote } from "../utilities/tuningUtils";
import { CENTS_DIST_IN_TUNE, CENTS_DIST_MAX, COUNT_IN_TUNE, TUNINGS } from "../constants/tuningConstants";
import usePitchAnalysis from "../hooks/usePitchAnalysis";

const TuningContext = createContext(undefined)

/**
 * Provides all tuning state
 * @param {*} param0 
 * @returns 
 */
const TuningProvider = ({ children }) => {
    // const { pitch } = useAudio()
    const { pitch } = useAudioState()
    const { resetHistory } = useAudioControls()

    const lastTargetNoteRef = useRef(-1)
    const swappedTargetNotesRef = useRef(false)

    const [notes, setNotes] = useState([])
    const [tuningMode, setTuningMode] = useState("standard")
    const [notesTuned, setNotesTuned] = useState(new Set())

    useEffect(() => {
        const n = generateNotes()
        recomputeFrequencies(n)
        setNotes(n)
    }, [])

    useEffect(() => {
        // Reset tuning
        setNotesTuned(new Set())
    }, [tuningMode])

    const onNoteTuned = (note) => {
        if (!notesTuned.has(note)) {
            //TODO play sound effect
            setNotesTuned((new Set(notesTuned)).add(note))
        }
    }

    const noteInfo = usePitchAnalysis({ pitch, currTuning: TUNINGS[tuningMode], onNoteTuned })

    if(noteInfo.targetNote !== lastTargetNoteRef.current) {
        // Target note switched, so reset our history'
        lastTargetNoteRef.current = noteInfo.targetNote
        swappedTargetNotesRef.current = true
    }

    // Runs every time, but after tree is rendered, to prevent changing state during render phase
    // TODO: bc it's just an object.is check can just define a non-state constant and compare that way
    // so const targetNote = analysis?.targetNote ?? null, and then do useEffect(..., [targetNote]) and that will scope to just when
    // the target changes, then don't need the swappedTarget at all
    useEffect(() => {
        if(swappedTargetNotesRef.current) {
            swappedTargetNotesRef.current = false
            resetHistory()
            console.log("reset hist")
        }
    })

    return (
        <TuningContext value={{ notes, tuningMode, setTuningMode, notesTuned, noteInfo }}>
            {children}
        </TuningContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

export { TuningProvider, TuningContext, useTuning }