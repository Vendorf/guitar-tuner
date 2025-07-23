import { useAudio } from "../context/AudioContext"
import './PitchDisplay.css'

const PitchDisplay = () => {

    const { pitch, clarity, started, startAudio, stopAudio, killAudio } = useAudio()


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
        </div>
    )
}

export default PitchDisplay