// Everything for now lmao ig


import { createContext, use, useEffect, useState } from "react";
import { useAudio } from "./AudioContext";
import { generateNotes, recomputeFrequencies, getNearestNoteFromFrequency, getExactNoteFromFrequency, toNearestNote } from "../utilities/tuningUtils";
import { CENTS_DIST_IN_TUNE, CENTS_DIST_MAX, COUNT_IN_TUNE, TUNINGS } from "../constants/tuningConstants";

const defaultNoteInfo = {
    note: -1,
    nearestNote: -1,
    targetNote: -1,
    centsDist: 0,
    atTargetCount: 0
}

const TuningContext = createContext(undefined)

// why is this written like SUCH ASS OMFG

/**
 * Provides all tuning state
 * @param {*} param0 
 * @returns 
 */
const TuningProvider = ({ children }) => {
    const { pitch } = useAudio()

    const [notes, setNotes] = useState([])
    const [tuningMode, setTuningMode] = useState("standard")
    const [notesTuned, setNotesTuned] = useState([])
    const [noteInfo, setNoteInfo] = useState({...defaultNoteInfo})

    useEffect(() => {
        const n = generateNotes()
        recomputeFrequencies(n)
        setNotes(n)
    }, [])

    useEffect(() => {
        // Reset tuning
        setNotesTuned([])
        setNoteInfo({...defaultNoteInfo})
    }, [tuningMode])

    // useEffect(() => {
    //     // Check if we are in tune
    //     if (currTarget.count >= COUNT_IN_TUNE) {
    //         // This note is tuned
    //         setNotesTuned([...notesTuned, currTarget.note])
    //         console.log("tuned", currTarget)
    //     }
    // }, [currTarget])

    // On pitch change, recompute the closest and target

    //TODO: something to reset after X seconds or smthng else when haven't played for a while, etc?
    // const noteInfo = {
    //     note: -1,
    //     nearestNote: -1,
    //     targetNote: -1,
    //     centsDist: 0
    // }

    useEffect(() => {
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
            if (Math.abs(centsDist) < CENTS_DIST_MAX) {
                // Within distance to target to be valid, so select a note as the target

                if (noteInfo.targetNote !== targetNote) {
                    // console.log('new target')
                    // Reset target count if a new target
                    noteInfo.atTargetCount = 0
                }
                noteInfo.targetNote = targetNote
                noteInfo.centsDist = centsDist

                // Update target note count if we are in tune for the necessary period
                if (noteInfo.centsDist <= CENTS_DIST_IN_TUNE) {
                    noteInfo.atTargetCount++
                    // Check if we are in tune
                    if (noteInfo.atTargetCount >= COUNT_IN_TUNE) {
                        // This note is tuned
                        setNotesTuned([...notesTuned, noteInfo.targetNote])
                        // console.log("tuned", noteInfo)
                    }
                } else {
                    // console.log("eek", noteInfo)
                    // Count a bad pitch against the total, but don't completely remove in case it's a slight fluke
                    noteInfo.atTargetCount -= 3
                    if(noteInfo.atTargetCount < 0) {
                        noteInfo.atTargetCount = 0
                    }

                    //TODO: restore? for now, only reset when we change target notes
                    // noteInfo.atTargetCount = 0
                }
            }

            // Update noteInfo
            setNoteInfo({ ...noteInfo })

        }
    }, [pitch])


    return (
        <TuningContext value={{ notes, tuningMode, setTuningMode, noteInfo, notesTuned }}>
            {children}
        </TuningContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

export { TuningProvider, TuningContext, useTuning }