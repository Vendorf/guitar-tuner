// Everything for now lmao ig


import { createContext, use, useEffect, useState } from "react";
import { useAudio } from "./AudioContext";
import { generateNotes, recomputeFrequencies, getNearestNoteFromFrequency, getExactNoteFromFrequency, toNearestNote } from "../utilities/tuningUtils";
import { CENTS_DIST_IN_TUNE, CENTS_DIST_MAX, COUNT_IN_TUNE, TUNINGS } from "../constants/tuningConstants";

const NoteContext = createContext(undefined)

// why is this written like SUCH ASS OMFG

/**
 * Provides all tuning state
 * @param {*} param0 
 * @returns 
 */
const NoteProvider = ({ children }) => {
    const { pitch } = useAudio()



    if (pitch > 0) {
        const note = getExactNoteFromFrequency(pitch)
        const nearestNote = toNearestNote(note)

        noteInfo.note = note
        noteInfo.nearestNote = nearestNote
    }

    return (
        <NoteContext value={{  }}>
            {children}
        </NoteContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

// export { TuningProvider, TuningContext, useTuning }