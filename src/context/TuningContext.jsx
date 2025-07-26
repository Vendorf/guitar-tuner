// Everything for now lmao ig


import { createContext, use, useEffect, useState } from "react";
import { useAudio } from "./AudioContext";
import { generateNotes, recomputeFrequencies, getNearestNoteFromFrequency, getExactNoteFromFrequency, toNearestNote } from "../utilities/tuningUtils";
import { CENTS_DIST_MAX, TUNINGS } from "../constants/tuningConstants";

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

    //TODO: something to reset after X seconds or smthng else when haven't played for a while, etc?
    const noteInfo = {
        note: -1,
        nearestNote: -1,
        targetNote: -1,
        centsDist: 0
    }

    if (pitch > 0) {
        const note = getExactNoteFromFrequency(pitch)
        const nearestNote = toNearestNote(note)

        noteInfo.note = note
        noteInfo.nearestNote = nearestNote

        const tuning = TUNINGS[tuningMode].strings_ids
        const targetDistances = tuning.map(n => Math.abs(n - nearestNote))
        const targetIdx = targetDistances.indexOf(Math.min(...targetDistances))

        const targetNote = tuning[targetIdx]

        // Distance from target in cents
        const centsDist = note - targetNote
        if(Math.abs(centsDist) < CENTS_DIST_MAX) {
            // Within distance to target to be valid
            noteInfo.targetNote = targetNote
            noteInfo.centsDist = centsDist
        }
    }

    return (
        <TuningContext value={{ notes, tuningMode, setTuningMode, noteInfo }}>
            {children}
        </TuningContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

export { TuningProvider, TuningContext, useTuning }