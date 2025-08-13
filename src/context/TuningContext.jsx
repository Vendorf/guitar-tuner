import { createContext, use, useEffect, useRef, useState } from "react"
import { useAudioState } from "./AudioContext"
import { generateNotes, getExactNoteFromFrequency, getInstrument, recomputeFrequencies } from "../utilities/tuningUtils"
import usePitchAnalysis from "../hooks/usePitchAnalysis"
import usePrevious from "../hooks/usePrevious"
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
    const prevInstrConfig = usePrevious(instrConfig)
    const [notesTuned, setNotesTuned] = useState(new Set())

    const [history, setHistory] = useState(/** @type {HistoryEntry[]} */([]))
    const resetHistory = () => {
        setHistory([])
    }

    useEffect(() => {
        //NOTE: turns out this wasn't really a bug just audio data delayed until after audio stopped playing lol
        //could actually 'fix' it by tracking a logical/vector clock a la Raft and incrementing every reset event
        //then the pitch detection attaches a timestamp to each detection and sends along so we can discard old ones
        // altho maybe that doesn't work cuz technically the detection is coming in later.... maybe we can extract a real
        // time for the audio and then check against last reset time to check if we should discard
        //in any case problem isn't here
        // or could also look at why updates even coming in that late and can advance to real time or smthng idk
        if (instrConfig !== prevInstrConfig) {
            // Instrument config changed, so need to reset
            // Reset tuning
            setNotesTuned(new Set())
            resetHistory()
            // console.log(`reset hist ${Date.now()}`)
        } else {
            setHistory((oldHist) => {
                // console.log(`set hist ${oldHist.length} ${Date.now()}`)
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
        }
    }, [pitch, clarity, instrConfig])

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

    // useEffect(() => {
    //     // Reset tuning
    //     setNotesTuned(new Set())
    //     resetHistory()
    //     console.log('reset')
    //     //TODO: currently use notesTuned.targetNote to highlight the current note
    //     // when we swap therefore that is unaffected as the pitch stays the same
    //     // so need some way to tell it to give default analysis on a swap
    //     // honestly it's okay the way it is now too tho so idk just a UX choice
    //     // lastTargetNoteRef.current = -1
    // }, [instrConfig])

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

    // Runs every time, but after tree is rendered, to prevent changing state during render phase
    // TODO: bc it's just an object.is check can just define a non-state constant and compare that way
    // so const targetNote = analysis?.targetNote ?? null, and then do useEffect(..., [targetNote]) and that will scope to just when
    // the target changes, then don't need the swappedTarget at all
    useEffect(() => {
        if (swappedTargetNotesRef.current) {
            swappedTargetNotesRef.current = false
            resetHistory()

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