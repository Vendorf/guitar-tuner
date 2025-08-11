import { useState } from 'react'
import { INSTRUMENTS } from '../../constants/tuningConstants'
import { getInstrument } from '../../utilities/tuningUtils';
import './InstrumentSelect.css'

//TODO: direct focus on selected item

const TuningListItem = ({ instrConfig, instrKey, tuningKey, tuning, onSelect }) => {
    const isSelected = ((instrConfig.instrument === instrKey) && (instrConfig.tuning === tuningKey))

    const handleSelect = () => {
        onSelect({ instrument: instrKey, tuning: tuningKey })
    }

    return (
        <div className={`tuning-list-item ${isSelected ? 'item-selected' : ''}`} onClick={handleSelect}>
            {tuning.name}
        </div>
    )
}

const InstrumentListItem = ({ instrConfig, instrKey, instrument, onSelect }) => {
    const isSelected = (instrConfig.instrument === instrKey)

    const handleSelect = () => {
        onSelect({ instrument: instrKey, tuning: Object.keys(instrument.tunings)[0] })
    }

    return (
        <div className='instrument-list-item'>
            <div className={`instrument-list-item-label ${isSelected ? 'item-selected' : ''}`} onClick={handleSelect}>{instrument.name}</div>
            {Object.entries(instrument.tunings).length > 1 && Object.entries(instrument.tunings).map(([tuningKey, tuning]) => {
                return <TuningListItem key={tuningKey} instrConfig={instrConfig} instrKey={instrKey} tuningKey={tuningKey} tuning={tuning} onSelect={onSelect} />
            })}
        </div>
    )
}

const InstrumentDropdown = ({ instrConfig, onSelect }) => {
    return (
        <div className='instrument-dropdown'>
            {Object.entries(INSTRUMENTS).map(([instrKey, instr]) => {
                return <InstrumentListItem key={instrKey} instrConfig={instrConfig} instrKey={instrKey} instrument={instr} onSelect={onSelect} />
            })}
        </div>
    )
}

const InstrumentSelect = ({ instrConfig, onSelect }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [instr, tuning] = getInstrument(instrConfig)

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen)
    }

    const handleSelect = (newInstrConfig) => {
        toggleDropdown()
        onSelect(newInstrConfig)
    }

    return (
        <div className='instrument-selector'>
            <div className='instrument-selector-selected' onClick={toggleDropdown}>
                {instr.name}
            </div>
            {dropdownOpen && <InstrumentDropdown instrConfig={instrConfig} onSelect={handleSelect} />}
        </div>
    )
}

export default InstrumentSelect
