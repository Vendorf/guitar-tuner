import { useAudioState } from "../../../context/AudioContext"
import { useTuning } from "../../../context/TuningContext"
import WaveformCanvas from "../WaveformCanvas/WaveformCanvas"
import './PitchDisplay.css'

//TODO: make this show up on right somehow

/**
 * Shows optional details for pitch (exact note, waveform, etc)
 * 
 * @param {Object} params 
 * @param {boolean} params.display whether details are shown/hidden
 * @returns 
 */
const PitchDetailDisplay = ({ display }) => {

    const { pitch, clarity, history, updates } = useAudioState()
    const { notes, noteInfo: { midiNote, nearestMidiNote, targetMidiNote, centsDist } } = useTuning()

    const nearestNoteName = notes[nearestMidiNote]?.fullName ?? ""
    const targetNoteName = notes[targetMidiNote]?.fullName ?? ""
    const targetFreq = notes[targetMidiNote]?.frequency ?? 0

    return (
        <div style={{ display: display ? '' : 'none' }}>
            <div className="card">
                <div className="waveform-label">Time Data Waveform</div>
                <WaveformCanvas drawTime={true}></WaveformCanvas>
            </div>
            <div className="card">
                <div className="waveform-label">Frequency Data Waveform</div>
                <WaveformCanvas drawTime={false}></WaveformCanvas>
            </div>
            <div className="card">
                {/* <button onClick={() => started ? stopAudio() : startAudio()}>{started ? "Stop" : "Start"} Audio</button> */}
                <div className="pitch-wrapper">
                    <div className="pitch-label">Pitch:</div> <div className="pitch-value">{Math.round(pitch * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Clarity:</div> <div className="pitch-value">{Math.round(clarity * 100)}%</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note id:</div> <div className="pitch-value">{nearestMidiNote}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note:</div> <div className="pitch-value">{nearestNoteName}</div>
                </div>
            </div>
        
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Target id:</div> <div className="pitch-value">{targetMidiNote}</div>
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
                    <div className="pitch-label">Exact:</div> <div className="pitch-value">{Math.round(midiNote * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Cents:</div> <div className="pitch-value">{Math.round(centsDist * 100) / 100}</div>
                </div>
            </div>

            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Update:</div> <div className="pitch-value">{updates}</div>
                </div>
                <pre style={{ textAlign: 'left' }}>{history.length} {JSON.stringify(history, null, 2)}</pre>
            </div>

        </div>

    )
}

export default PitchDetailDisplay