import { useEffect, useState } from "react"
import { useAudioState } from "../../context/AudioContext"
import { useTuning } from "../../context/TuningContext"
import { interpolateHsl } from "../../utilities/colorUtils"
import PitchDetailDisplay from "./PitchDetailDisplay"
import './PitchDisplay.css'

//TODOS
// 1. Maybe convert to canvas for performance idk
//    - or D3 lmao
// 2. Make some nice background with dots/grid to show cents
//    - maybe have it move along w the bars

////---CONSTANTS---------------------------------------------------------------
// VIEW
const VIEW_HEIGHT = 75
const VIEW_WIDTH = 100

// TIME
const TIME_WINDOW = 5000 //ms
const BOX_DURATION = 50 // assuming each history entry lasts 50ms; this sort of makes it look like its properly real-time without being tied to actual time
const FADE_DELAY = 2000 // ms
const CENTS_PER_SIDE = 3 // NOTE: this is in HUNDREDS of cents (IE, each cent is 0.01, so 3 --> 300 cents, 3 notes) either side
//                          guitartuna shows +1 for 0.10 (10 cents); goes up to +30 on furthest edge (300 cents, 3 notes away)

//COLOR INTERPOLATION
const HIGH_COLOR = { h: 0, s: 100, l: 50 }
const MID_COLOR = { h: 39, s: 100, l: 50 }
const LOW_COLOR = { h: 147, s: 100, l: 50 }
const MID_CENTS = 0.1 // when we are within 10 cents of the target become orange
const HIGH_CENTS = 1 // when fully highColor
const LOW_CENTS = 0 // when fully low color
////---------------------------------------------------------------------------

/**
 * Displays real-time pitch info for distance of current audio from target note
 * @returns 
 */
const PitchDisplay = () => {
    const { history } = useAudioState()
    const { noteInfo: { targetNote } } = useTuning()

    const [showDetails, setShowDetails] = useState(false)
    const toggleDetails = () => {
        setShowDetails(!showDetails)
    }

    //TODO: is this too much lol
    // Need constant now updates w rerender to get fading/etc effects
    const [now, setNow] = useState(Date.now())
    useEffect(() => {
        let frame
        const tick = () => {
            setNow(Date.now())
            frame = requestAnimationFrame(tick)
        }
        tick()
        return () => cancelAnimationFrame(frame)
    }, [])

    // Derived values
    const pixelsPerMs = VIEW_HEIGHT / TIME_WINDOW
    const boxHeight = pixelsPerMs * BOX_DURATION
    const boxWidthPerCent = (VIEW_WIDTH / 2) / CENTS_PER_SIDE

    const drawBoxes = history
        .map(entry => {
            const cents = entry.exactNote - targetNote
            const ageMs = now - entry.time.getTime()

            return { cents, ageMs }
        })
        // .filter(box => Math.abs(box.cents) < centsSide) // filter out extreme outlierss
        .filter(entry => entry.ageMs < TIME_WINDOW) // only show most recent ones
        .map((box, i) => ({
            ...box,
            time: i // normalize time to index so we can compute Y
        }))

    const lastBox = drawBoxes[drawBoxes.length - 1]
    const lastTime = drawBoxes[drawBoxes.length - 1]?.time

    const computeBoxProps = (box) => {
        const width = boxWidthPerCent * Math.abs(box.cents)
        const offsetX = box.cents < 0 ? width : 0
        const y = VIEW_HEIGHT - boxHeight - (lastTime - box.time) * boxHeight
        // const y = VIEW_HEIGHT - (box.ageMs * pixelsPerMs)

        const alpha = Math.max(0, 1 - Math.max(0, box.ageMs - FADE_DELAY) / TIME_WINDOW) // fades to 0 over window

        // Compute color
        let color = undefined
        if (Math.abs(box.cents) > MID_CENTS) {
            // In upper range, interpolate mid and high color
            const t = Math.min(1, Math.max(0, (Math.abs(box.cents) - MID_CENTS) / (HIGH_CENTS - MID_CENTS)))
            color = interpolateHsl(MID_COLOR, HIGH_COLOR, t)
        } else {
            // In lower range, interpolate low and mid color
            const t = Math.min(1, Math.max(0, (MID_CENTS - Math.abs(box.cents)) / (MID_CENTS - LOW_CENTS)))
            color = interpolateHsl(LOW_COLOR, MID_COLOR, t)
        }

        const colorHsl = `hsl(${color.h}, ${color.s}%, ${color.l}%)`
        const colorHslDark = `hsl(${color.h}, ${color.s}%, ${color.l - 20}%)`

        return { width, offsetX, y, alpha, color, colorHsl, colorHslDark }
    }

    const lastBoxProps = lastBox ? computeBoxProps(lastBox) : undefined
    return (
        <>
            <div className="card">
                <svg viewBox="0 0 100 100">
                    <g>
                        <line x1='50' y1='100' x2='50' y2='0' stroke='black' strokeWidth='0.6'></line>
                        {drawBoxes.map(box => {
                            const { width, offsetX, y, alpha, color, colorHsl, colorHslDark } = computeBoxProps(box)
                            const capWidth = 0.5

                            return (
                                <g key={box.time}>
                                    <rect shapeRendering='crispEdges' x={50 - offsetX} y={y} width={width} height={boxHeight} fill={colorHsl} fillOpacity={alpha}></rect>
                                    {box.cents < 0 && <rect x={50 - offsetX} y={y} width={capWidth} height={boxHeight} fill={colorHslDark} fillOpacity={alpha}></rect>}
                                    {box.cents >= 0 && <rect x={50 + width - capWidth} y={y} width={capWidth} height={boxHeight} fill={colorHslDark} fillOpacity={alpha}></rect>}
                                </g>
                            )
                        })}
                    </g>
                    <g>
                        {/* <line x1='50' y1='100' x2='50' y2='0' stroke='black' strokeWidth='0.6'></line> */}
                        {/* <line x1='0' y1={VIEW_HEIGHT} x2={VIEW_WIDTH} y2={VIEW_HEIGHT} stroke='black' strokeWidth='0.6'></line> */}
                        {lastBox && lastBox.cents < 0 &&
                            <>
                                <line x1={50 - lastBoxProps.offsetX} y1={VIEW_HEIGHT} x2={50} y2={VIEW_HEIGHT} stroke={lastBoxProps.colorHslDark} strokeWidth='1'></line>
                                <circle cx={50 - lastBoxProps.offsetX} cy={VIEW_HEIGHT} r={1} fill={lastBoxProps.colorHslDark}></circle>
                            </>}
                        {lastBox && lastBox.cents >= 0 &&
                            <>
                                <line x1={50} y1={VIEW_HEIGHT} x2={50 + lastBoxProps.width} y2={VIEW_HEIGHT} stroke={lastBoxProps.colorHslDark} strokeWidth='1'></line>
                                <circle cx={50 + lastBoxProps.width} cy={VIEW_HEIGHT} r={1} fill={lastBoxProps.colorHslDark}></circle>
                            </>}
                        <circle cx='50' cy='90' r='8' fill='#aaa' stroke='black' strokeWidth={0.75}>

                        </circle>
                    </g>
                </svg>
                <div className="detail-toggle" onClick={toggleDetails}>{showDetails ? "Hide" : "Show"} Details</div>
            </div>
            <PitchDetailDisplay display={showDetails}></PitchDetailDisplay>
        </>
    )
}

export default PitchDisplay