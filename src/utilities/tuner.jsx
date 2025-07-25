// See https://en.wikipedia.org/wiki/Scientific_pitch_notation

// TODO: if wanna be able to do different scales and shit in the future, would need to be able to change from A4
// as the center; would just need to be able to select which note wanna do and then adjust accordingly
// also tho different math prolly based on scale size, equal temperament, etc; would prolly just store
// scale info in some global including conversion functions and just have a 'selected scale' object and reference
// that to call conversion funcs etc
const A4_ID = 69
const A4_FREQ = 440 // set by user

const MIN_OCTAVE = -1 // This aligns with MIDI which has note 0 as C-1
const MAX_OCTAVE = 9
// const SCALE = ['A', "A♯", 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯'];
const SCALE = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', "A♯/B♭", 'B']

const TUNINGS = {
    'standard': {
        strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        strings_ids: [40, 45, 50, 55, 59, 64]
    },
    'drop-d': {
        //TODO
    }
}

// const TEMP_STORAGE = {}

//TODO: group all above into some sort of global single store object so can edit the values and shit
// and also store notes inside of it etc
// but then really move into a context ig so we get proper state updates too.....

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

//const SCALES = {} //TODO

//TODO: utility
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

const getNearestNoteFromFrequency = (freq) => {
    // n = 12 * log_2(F/F_A4) + A4
    // return 12 * Math.log2(freq / A4_FREQ) + A4_ID
    return Math.round(12 * Math.log2(freq / A4_FREQ) + A4_ID)
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
    generateNotes, computeNoteFrequency, recomputeFrequencies, getNearestNoteFromFrequency,
    TUNINGS, A4_FREQ, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE//, TEMP_STORAGE
}