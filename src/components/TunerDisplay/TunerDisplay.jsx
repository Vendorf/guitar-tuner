
import { useTuning } from '../../context/TuningContext'
import { TUNINGS } from '../../constants/tuningConstants'
import './TunerDisplay.css'
import TuningSelector from '../TuningSelector/TuningSelector'

/**
 * Display for tuning pegs based on the current tuning
 * 
 * Highlights current target note from the tuning and shows notes that have been tuned
 * @returns 
 */
const TunerDisplay = () => {
    const { tuningMode, noteInfo: { targetNote }, notesTuned } = useTuning()
    const strings = TUNINGS[tuningMode].strings

    const targetIdx = TUNINGS[tuningMode].strings_ids.indexOf(targetNote)

    return (
        <div className='tuner-display-container card'>
            <TuningSelector></TuningSelector>
            <div className='tuner-peg-container unhighlightable'>
                {strings.map((s, i) => {
                    const note = TUNINGS[tuningMode].strings_ids[i]
                    const isTuned = notesTuned.has(note)

                    return (<div key={i} className={`tuner-peg ${i == targetIdx ? 'tuner-peg-activated' : ''} ${isTuned ? 'tuner-peg-tuned' : ''}`}>{s}</div>)
                })}
            </div>

        </div>
    )

}

export default TunerDisplay