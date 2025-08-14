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
const SCALE = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', "A♯/B♭", 'B']
const SHARPS_SCALE = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', "A♯", 'B']
const FLATS_SCALE = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', "B♭", 'B']

// PITCH CONSTANTS
const MIN_OCTAVE = -1 // This aligns with MIDI which has note 0 as C-1
const MAX_OCTAVE = 10

/**
 * @typedef {Object} InstrumentConfig
 * @property {string} instrument instrument key
 * @property {string} tuning tuning of the selected instrument
 */

const INSTRUMENTS = {
    'generic': {
        type: 'generic',
        name: 'Generic Tuner',
        tunings: {
            'standard': {
                name: 'Standard',
                strings: [],
                strings_ids: []
            }
        }
    },
    'guitar': {
        type: 'stringed',
        name: '6-String Guitar',
        tunings: {
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
    },
    // 'bass': {
    //     type: 'stringed',
    //     name: 'Bass Guitar',
    //     tunings: {
    //         '4-string': {
    //             name: '4 String',
    //             strings: ['E1', 'A1', 'D2', 'G2'],
    //             strings_ids: [28, 33, 38, 43]
    //         },
    //         '4-string-tenor': {
    //             name: '4 String Tenor',
    //             strings: ['A1', 'D2', 'G2', 'C3'],
    //             strings_ids: [33, 38, 43, 48]
    //         },
    //         '5-string': {
    //             name: '5 String',
    //             strings: ['B0', 'E1', 'A1', 'D2', 'G2'],
    //             strings_ids: [23, 28, 33, 38, 43]
    //         },
    //         '5-string-tenor': {
    //             name: '5 String Tenor',
    //             strings: ['E1', 'A1', 'D2', 'G2', 'C3'],
    //             strings_ids: [28, 33, 38, 43, 48]
    //         },
    //         '6-string': {
    //             name: '6 String',
    //             strings: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'],
    //             strings_ids: [23, 28, 33, 38, 43, 48]
    //         },
    //     }
    // },
    'bass': {
        type: 'stringed',
        name: '4 String Bass Guitar',
        tunings: {
            'standard': {
                name: 'Standard',
                strings: ['E1', 'A1', 'D2', 'G2'],
                strings_ids: [28, 33, 38, 43]
            },
            'tenor': {
                name: 'Tenor',
                strings: ['A1', 'D2', 'G2', 'C3'],
                strings_ids: [33, 38, 43, 48]
            },
            'drop-d': {
                name: 'Drop D',
                strings: ['D1', 'A1', 'D2', 'G2'],
                strings_ids: [26, 33, 38, 43]
            },
            'bead': {
                name: 'BEAD',
                strings: ['B0', 'E1', 'A1', 'D2'],
                strings_ids: [23, 28, 33, 38]
            },
        }
    },
    '5-string-bass': {
        type: 'stringed',
        name: '5 String Bass Guitar',
        tunings: {
            'standard': {
                name: 'Standard',
                strings: ['B0', 'E1', 'A1', 'D2', 'G2'],
                strings_ids: [23, 28, 33, 38, 43]
            },
            'tenor': {
                name: 'Tenor',
                strings: ['E1', 'A1', 'D2', 'G2', 'C3'],
                strings_ids: [28, 33, 38, 43, 48]
            },
        }
    },
    '6-string-bass': {
        type: 'stringed',
        name: '6 String Bass Guitar',
        tunings: {
            'standard': {
                name: 'Standard',
                strings: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'],
                strings_ids: [23, 28, 33, 38, 43, 48]
            },
        }
    },
    'violin': {
        type: 'stringed',
        name: 'Violin',
        tunings: {
            'standard': {
                name: 'Standard',
                strings: ['G3', 'D4', 'A4', 'E5'],
                strings_ids: [55, 62, 69, 76]
            },
        }
    },

}

// TUNING CONSTANTS
// const TUNINGS = {
//     'standard': {
//         name: 'Standard',
//         strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
//         strings_ids: [40, 45, 50, 55, 59, 64]
//     },
//     'drop-d': {
//         name: 'Drop D',
//         strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
//         strings_ids: [38, 45, 50, 55, 59, 64]
//     },
//     'double-drop-d': {
//         name: 'Double Drop D',
//         strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'D4'],
//         strings_ids: [38, 45, 50, 55, 59, 62]
//     },
//     'open-d': {
//         name: 'Open D',
//         strings: ['D2', 'A2', 'D3', 'F♯3', 'B3', 'D4'],
//         strings_ids: [38, 45, 50, 54, 59, 62]
//     },
//     'open-g': {
//         name: 'Open G',
//         strings: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
//         strings_ids: [38, 43, 50, 55, 59, 62]
//     },
//     'drop-c': {
//         name: 'Drop C',
//         strings: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
//         strings_ids: [36, 43, 48, 53, 57, 62]
//     },
//     'goofy': {
//         name: 'Goofy',
//         strings: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
//         strings_ids: [64, 59, 55, 50, 45, 40]
//     },
// }

// CENTS CONSTANTS
const CENTS_DIST_MAX = Infinity // Max cents distance from target to select it
const CENTS_DIST_IN_TUNE = 0.05
const COUNT_IN_TUNE = 50

export { INSTRUMENTS, A4_ID, MIN_OCTAVE, MAX_OCTAVE, SCALE, SHARPS_SCALE, FLATS_SCALE, CENTS_DIST_MAX, CENTS_DIST_IN_TUNE, COUNT_IN_TUNE }