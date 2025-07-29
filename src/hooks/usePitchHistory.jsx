import { useEffect, useMemo, useRef } from "react"
import { getExactNoteFromFrequency } from "../utilities/tuningUtils"

//TODO can't use this rn due to how AudioContext is formatted with update inside of updatePitch()
// maybe can refactor somehow to make it work decent

const HISTORY_SIZE = 1000 //50


// UNUSED
const usePitchHistory = ({ pitch, clarity }) => {

    const historyRef = useRef([])

    const resetHistory = () => {
        historyRef.current = []
    }

    // On pitch change, update history
    // const currHistory = useMemo(() => {
    //     historyRef.current.push({
    //         pitch: pitch,
    //         clarity: clarity,
    //         exactNote: getExactNoteFromFrequency(pitch),
    //         time: (new Date())
    //     })

    //     if (historyRef.current.length > HISTORY_SIZE) {
    //         historyRef.current.shift()
    //     }

    //     return historyRef.current
    // }, [pitch])

    // Append every time called
    historyRef.current.push({
        pitch: pitch,
        clarity: clarity,
        exactNote: getExactNoteFromFrequency(pitch),
        time: (new Date())
    })

    if (historyRef.current.length > HISTORY_SIZE) {
        historyRef.current.shift()
    }

    return { currHistory, resetHistory }
}

export default usePitchHistory