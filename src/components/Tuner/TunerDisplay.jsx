
import { useTuning } from '../../context/TuningContext'
import { TUNINGS } from '../../constants/tuningConstants'
import './TunerDisplay.css'

const TunerDisplay = () => {

    const { tuningMode, targetNote } = useTuning()
    const strings = TUNINGS[tuningMode].strings

    const targetIdx = TUNINGS[tuningMode].strings_ids.indexOf(targetNote)

    return (
        <>
            <div className='tuner-wrapper card'>
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
        </>
    )

}

export default TunerDisplay