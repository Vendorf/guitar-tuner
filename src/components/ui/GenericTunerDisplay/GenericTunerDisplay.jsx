
import { useEffect, useRef } from 'react'
import { useTuning } from '../../../context/TuningContext'
import { useSynth } from '../../../context/SynthContext'
import ShadowScrollContainer from '../../lib/ShadowScrollContainer/ShadowScrollContainer'
import './GenericTunerDisplay.css'

//TODO autoscroll toggle

const GenericTunerDisplay = () => {
    const { notes, instrConfig, setInstrConfig, noteInfo: { targetMidiNote }, notesTuned } = useTuning()
    const { holdFreq, heldFreq } = useSynth()

    const wrapperRef = useRef(undefined)
    const containerRef = useRef(undefined)

    const playNote = (noteFreq) => {
        holdFreq(noteFreq)
    }

    useEffect(() => {
        containerRef.current?.children?.item(targetMidiNote)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

    }, [targetMidiNote])

    // Set initial scroll position to A4
    useEffect(() => {
        containerRef.current?.children?.item(69)?.scrollIntoView({ block: 'center', inline: 'center' })
    }, [containerRef.current, notes])

    return (
        <ShadowScrollContainer className='generic-tuner-wrapper' wrapperRef={wrapperRef} containerRef={containerRef}>
            {notes.map((note) => {
                const isTarget = (note.id === targetMidiNote)
                const isSynthNote = (note.frequency === heldFreq)
                const isTuned = notesTuned.has(note.id)

                

                // return <div key={note.id} className={`note ${isTarget ? 'note-selected' : ''} ${isTuned ? 'note-tuned' : ''} ${isSynthNote ? 'note-held' : ''}`} onClick={() => playNote(note.frequency)}>{note.fullName}</div>
                // return <div key={note.id} className={`note ${isTarget ? 'note-selected' : ''} ${isTuned ? 'note-tuned' : ''} ${isSynthNote ? 'note-held' : ''}`} onClick={() => playNote(note.frequency)}>{note.name}<sub>{note.octave}</sub></div>
                return <div
                    key={note.id}
                    className={`note ${isTarget ? 'note-selected' : ''} ${isTuned ? 'note-tuned' : ''} ${isSynthNote ? 'note-held' : ''}`}
                    onClick={() => playNote(note.frequency)}
                >
                    {!note.isAccidental && <>{note.name}<sub>{note.octave}</sub></>}
                    {note.isAccidental && <>{note.sharpName}<sup className='accidental-super'>♯</sup>/{note.flatName}<sup className='accidental-super flat-accidental'>♭</sup><sub>{note.octave}</sub></>}
                </div>
            })}
        </ShadowScrollContainer>
    )
}

export default GenericTunerDisplay