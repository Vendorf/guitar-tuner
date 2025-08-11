import { useMemo, useRef } from "react"
import { getExactNoteFromFrequency, getTargetMidiNote, toNearestNote } from "../utilities/tuningUtils"
import { CENTS_DIST_IN_TUNE, CENTS_DIST_MAX, COUNT_IN_TUNE } from "../constants/tuningConstants"
// import { useAudioControls } from "../context/AudioContext"

// TODO: deselect target after interval
// maybe do this in the context instead? idk

/**
 * Performs pitch analysis to get note info on the current note/when it's in tune/etc
 * 
 * Memoizes analysis so unchanged pitch/tuning does not redo analysis
 * @param {Object} param
 * @param {number} param.pitch current pitch from PitchDetector
 * @param {Object} param.instrConfig current instrument configuration
 * @param {(number) => void} param.onNoteTuned callback for when a note is considered in tune with the target note
 * @param {(void) => void} param.onTargetChanged callback for when target note that tuning towards changed
 * @returns {Object} note, nearestNote, targetNote, centsDist
 */
const usePitchAnalysis = ({ pitch, instrConfig, onNoteTuned, onTargetChanged }) => {
    // const { resetHistory } = useAudioControls()

    const atTargetCountRef = useRef(0) // count of updates that pitch is at target
    const lastTargetMidiNoteRef = useRef(-1) // last target note that were at

    // Whenever pitch/tuning mode change, update analysis
    const analysis = useMemo(() => {
        // If no pitch, analysis is empty
        //TODO: or use old vals?
        if (pitch <= 0) {
            //TODO: this would be bad (maybe?) if it happened during actual tuning if we somehow got a pitch=0
            //but it seems it only happens on the first iteration when initializing and never again, so I think this is fine
            return { midiNote: -1, nearestMidiNote: -1, targetMidiNote: -1, centsDist: 0, inTune: false }
        }

        const midiNote = getExactNoteFromFrequency(pitch)
        const nearestMidiNote = toNearestNote(midiNote)
        const targetMidiNote = getTargetMidiNote(instrConfig, midiNote)

        ///// extract to instrument.getTargetMidiNote()
        // const tuningMidiNotes = currTuning?.strings_ids ?? []
        // const targetDistances = tuningMidiNotes.map(n => Math.abs(n - nearestMidiNote))
        // const targetIdx = targetDistances.indexOf(Math.min(...targetDistances))
        // const targetMidiNote = tuningMidiNotes[targetIdx]
        ////

        const centsDist = midiNote - targetMidiNote
        const magnitudeCentsDist = Math.abs(centsDist)

        //TODO extract as tuningUtil function
        const inTune = (magnitudeCentsDist <= CENTS_DIST_IN_TUNE)

        // Do tuning updates
        if (magnitudeCentsDist < CENTS_DIST_MAX) {
            // Within distance to target to be valid, so select a note as the target
            if (lastTargetMidiNoteRef.current !== targetMidiNote) {
                // Reset target count if a new target
                atTargetCountRef.current = 0
                lastTargetMidiNoteRef.current = targetMidiNote

                onTargetChanged?.()
            }

            // Update target note count if we are in tune for the necessary period
            if (inTune) {
                atTargetCountRef.current++
                // Check if we are in tune
                if (atTargetCountRef.current >= COUNT_IN_TUNE) {
                    // This note is tuned
                    onNoteTuned?.(targetMidiNote)
                }
            } else {
                // Count a bad pitch against the total, but don't completely remove in case it's a slight fluke
                const decay = 3

                atTargetCountRef.current = Math.max(0, atTargetCountRef.current - decay)
            }
        }

        return { midiNote, nearestMidiNote, targetMidiNote, centsDist, inTune }
    }, [pitch, instrConfig])

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