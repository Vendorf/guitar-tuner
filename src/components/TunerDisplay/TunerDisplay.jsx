
import { useTuning } from '../../context/TuningContext'
import { TUNINGS } from '../../constants/tuningConstants'
import TuningSelector from '../TuningSelector/TuningSelector'
import { useSynth } from '../../context/SynthContext'
import './TunerDisplay.css'

const TunerPegSVG = ({ key, cx, cy, r, isTuned, isActived, isSynthHeld, name, handleClick }) => {
    return (
        <g key={key} className='tuner-peg-svg-g' onClick={handleClick}>
            {/* <circle cx={cx} cy={cy} r={r} fill={isTuned
                ? 'hsl(120, 61%, 70%)'
                : isActived
                    ? 'hsl(0, 0%, 40%)'
                    : 'hsl(0, 0%, 80%)'} /> */}
            <circle
                className={`tuner-peg-svg ${isActived ? 'tuner-peg-activated-svg' : ''} ${isTuned ? 'tuner-peg-tuned-svg' : ''} ${isSynthHeld ? `tuner-peg-held-svg` : ``}`}
                cx={cx}
                cy={cy}
                r={r}
                transformOrigin={`${cx}px ${cy}px`}
            />
            <text
                className={`tuner-peg-svg-text ${isActived ? 'tuner-peg-activated-svg-text' : ''} ${isTuned ? 'tuner-peg-tuned-svg-text' : ''}`}
                x={cx}
                y={cy}
                fontFamily="system-ui, Avenir, Helvetica, Arial, sans-serif"
                textRendering="optimizeLegibility"
                fontSize="3.1"
                letterSpacing="-0.2"
                fontWeight="bold"
                fill='black'
                textAnchor="middle"
                dominantBaseline="central"
                transformOrigin={`${cx}px ${cy}px`}

            // stroke="#000"
            // strokeWidth="0.02"
            // paintOrder="stroke"
            >
                {name}
            </text>
        </g>
    )
}

/**
 * Display for tuning pegs based on the current tuning
 * 
 * Highlights current target note from the tuning and shows notes that have been tuned
 * @returns 
 */
const TunerDisplay = () => {
    const { notes, tuningMode, noteInfo: { targetNote }, notesTuned } = useTuning()
    const { holdFreq, heldFreq } = useSynth()
    const strings = TUNINGS[tuningMode].strings

    const targetIdx = TUNINGS[tuningMode].strings_ids.indexOf(targetNote)

    const numPegs = strings.length
    const VIEW_WIDTH = 60
    const VIEW_HEIGHT = 10

    const pegRadius = 3.4
    const widthPerPeg = VIEW_WIDTH / numPegs

    const playNote = (noteFreq) => {
        // triggerTone(noteFreq)
        holdFreq(noteFreq)
    }

    return (
        <div className='tuner-display-container card'>
            <TuningSelector></TuningSelector>
            {/* <div className='tuner-peg-container unhighlightable'>
                {strings.map((s, i) => {
                    const note = TUNINGS[tuningMode].strings_ids[i]
                    const isTuned = notesTuned.has(note)

                    return (<div key={i} className={`tuner-peg ${i == targetIdx ? 'tuner-peg-activated' : ''} ${isTuned ? 'tuner-peg-tuned' : ''}`}>{s}</div>)
                })}
            </div> */}

            <svg className="tuner-peg-container-svg unhighlightable" viewBox='0 0 60 10'>
                {strings.map((s, i) => {
                    const note = TUNINGS[tuningMode].strings_ids[i]
                    const noteFreq = notes[note]?.frequency
                    const isTuned = notesTuned.has(note)
                    const isActived = (i === targetIdx)
                    const isSynthHeld = (noteFreq === heldFreq)

                    const cx = (i * widthPerPeg) + (widthPerPeg / 2)
                    const cy = VIEW_HEIGHT / 2
                    const r = pegRadius

                    return TunerPegSVG({ key: i, cx, cy, r, isTuned, isActived, isSynthHeld, name: s, handleClick: () => playNote(noteFreq) })
                    // return (<div key={i} className={`tuner-peg ${i == targetIdx ? 'tuner-peg-activated' : ''} ${isTuned ? 'tuner-peg-tuned' : ''}`}>{s}</div>)
                })}
            </svg>

        </div>
    )

}

export default TunerDisplay