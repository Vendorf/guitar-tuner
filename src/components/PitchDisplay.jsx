import { useAudio } from "../context/AudioContext"
import { useTuning } from "../context/TuningContext"
// import { getNearestNoteFromFrequency } from "../utilities/tuner"
import './PitchDisplay.css'

const PitchDisplay = () => {

    const { pitch, clarity, started, startAudio, stopAudio, killAudio } = useAudio()
    const { notes, tuningMode, setTuningMode, nearestNote, targetNote } = useTuning()

    const nearestNoteName = notes[nearestNote]?.fullName ?? ""
    const targetNoteName = notes[targetNote]?.fullName ?? ""

    const targetFreq = notes[targetNote]?.frequency ?? 0
    // const note_id = pitch > 0 ? getNearestNoteFromFrequency(pitch) : "-"
    // const note = TEMP_STORAGE.notes[note_id]?.fullName ?? ""


    return (
        <>
            <div className="card">
                {/* <button onClick={startAudio}>Resume audio</button> */}
                <button onClick={() => started ? stopAudio() : startAudio()}>{started ? "Stop" : "Start"} Audio</button>

                <div className="pitch-wrapper">
                    <div className="pitch-label">Pitch:</div> <div className="pitch-value">{Math.round(pitch * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Clarity:</div> <div className="pitch-value">{Math.round(clarity * 100)}%</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note id:</div> <div className="pitch-value">{nearestNote}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note:</div> <div className="pitch-value">{nearestNoteName}</div>
                </div>
            </div>
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Target id:</div> <div className="pitch-value">{targetNote}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Target:</div> <div className="pitch-value">{targetNoteName}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Freq:</div> <div className="pitch-value">{Math.round(targetFreq * 100) / 100}</div>
                </div>
            </div>
        </>

    )
}

export default PitchDisplay