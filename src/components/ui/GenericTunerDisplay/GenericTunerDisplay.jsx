
import { useEffect, useRef, useState } from 'react'
import './GenericTunerDisplay.css'
import { useTuning } from '../../../context/TuningContext'
import { useSynth } from '../../../context/SynthContext'
import { getInstrument } from '../../../utilities/tuningUtils'

/**
 * Hook to manage a scrolling container and get the `scrollLeft` property
 * @returns {List} [scrollLeft, props] - the targets `scrollLeft` property and params to attach to the scrolling container that manage updating the scroll data
 */
function useScrollLeft() {
    const [scrollLeft, setScrollLeft] = useState(0)
    const onScroll = (e) => setScrollLeft(e.target.scrollLeft)
    return [scrollLeft, { onScroll }]
}


//TODO autoscroll toggle

const GenericTunerDisplay = () => {
    const { notes, instrConfig, setInstrConfig, noteInfo: { targetMidiNote }, notesTuned } = useTuning()
    const { holdFreq, heldFreq } = useSynth()

    const [scrollLeft, scrollProps] = useScrollLeft()
    const wrapperRef = useRef(undefined)
    const containerRef = useRef(undefined)

    const totalScrollWidth = containerRef.current?.scrollWidth - wrapperRef.current?.scrollWidth
    const atStart = (scrollLeft === 0)
    const atEnd = (scrollLeft === totalScrollWidth)

    const [instr, tuning] = getInstrument(instrConfig)

    const playNote = (noteFreq) => {
        holdFreq(noteFreq)
    }

    useEffect(() => {
        // noteElems[targetMidiNote]?.scrollIntoView({ behavior: 'smooth' })
        // console.log(noteElems[targetMidiNote])

        // console.log(containerRef.current.children.item(targetMidiNote))
        containerRef.current?.children?.item(targetMidiNote)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

    }, [targetMidiNote])

    // Set initial scroll position to A4
    useEffect(() => {
        containerRef.current?.children?.item(69)?.scrollIntoView({ block: 'center', inline: 'center' })
    }, [containerRef.current, notes])

    return (
        <>
            <div className="generic-tuner-wrapper" ref={wrapperRef}>
                <div className="shadow shadow--left" style={atStart ? { opacity: 0 } : { opacity: 1 }}></div>
                <div className="shadow shadow--right" style={atEnd ? { opacity: 0 } : { opacity: 1 }}></div>

                <div className="generic-tuner-container" ref={containerRef}
                    {...scrollProps}
                >
                    {notes.map((note) => {
                        const isTarget = (note.id === targetMidiNote)
                        const isSynthNote = (note.frequency === heldFreq)
                        const isTuned = notesTuned.has(note.id)

                        return <div key={note.id} className={`note ${isTarget ? 'note-selected' : ''} ${isTuned ? 'note-tuned' : ''} ${isSynthNote ? 'note-held' : ''}`} onClick={() => playNote(note.frequency)}>{note.fullName}</div>
                    })}
                </div>
            </div>
        </>
    )
}

export default GenericTunerDisplay