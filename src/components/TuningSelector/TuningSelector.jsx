import { useRef, useState } from "react"
import { TUNINGS } from "../../constants/tuningConstants"
import { useTuning } from "../../context/TuningContext"
import './TuningSelector.css'

//TODO: store and remember order of tunings so they move to the front when selected and stay as most-recently-used order
//TODO: add scroll arrows left/right
//      can use this for the arrow:
//      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon text-token-text-primary"><path d="M9.33468 3.33333C9.33468 2.96617 9.6326 2.66847 9.99972 2.66829C10.367 2.66829 10.6648 2.96606 10.6648 3.33333V15.0609L15.363 10.3626L15.4675 10.2777C15.7255 10.1074 16.0762 10.1357 16.3034 10.3626C16.5631 10.6223 16.5631 11.0443 16.3034 11.304L10.4704 17.137C10.2108 17.3967 9.7897 17.3966 9.52999 17.137L3.69601 11.304L3.61105 11.1995C3.44054 10.9414 3.46874 10.5899 3.69601 10.3626C3.92328 10.1354 4.27479 10.1072 4.53292 10.2777L4.63741 10.3626L9.33468 15.0599V3.33333Z"></path></svg>


// from https://codesandbox.io/s/dawn-sunset-uhbtu?fontsize=14
function useScrollLeft() {
    const [scrollLeft, setScrollLeft] = useState(0)
    const onScroll = (e) => setScrollLeft(e.target.scrollLeft)
    return [scrollLeft, { onScroll }]
}

const TuningSelector = () => {

    const [scrollLeft, scrollProps] = useScrollLeft()
    const wrapperRef = useRef(undefined)
    const containerRef = useRef(undefined)

    const totalScrollWidth = containerRef.current?.scrollWidth - wrapperRef.current?.scrollWidth
    const atStart = (scrollLeft === 0)
    const atEnd = (scrollLeft === totalScrollWidth)

    const { tuningMode, setTuningMode } = useTuning()

    return (
        <div className="tuning-container-wrapper" ref={wrapperRef}>
            <div className="shadow shadow--left" style={atStart ? { opacity: 0 } : { opacity: 1 }}></div>
            <div className="shadow shadow--right" style={atEnd ? { opacity: 0 } : { opacity: 1 }}></div>
            <div className="tuning-container md-chips" ref={containerRef}
                {...scrollProps}
            >
                {Object.entries(TUNINGS).map(tuning => {
                    const [key, { name }] = tuning
                    const selected = (key === tuningMode)

                    const render = selected
                        ? <div key={key} className={`md-chip md-chip-clickable md-chip-hover md-chip-selected`}>{name}</div>
                        : <div key={key} className={`md-chip md-chip-clickable md-chip-hover`} onClick={() => setTuningMode(key)}>{name}</div>

                    // ? <div key={key} className={`tuning-chip tuning-chip-selected`}>{name}</div>
                    // ? <div key={key} className={`tuning-chip tuning-chip-selected`}>{name}<div className="tuning-chip-icon">×</div></div>
                    // : <div key={key} className={`tuning-chip`}>{name}</div>

                    return (render)
                })}
            </div>
        </div>
    )
}

export default TuningSelector