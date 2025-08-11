import { useState } from 'react'
import { INSTRUMENTS } from '../../constants/tuningConstants'
import { getInstrument } from '../../utilities/tuningUtils';
import './InstrumentSelect.css'
import { CheckIcon, ChevronIcon } from '../icons/Bootstrap/BootstrapIcons';

//TODO: direct focus on selected item

//TODO: make this wrap
const StringIcons = ({ tuning }) => {
    // Shows a little preview of the strings in the selection
    const strings = tuning?.strings ?? []

    return (
        <div className='string-box-container'>
            {strings.map((s, i) => {
                return <div className='string-box'>{s}</div>
            })}
        </div>
    )
}

const TuningListItem = ({ instrConfig, instrKey, tuningKey, tuning, onSelect }) => {
    const isSelected = ((instrConfig.instrument === instrKey) && (instrConfig.tuning === tuningKey))

    const handleSelect = () => {
        onSelect({ instrument: instrKey, tuning: tuningKey })
    }

    return (
        <div className={`tuning-list-item ${isSelected ? 'item-selected item-selected-underline' : ''}`} onClick={handleSelect}>
            <div className='tuning-list-item-label'>{tuning.name}</div>
            <StringIcons tuning={tuning} />
            {isSelected && <CheckIcon className="check-icon" />}
        </div>
    )
}

const InstrumentListItem = ({ instrConfig, instrKey, instrument, onSelect }) => {
    const isSelected = (instrConfig.instrument === instrKey)
    const multTunings = (Object.entries(instrument.tunings).length > 1)
    const isOnlySelected = isSelected && !multTunings

    const instrTuning = instrument.tunings[instrConfig.tuning] ?? Object.values(instrument.tunings)[0]

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleSelect = () => {
        if (multTunings) {
            setDropdownOpen(!dropdownOpen)
        } else {
            onSelect({ instrument: instrKey, tuning: Object.keys(instrument.tunings)[0] })
        }
    }

    return (
        <div className='instrument-list-item'>
            <div className={`instrument-list-item-label-wrapper ${isSelected ? 'item-selected' : ''} ${isOnlySelected ? 'item-selected-underline' : ''}`} onClick={handleSelect}>
                <div className={`instrument-list-item-label`}>{instrument.name}</div>
                {(isSelected || !multTunings) && <StringIcons tuning={instrTuning} />}
                {multTunings && <ChevronIcon className={`chevron-icon ${dropdownOpen ? 'icon-flipped' : ''}`} />} {isOnlySelected && <CheckIcon className='check-icon' />}
            </div>
            {multTunings && dropdownOpen && Object.entries(instrument.tunings).map(([tuningKey, tuning]) => {
                return <TuningListItem key={tuningKey} instrConfig={instrConfig} instrKey={instrKey} tuningKey={tuningKey} tuning={tuning} onSelect={onSelect} />
            })}
        </div>
    )
}

const InstrumentDropdown = ({ instrConfig, onSelect, show }) => {
    return (
        <div className='instrument-dropdown' style={{ display: show ? '' : 'none' }}>
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
        <div className={`instrument-selector ${dropdownOpen ? 'instrument-selector-open' : ''}`}>
            <div className='instrument-selector-selected' onClick={toggleDropdown}>
                {instr.name}
                <ChevronIcon className={`chevron-icon ${dropdownOpen ? 'icon-flipped' : ''}`} />
            </div>
            <InstrumentDropdown instrConfig={instrConfig} onSelect={handleSelect} show={dropdownOpen} />
        </div>
    )
}

export default InstrumentSelect
