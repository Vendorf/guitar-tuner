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

    const { pitch, clarity, updates } = useAudioState()
    const { notes, noteInfo: { midiNote, nearestMidiNote, targetMidiNote, centsDist }, history } = useTuning()

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
                <div className="waveform-label">Tuning Info</div>
                <table className="tuning-table">
                    <thead>
                        <tr>
                            <th colSpan={2}>Detected</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* <td className="row"><span style={{fontWeight: 'bold'}}>Pitch:</span> {Math.round(pitch * 100) / 100}</td>
                            <td className="row"><span style={{fontWeight: 'bold'}}>Clarity:</span> {Math.round(clarity * 100)}%</td> */}
                            <td className="row">Pitch: <span className="row-detected">{Math.round(pitch * 100) / 100}</span></td>
                            <td className="row">Clarity: <span className="row-detected">{Math.round(clarity * 100)}%</span></td>
                        </tr>
                    </tbody>
                </table>

                <div className="table-spacer"></div>

                <table className="tuning-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Detected</th>
                            <th>Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="row-title">Frequency</td>
                            <td className="row row-detected">{(Math.round(pitch * 100) / 100).toFixed(2)}</td>
                            <td className="row row-target">{(Math.round(targetFreq * 100) / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="row-title">MIDI</td>
                            <td className="row row-detected">{nearestMidiNote} ({(Math.round(midiNote * 100) / 100).toFixed(2)})</td>
                            <td className="row row-target">{targetMidiNote} (Δ={centsDist > 0 && "+"}{(Math.round(centsDist * 100) / 100).toFixed(2)})</td>
                        </tr>
                        <tr>
                            <td className="row-title">Note</td>
                            <td className="row row-detected">{nearestNoteName}</td>
                            <td className="row row-target">{targetNoteName}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: "1em", textAlign: "left" }}>
                    <strong>Update:</strong> {updates}
                    <pre>{history.length} {JSON.stringify(history, null, 2)}</pre>
                </div>
            </div>
        </div>

    )
}

export default PitchDetailDisplay