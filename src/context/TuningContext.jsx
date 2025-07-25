// Everything for now lmao ig


import { createContext, use, useEffect, useState } from "react";
import { useAudio } from "./AudioContext";
import { generateNotes, recomputeFrequencies, getNearestNoteFromFrequency, TUNINGS } from "../utilities/tuner";


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

    useEffect(() => {
        const n = generateNotes()
        recomputeFrequencies(n)
        setNotes(n)
    }, [])


    // On pitch change, recompute the closest and target
    let targetNote = -1
    let nearestNote = -1
    if (pitch > 0) {
        nearestNote = getNearestNoteFromFrequency(pitch)
        
        const tuning = TUNINGS[tuningMode].strings_ids
        const targetDistances = tuning.map(n => Math.abs(n - nearestNote))
        const targetIdx = targetDistances.indexOf(Math.min(...targetDistances))

        targetNote = tuning[targetIdx]
    }


    return (
        <TuningContext value={{ notes, tuningMode, setTuningMode, nearestNote, targetNote }}>
            {children}
        </TuningContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

export { TuningProvider, TuningContext, useTuning }