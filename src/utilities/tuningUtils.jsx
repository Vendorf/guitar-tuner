// See https://en.wikipedia.org/wiki/Scientific_pitch_notation
import { TUNINGS, A4_FREQ, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE } from "../constants/tuningConstants"

// Unused
const initTunings = () => {
    Object.values(TUNINGS).forEach((tuning) => {
        tuning.strings_ids = tuning.strings?.map(note => stringFullNameToId(note))
    })
}

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
const generateNotes = () => {
    const notes = []

    for (let i = 0; i <= (MAX_OCTAVE - MIN_OCTAVE + 1); i++) {
        const octaveNotes = SCALE.map((n, j) => {
            const noteId = (i * SCALE.length) + j
            return {
                id: noteId, // index
                name: n,
                octave: i,
                fullName: `${n}${MIN_OCTAVE + i}`,
                frequency: computeNoteFrequency(noteId)
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
 * @returns {number} frequency of note
 */
const computeNoteFrequency = (note) => {
    // F = F_A4 * 2^(n-A4)/12
    // therefore    note>A4 will be mult (higher freq)
    //              note<A4 will be div (lower freq)
    //              note=A4 will be *1 --> A4
    return A4_FREQ * Math.pow(2, (note - A4_ID) / 12)
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
 */
const getExactNoteFromFrequency = (freq) => {
    return 12 * Math.log2(freq / A4_FREQ) + A4_ID
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
 * @returns closest exact midi note to frequency
 */
const getNearestNoteFromFrequency = (freq) => {
    // n = 12 * log_2(F/F_A4) + A4
    // return 12 * Math.log2(freq / A4_FREQ) + A4_ID
    return toNearestNote(getExactNoteFromFrequency(freq))
}

/**
 * Recomputes note frequencies from midi note values
 * @param {Note[]} notes list of notes
 */
const recomputeFrequencies = (notes) => {
    notes.forEach((n) => {
        n.frequency = computeNoteFrequency(n.id)
    })
}

export {
    generateNotes, computeNoteFrequency, recomputeFrequencies, toNearestNote, getExactNoteFromFrequency, getNearestNoteFromFrequency
}