import { useAudio } from "../context/AudioContext"
import { getNearestNoteFromFrequency, TEMP_STORAGE } from "../utilities/tuner"
import './PitchDisplay.css'

const PitchDisplay = () => {

    const { pitch, clarity, started, startAudio, stopAudio, killAudio } = useAudio()

    const note_id = pitch > 0 ? getNearestNoteFromFrequency(pitch) : "-"
    const note = TEMP_STORAGE.notes[note_id]?.fullName ?? ""


    return (
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
                <div className="pitch-label">Note id:</div> <div className="pitch-value">{note_id}</div>
            </div>
            <div className="pitch-wrapper">
                <div className="pitch-label">Note:</div> <div className="pitch-value">{note}</div>
            </div>

        </div>
    )
}

export default PitchDisplay