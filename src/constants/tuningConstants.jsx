// See https://en.wikipedia.org/wiki/Scientific_pitch_notation

//TODO: group all below into some sort of global single store object so can edit the values and shit
// and also store notes inside of it etc
// but then really move into a context ig so we get proper state updates too.....

// TODO: if wanna be able to do different scales and shit in the future, would need to be able to change from A4
// as the center; would just need to be able to select which note wanna do and then adjust accordingly
// also tho different math prolly based on scale size, equal temperament, etc; would prolly just store
// scale info in some global including conversion functions and just have a 'selected scale' object and reference
// that to call conversion funcs etc
// NOTE CONSTANTS
const A4_ID = 69
const A4_FREQ = 440 // set by user
const SCALE = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', "A♯/B♭", 'B']

// PITCH CONSTANTS
const MIN_OCTAVE = -1 // This aligns with MIDI which has note 0 as C-1
const MAX_OCTAVE = 9

// TUNING CONSTANTS
const TUNINGS = {
    'standard': {
        name: 'Standard',
        strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        strings_ids: [40, 45, 50, 55, 59, 64]
    },
    'drop-d': {
        name: 'Drop D',
        strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        strings_ids: [38, 45, 50, 55, 59, 64]
    },
    'double-drop-d': {
        name: 'Double Drop D',
        strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'D4'],
        strings_ids: [38, 45, 50, 55, 59, 62]
    },
    'open-d': {
        name: 'Open D',
        strings: ['D2', 'A2', 'D3', 'F♯3', 'B3', 'D4'],
        strings_ids: [38, 45, 50, 54, 59, 62]
    },
    'open-g': {
        name: 'Open G',
        strings: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
        strings_ids: [38, 43, 50, 55, 59, 62]
    },
    'drop-c': {
        name: 'Drop C',
        strings: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
        strings_ids: [36, 43, 48, 53, 57, 62]
    },
    'goofy': {
        name: 'Goofy',
        strings: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
        strings_ids: [64, 59, 55, 50, 45, 40]
    },
}

// CENTS CONSTANTS
const CENTS_DIST_MAX = Infinity // Max cents distance from target to select it
const CENTS_DIST_IN_TUNE = 0.05
const COUNT_IN_TUNE = 50

export { TUNINGS, A4_FREQ, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE, CENTS_DIST_MAX, CENTS_DIST_IN_TUNE, COUNT_IN_TUNE }