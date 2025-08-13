// See https://en.wikipedia.org/wiki/Scientific_pitch_notation
import { A4_FREQ, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE, INSTRUMENTS } from "../constants/tuningConstants"

// Unused
// const initTunings = () => {
//     Object.values(TUNINGS).forEach((tuning) => {
//         tuning.strings_ids = tuning.strings?.map(note => stringFullNameToId(note))
//     })
// }

// Unused
// const stringFullNameToId = (fullname) => {
//     // Grab octave off end
//     // Replace # with ♯
//     // Find index in scale
//     // Compute index in all octaves
//     return 0
// }

/**
 * @typedef {Object} Note
 * @property {number} id midi note index
 * @property {string} name note name from scale
 * @property {number} octave note octave
 * @property {string} fullName note name + octave
 * @property {number} frequency frequency of midi note 
 */

/**
 * Generates list of all midi notes from MIN_OCTAVE to MAX_OCTAVE with the current SCALE
 * @returns {Note[]} list of notes containing {id (midi note/index), name, octave, fullName (name + octave)}
 */
const generateNotes = (a4Freq = 440) => {
    const notes = []

    for (let i = 0; i <= (MAX_OCTAVE - MIN_OCTAVE + 1); i++) {
        const octaveNotes = SCALE.map((n, j) => {
            //TODO: redo this so it's actually always MIDI index regardless of scale size
            const noteId = (i * SCALE.length) + j
            return {
                id: noteId, // midi index
                name: n,
                octave: MIN_OCTAVE + i,
                fullName: `${n}${MIN_OCTAVE + i}`,
                frequency: computeNoteFrequency(noteId, a4Freq)
            }
        })

        // Append all
        notes.push(...octaveNotes)
    }

    console.log(notes)

    return notes
}

/**
 * Computes note frequency from midi note with cents
 * @param {number} note midi note
 * @param {number} a4Freq frequency of a4 (default 440Hz)
 * @returns {number} frequency of note
 */
const computeNoteFrequency = (note, a4Freq = 440) => {
    // F = F_A4 * 2^(n-A4)/12
    // therefore    note>A4 will be mult (higher freq)
    //              note<A4 will be div (lower freq)
    //              note=A4 will be *1 --> A4
    return a4Freq * Math.pow(2, (note - A4_ID) / 12)
}

/**
 * Gets midi note with cents
 * 
 * Each MIDI note is 1 semitone
 * There are 100 cents in a semitone
 * Cents are logarithmic
 * 
 * Therefore standard logarithm note --> frequency conversion the fractional part is the cents
 * @param {number} freq 
 * @param {number} a4Freq frequency of A4 (default 440 Hz)
 */
const getExactNoteFromFrequency = (freq, a4Freq = 440) => {
    return 12 * Math.log2(freq / a4Freq) + A4_ID
}

/**
 * Gets closest exact midi note from midi note with cents
 * @param {number} note midi note with cents
 * @returns nearest exact midi note
 */
const toNearestNote = (note) => {
    return Math.round(note)
}

/**
 * Gets closest exact midi note from raw frequency
 * @param {number} freq frequency
 * @param {number} a4Freq frequency of A4 (default 440 Hz)
 * @returns closest exact midi note to frequency
 */
const getNearestNoteFromFrequency = (freq, a4Freq = 440) => {
    // n = 12 * log_2(F/F_A4) + A4
    // return 12 * Math.log2(freq / A4_FREQ) + A4_ID
    return toNearestNote(getExactNoteFromFrequency(freq, a4Freq))
}

/**
 * Recomputes note frequencies from midi note values
 * @param {Note[]} notes list of notes
 * @param {number} a4Freq frequency of A4 (default 440 Hz)
 */
const recomputeFrequencies = (notes, a4Freq = 440) => {
    notes.forEach((n) => {
        n.frequency = computeNoteFrequency(n.id, a4Freq)
    })
}

const getInstrument = (config) => {
    return [INSTRUMENTS[config.instrument], INSTRUMENTS[config.instrument]?.tunings[config.tuning]]
}

const getTargetMidiNote = (instrConfig, midiNote) => {
    const [instr, tuning] = getInstrument(instrConfig)
    switch (instr.type) {
        case 'generic': {
            // Get closest note
            const targetMidiNote = toNearestNote(midiNote)
            return targetMidiNote
        }
        case 'stringed': {
            // Get closest note from instrument's strings
            const tuningMidiNotes = tuning?.strings_ids ?? []
            const targetDistances = tuningMidiNotes.map(n => Math.abs(n - midiNote))
            const targetIdx = targetDistances.indexOf(Math.min(...targetDistances))
            const targetMidiNote = tuningMidiNotes[targetIdx]
            return targetMidiNote
        }
    }
}

export { generateNotes, computeNoteFrequency, recomputeFrequencies, toNearestNote, getExactNoteFromFrequency, getNearestNoteFromFrequency, getTargetMidiNote, getInstrument }