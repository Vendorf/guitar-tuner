import { createContext, use, useEffect, useState } from "react";
import { useAudio } from "./AudioContext";
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
    const { pitch } = useAudio()

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