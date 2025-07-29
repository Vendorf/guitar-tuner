import { useMemo, useRef } from "react"
import { getExactNoteFromFrequency, toNearestNote } from "../utilities/tuningUtils"
import { CENTS_DIST_IN_TUNE, CENTS_DIST_MAX, COUNT_IN_TUNE } from "../constants/tuningConstants"

// const defaultNoteInfo = {
//     note: -1,
//     nearestNote: -1,
//     targetNote: -1,
//     centsDist: 0,
//     atTargetCount: 0
// }

/**
 * Performs pitch analysis to get note info on the current note/when it's in tune/etc
 * @param {*} param0 pitch, currTuning (TUNINGS[tuningMode]), onNoteTuned
 * @returns note, nearestNote, targetNote, centsDist
 */
const usePitchAnalysis = ({ pitch, currTuning, onNoteTuned }) => {

    const atTargetCountRef = useRef(0) // count of updates that pitch is at target
    const lastTargetNoteRef = useRef(-1) // last target note that were at

    // Whenever pitch/tuning mode change, update analysis
    const analysis = useMemo(() => {
        // If no pitch, analysis is empty
        //TODO: or use old vals?
        if (pitch <= 0) {
            //TODO: this would be bad (maybe?) if it happened during actual tuning if we somehow got a pitch=0
            //but it seems it only happens on the first iteration when initializing and never again, so I think this is fine
            return { note: -1, nearestNote: -1, targetNote: -1, centsDist: 0 }
        }

        const note = getExactNoteFromFrequency(pitch)
        const nearestNote = toNearestNote(note)

        const tuningNotes = currTuning?.strings_ids ?? []
        const targetDistances = tuningNotes.map(n => Math.abs(n - nearestNote))
        const targetIdx = targetDistances.indexOf(Math.min(...targetDistances))
        const targetNote = tuningNotes[targetIdx]

        const centsDist = note - targetNote
        const magnitudeCentsDist = Math.abs(centsDist)

        // Do tuning updates
        if (magnitudeCentsDist < CENTS_DIST_MAX) {
            // Within distance to target to be valid, so select a note as the target
            if (lastTargetNoteRef.current !== targetNote) {
                // Reset target count if a new target
                atTargetCountRef.current = 0
                lastTargetNoteRef.current = targetNote
            }

            // Update target note count if we are in tune for the necessary period
            if (magnitudeCentsDist <= CENTS_DIST_IN_TUNE) {
                atTargetCountRef.current++
                // Check if we are in tune
                if (atTargetCountRef.current >= COUNT_IN_TUNE) {
                    // This note is tuned
                    onNoteTuned?.(targetNote)
                }
            } else {
                // Count a bad pitch against the total, but don't completely remove in case it's a slight fluke
                const decay = 3

                atTargetCountRef.current = Math.max(0, atTargetCountRef.current - decay)
            }
        }

        return { note, nearestNote, targetNote, centsDist }
    }, [pitch, currTuning])

    return analysis
}

export default usePitchAnalysis


// Could do this if analysis doesn't change as often somehow...
// useEffect(() => {
//     if (!analysis) return

//     const { targetNote, centsDist } = analysis

//     if (Math.abs(centsDist) < CENTS_DIST_MAX) {
//         if (lastTargetNoteRef.current !== targetNote) {
//             atTargetCountRef.current = 0
//             lastTargetNoteRef.current = targetNote
//         }

//         if (Math.abs(centsDist) <= CENTS_DIST_IN_TUNE) {
//             atTargetCountRef.current++
//             if (
//                 atTargetCountRef.current >= COUNT_IN_TUNE &&
//                 !notesTuned.includes(targetNote)
//             ) {
//                 onNoteTuned?.(targetNote)
//             }
//         } else {
//             // Decay count
//             atTargetCountRef.current = Math.max(0, atTargetCountRef.current - 2)
//         }
//     }
// }, [analysis, notesTuned, onNoteTuned])