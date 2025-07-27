import { useAudio } from "../context/AudioContext"
import { useTuning } from "../context/TuningContext"
import './PitchDisplay.css'
import WaveformCanvas from "./WaveformCanvas/WaveformCanvas"

const PitchDisplay = () => {

    const { pitch, clarity, started, startAudio, stopAudio, killAudio, history, updates } = useAudio()
    const { notes, tuningMode, setTuningMode, noteInfo: {nearestNote, targetNote, note, centsDist} } = useTuning()

    const nearestNoteName = notes[nearestNote]?.fullName ?? ""
    const targetNoteName = notes[targetNote]?.fullName ?? ""
    const targetFreq = notes[targetNote]?.frequency ?? 0

    // console.log(updates, history)

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
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Exact:</div> <div className="pitch-value">{Math.round(note * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Cents:</div> <div className="pitch-value">{Math.round(centsDist * 100) / 100}</div>
                </div>
            </div>
            <div className="card">
                <WaveformCanvas></WaveformCanvas>
            </div>
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Update:</div> <div className="pitch-value">{updates}</div>
                </div>
                <pre style={{color: 'black', textAlign: 'left'}}>{JSON.stringify(history, null, 2)}</pre>
            </div>

        </>

    )
}

export default PitchDisplay