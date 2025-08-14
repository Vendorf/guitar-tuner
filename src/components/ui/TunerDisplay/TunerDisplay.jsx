
import { useTuning } from '../../../context/TuningContext'
import TuningSelector from '../TuningSelector/TuningSelector'
import { useSynth } from '../../../context/SynthContext'
import InstrumentSelect from '../InstrumentSelector/InstrumentSelect'
import { getInstrument } from '../../../utilities/tuningUtils'
import GenericTunerDisplay from '../GenericTunerDisplay/GenericTunerDisplay'
import StandardPitchSetter from '../StandardPitchSetter/StandardPitchSetter'
import './TunerDisplay.css'

const TunerPegSVG = ({ key, cx, cy, r, isTuned, isActived, isSynthHeld, name, isAccidental, octave, handleClick }) => {
    return (
        <g key={key} className='tuner-peg-svg-g' onClick={handleClick}>
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
                fontFamily="Avenir, Helvetica, Arial, sans-serif"
                textRendering="optimizeLegibility"
                fontSize="3.1"
                letterSpacing="-0.2"
                fontWeight="bold"
                fill='black'
                textAnchor="middle"
                dominantBaseline="central"
                transformOrigin={`${cx}px ${cy}px`}
            >
                {name}
                {isAccidental && <>
                    <tspan baselineShift='30%' dx='0.2px' fontSize='2.3'>♯</tspan>
                    <tspan baselineShift='-30%' fontSize='2.3'>{octave}</tspan>
                </>}
                {!isAccidental && <tspan baselineShift='-30%' dx='0.2px' fontSize='2.3'>{octave}</tspan>}
            </text>
        </g>
    )
}

/**
 * TODO: have a totally separate display with an infinite scroll thru the whole note range for generic tuner
 * and select it with variatn or something
 * Display for tuning pegs based on the current tuning
 * 
 * Highlights current target note from the tuning and shows notes that have been tuned
 * @returns 
 */
const TunerDisplay = () => {
    const { notes, instrConfig, setInstrConfig, noteInfo: { targetMidiNote }, notesTuned } = useTuning()
    const { holdFreq, heldFreq, stopHeldFreq } = useSynth()
    // const strings = TUNINGS[tuningMode].strings

    // const targetIdx = TUNINGS[tuningMode].strings_ids.indexOf(targetMidiNote)
    const [instr, tuning] = getInstrument(instrConfig)
    const isGenericInstrument = (instr.type === 'generic')
    const targetIdx = tuning?.strings_ids?.indexOf(targetMidiNote) ?? -1

    const strings = isGenericInstrument ? [targetMidiNote] : tuning.strings_ids

    const numPegs = strings.length
    const VIEW_WIDTH = 60
    const VIEW_HEIGHT = 10

    const pegRadius = 3.4
    const widthPerPeg = VIEW_WIDTH / numPegs

    const playNote = (noteFreq) => {
        if (isGenericInstrument) return
        holdFreq(noteFreq)
    }

    const changeInstrument = (newInstrConfig) => {
        // console.log('selecting', newInstrConfig)
        stopHeldFreq()
        setInstrConfig({ ...newInstrConfig })
    }

    return (
        <div className='tuner-display-container card'>
            <InstrumentSelect instrConfig={instrConfig} onSelect={changeInstrument}></InstrumentSelect>
            {isGenericInstrument && <GenericTunerDisplay />}
            {!isGenericInstrument && <TuningSelector></TuningSelector>}
            {!isGenericInstrument && <svg className="tuner-peg-container-svg unhighlightable" viewBox='0 0 60 10'>
                {strings.map((midiNote, i) => {
                    // const name = tuning.strings[i] ?? notes[midiNote]?.fullName
                    // const name = notes[midiNote]?.name ?? tuning.strings[i]
                    const name = notes[midiNote]?.sharpName ?? tuning.strings[i]
                    const isAccidental = notes[midiNote]?.isAccidental ?? false
                    const octave = notes[midiNote]?.octave ?? ''
                    const noteFreq = notes[midiNote]?.frequency
                    const isTuned = notesTuned.has(midiNote)
                    const isActived = (i === targetIdx)
                    const isSynthHeld = (noteFreq === heldFreq)

                    const cx = (i * widthPerPeg) + (widthPerPeg / 2)
                    const cy = VIEW_HEIGHT / 2
                    const r = pegRadius

                    return TunerPegSVG({ key: `${midiNote}${i}${instr.name}`, cx, cy, r, isTuned, isActived, isSynthHeld, name, isAccidental, octave, handleClick: () => playNote(noteFreq) })
                })}
            </svg>}
            <StandardPitchSetter />
        </div>
    )

}

export default TunerDisplay