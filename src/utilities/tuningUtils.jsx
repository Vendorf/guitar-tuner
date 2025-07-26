// See https://en.wikipedia.org/wiki/Scientific_pitch_notation
import { TUNINGS, A4_FREQ, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE } from "../constants/tuningConstants"

const initTunings = () => {
    Object.values(TUNINGS).forEach((tuning) => {
        tuning.strings_ids = tuning.strings?.map(note => stringFullNameToId(note))
    })
}

const stringFullNameToId = (fullname) => {
    // Grab octave off end

    // Replace # with ♯

    // Find index in scale

    // Compute index in all octaves

    return 0
}

const generateNotes = () => {
    const notes = [];

    for (let i = 0; i <= (MAX_OCTAVE - MIN_OCTAVE + 1); i++) {
        const octaveNotes = SCALE.map((n, j) => {
            return {
                id: (i * SCALE.length) + j, // index
                name: n,
                octave: i,
                fullName: `${n}${MIN_OCTAVE + i}`
                // freq: TODO
            };
        });

        // Append all
        notes.push(...octaveNotes)
    }

    console.log(notes)

    return notes
};
const computeNoteFrequency = (note, notes) => {
    // F = F_A4 * 2^(n-A4)/12
    // therefore    note>A4 will be mult (higher freq)
    //              note<A4 will be div (lower freq)
    //              note=A4 will be *1 --> A4
    return A4_FREQ * Math.pow(2, (note - A4_ID) / 12)
}

/**
 * Gets note with cents
 * 
 * Each MIDI note is 1 semitone
 * There are 100 cents in a semitone
 * Cents are logarithmic
 * 
 * Therefore standard logarithm note --> frequency conversion the fractional part is the cents
 * @param {*} freq 
 */
const getExactNoteFromFrequency = (freq) => {
    return 12 * Math.log2(freq / A4_FREQ) + A4_ID
}

const toNearestNote = (note) => {
    return Math.round(note)
}

const getNearestNoteFromFrequency = (freq) => {
    // n = 12 * log_2(F/F_A4) + A4
    // return 12 * Math.log2(freq / A4_FREQ) + A4_ID
    return toNearestNote(getExactNoteFromFrequency(freq))
}

const recomputeFrequencies = (notes) => {
    notes.forEach((n) => {
        n.frequency = computeNoteFrequency(n.id, notes)
    })
}

//TODO this kidna sucks have to run explicitly, maybe can construct better idk
// initTunings()
// TEMP_STORAGE.notes = generateNotes()
// recomputeFrequencies(TEMP_STORAGE.notes)

export {
    generateNotes, computeNoteFrequency, recomputeFrequencies, toNearestNote, getExactNoteFromFrequency, getNearestNoteFromFrequency
}