import { useRef, useState } from 'react'
import { CheckSquareIcon, XSquareIcon } from '../../icons/Bootstrap/BootstrapIcons'
import { useTuning } from '../../../context/TuningContext'
import { useSynth } from '../../../context/SynthContext'
import useClickAway from '../../../hooks/useClickAway'
import './StandardPitchSetter.css'

const StandardPitchSetter = () => {

    const { a4Freq, setA4Freq } = useTuning()
    const { stopHeldFreq } = useSynth()

    const [editing, setEditing] = useState(false)
    const [inputVal, setInputVal] = useState(a4Freq)

    const setterRef = useRef(undefined)

    const resetEdit = () => {
        setInputVal(a4Freq)
        setEditing(false)
    }

    const toggleEditing = () => {
        if (editing) {
            resetEdit()
        } else {
            setEditing(true)
        }
    }

    const commitChange = (e) => {
        e?.stopPropagation()
        setEditing(false)
        // If the input value is invalid, use current frequency
        const sendVal = inputVal <= 0 ? a4Freq : inputVal
        setInputVal(sendVal)

        if (sendVal !== a4Freq) {
            setA4Freq(sendVal)
            // Stop any held frequencies
            stopHeldFreq()
        }

    }

    const cancelChange = (e) => {
        e.stopPropagation()
        resetEdit()
    }

    const handleChange = (e) => {
        setInputVal(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            commitChange(e)
        }
    }

    useClickAway(setterRef, () => commitChange(undefined))

    return (
        <div ref={setterRef} className='standard-pitch-setter' onClick={toggleEditing}>
            A<sub>4</sub> =&nbsp;
            {!editing && <span className='standard-pitch'>{inputVal}</span>}
            {editing && <div className='input-wrapper'><input autoFocus type='number' min={1} max={20000} className='standard-pitch-input' value={inputVal} onClick={(e) => e.stopPropagation()} onChange={handleChange} onKeyDown={handleKeyDown} /> <CheckSquareIcon className='commit-icon' onClick={commitChange} /><XSquareIcon className='cancel-icon' onClick={cancelChange} /></div>} Hz
        </div>

        // <div class="container">
        //     <div class="element">
        //         <div>A</div>
        //         <div class="edge">
        //             <span class="right-top">#</span>
        //             <span class="right-bottom">4</span>
        //         </div>
        //     </div>
        // </div>
    )
}

export default StandardPitchSetter