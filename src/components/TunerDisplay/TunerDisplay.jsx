
import { useTuning } from '../../context/TuningContext'
import { TUNINGS } from '../../constants/tuningConstants'
import './TunerDisplay.css'
import TuningSelector from '../TuningSelector/TuningSelector'

const TunerDisplay = () => {

    const { tuningMode, noteInfo: { targetNote: targetNote } } = useTuning()
    const strings = TUNINGS[tuningMode].strings

    const targetIdx = TUNINGS[tuningMode].strings_ids.indexOf(targetNote)

    return (
        <div className='tuner-display-container card'>
            <TuningSelector></TuningSelector>
            <div className='tuner-peg-container'>
                {/* {strings.map((s, i) => {
                    i == targetIdx
                    ? <div className='tuner-peg tuner-peg-activated'>{s}</div>
                    : <div className='tuner-peg'>{s}</div>
                })} */}
                {strings.map((s, i) => (
                    <div key={i} className={`tuner-peg ${i == targetIdx ? 'tuner-peg-activated' : ''}`}>{s}</div>
                    // <div className={`tuner-peg`}>{s}</div>
                ))}
            </div>
            
        </div>
    )

}

export default TunerDisplay