import { createContext, use, useEffect, useRef, useState } from "react"
import { useAudioState } from "./AudioContext"
import usePitchAnalysis from "../hooks/usePitchAnalysis"
import { generateNotes, getExactNoteFromFrequency, getInstrument, recomputeFrequencies } from "../utilities/tuningUtils"
/** @import { Note } from '../utilities/tuningUtils' */

//// TYPEDEFS /////////////////////////////////////////////////////////////////
/**
 * @typedef {Object} HistoryEntry
 * @property {number} pitch pitch detected by PitchDetector
 * @property {number} clarity clarity (confidence) in pitch detected by PitchDetector
 * @property {number} exactNote midi note with cents (ex: 69.03) for 3 cents above A4
 * @property {Date} time time of history entry
 */
///////////////////////////////////////////////////////////////////////////////

//// CONSTANTS ////////////////////////////////////////////////////////////////
const HISTORY_SIZE = 1000
///////////////////////////////////////////////////////////////////////////////

const TuningContext = createContext(undefined)

/**
 * Provider for all tuning state via TuningContext
 * @param {Object} param
 * @param {Object} param.children children to render inside provider with access to this context
 * @returns 
 */
const TuningProvider = ({ children }) => {
    const { pitch, clarity } = useAudioState()

    const swappedTargetNotesRef = useRef(false)

    const [a4Freq, setA4Freq] = useState(440)
    const [notes, setNotes] = useState(/** @type {Note[]} */([]))
    const [instrConfig, setInstrConfig] = useState({ instrument: 'guitar', tuning: 'standard' })
    const [notesTuned, setNotesTuned] = useState(new Set())

    const [history, setHistory] = useState(/** @type {HistoryEntry[]} */([]))
    const resetHistory = () => {
        setHistory([])
    }

    useEffect(() => {
        setHistory((oldHist) => {
            const newHistory = [...oldHist, {
                pitch: pitch,
                clarity: clarity,
                exactNote: getExactNoteFromFrequency(pitch, a4Freq),
                time: (new Date()),
                // timeDataRange: [Math.min(...audioTimeData), Math.max(...audioTimeData)],
                // freqDataRange: [Math.min(...audioFrequencyData), Math.max(...audioFrequencyData)],
            }]
            if (newHistory.length > HISTORY_SIZE) {
                newHistory.shift()
            }
            return newHistory
        })
    }, [pitch, clarity])

    // useEffect(() => {
    //     const n = generateNotes(a4Freq)
    //     setNotes(n)
    //     console.log('set notes', n)
    // }, [])

    // Recompute frequencies whenever A4 changes
    useEffect(() => {
        if (notes.length === 0) {
            const n = generateNotes(a4Freq)
            setNotes(n)
        } else {
            recomputeFrequencies(notes, a4Freq)
            setNotes([...notes])
        }

    }, [a4Freq])

    useEffect(() => {
        // Reset tuning
        setNotesTuned(new Set())
        resetHistory()
        //TODO: currently use notesTuned.targetNote to highlight the current note
        // when we swap therefore that is unaffected as the pitch stays the same
        // so need some way to tell it to give default analysis on a swap
        // honestly it's okay the way it is now too tho so idk just a UX choice
        // lastTargetNoteRef.current = -1
    }, [instrConfig])

    /**
     * Adds note to currently stored tuned note set
     * @param {number} note midi note index
     */
    const addTunedNote = (note) => {
        if (!notesTuned.has(note)) {
            //TODO play sound effect
            setNotesTuned((new Set(notesTuned)).add(note))
        }
    }

    const handleTargetChanged = () => {
        // Setup for useEffect to pick this up
        // This is so we avoid doing state updates during the render phase
        swappedTargetNotesRef.current = true
    }

    const noteInfo = usePitchAnalysis({ pitch, a4Freq, instrConfig, onNoteTuned: addTunedNote, onTargetChanged: handleTargetChanged })

    // if(noteInfo.targetMidiNote !== lastTargetNoteRef.current) {
    //     // Target note switched, so reset our history'
    //     lastTargetNoteRef.current = noteInfo.targetMidiNote
    //     swappedTargetNotesRef.current = true
    // }

    // Runs every time, but after tree is rendered, to prevent changing state during render phase
    // TODO: bc it's just an object.is check can just define a non-state constant and compare that way
    // so const targetNote = analysis?.targetNote ?? null, and then do useEffect(..., [targetNote]) and that will scope to just when
    // the target changes, then don't need the swappedTarget at all
    useEffect(() => {
        if (swappedTargetNotesRef.current) {
            swappedTargetNotesRef.current = false
            resetHistory()
            // console.log("reset hist")

            // TODO: is there a less shitty way to write this cause I feel it's ass to hardcode instruments here
            if (getInstrument(instrConfig)[0].type === 'generic') {
                // We want to reset which notes are tuned every time for a generic instrument
                setNotesTuned(new Set())
            }
        }
    })

    return (
        <TuningContext value={{ a4Freq, setA4Freq, notes, instrConfig, setInstrConfig, notesTuned, noteInfo, history, resetHistory }}>
            {children}
        </TuningContext>
    )
}

const useTuning = () => {
    return use(TuningContext)
}

export { TuningProvider, TuningContext, useTuning }