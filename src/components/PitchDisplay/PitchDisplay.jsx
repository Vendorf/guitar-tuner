import { useEffect, useState } from "react"
import { useAudioState } from "../../context/AudioContext"
import { useTuning } from "../../context/TuningContext"
import './PitchDisplay.css'
import WaveformCanvas from "../WaveformCanvas/WaveformCanvas"
import { interpolateHsl } from "../../utilities/colorUtils"
import TuningSelector from "../TuningSelector/TuningSelector"
import PitchDetailDisplay from "./PitchDetailDisplay"

//TODO: move constants up here

// TODO
// Make some nice background with dots/grid to show cents
//      maybe have it move along w the bars

const PitchDisplay = () => {

    // const { pitch, clarity, started, startAudio, stopAudio, killAudio, history, updates } = useAudio()
    const { pitch, clarity, history, updates } = useAudioState()
    const { notes, tuningMode, setTuningMode, noteInfo: { note, nearestNote, targetNote, centsDist } } = useTuning()

    const [showDetails, setShowDetails] = useState(false)
    const toggleDetails = () => {
        setShowDetails(!showDetails)
    }

    //TODO: is this too much lol
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


    const nearestNoteName = notes[nearestNote]?.fullName ?? ""
    const targetNoteName = notes[targetNote]?.fullName ?? ""
    const targetFreq = notes[targetNote]?.frequency ?? 0

    //TODO maybe convert to canvas for performance idk
    // or D3 lmao

    // TODO
    // + organize properly code


    const VIEW_HEIGHT = 75
    const VIEW_WIDTH = 100
    const timeWindow = 5000 //5000 //ms

    const pixelsPerMs = VIEW_HEIGHT / timeWindow
    const boxDuration = 50 // assuming each history entry lasts 100ms ig
    const boxHeight = pixelsPerMs * boxDuration
    const fadeDelay = 2000 // ms

    // const timeLength = 100 //50
    const centsSide = 3 // guitartuna shows +1 for 0.10 (10 cents); goes up to +30 on furthest edge (300 cents, 3 notes away)
    // here not actually cents but 100s of cents (so this is 300 cents either side)

    //COLOR INTERPOLATION
    const highColor = { h: 0, s: 100, l: 50 }
    const midColor = { h: 39, s: 100, l: 50 }
    const lowColor = { h: 147, s: 100, l: 50 }
    const midCents = 0.1 // when we are within 10 cents of the target become orange
    const highCents = 1 // when fully highColor
    const lowCents = 0 // when fully low color

    const boxWidthPerCent = (VIEW_WIDTH / 2) / centsSide

    const drawBoxes = history
        .map(entry => {
            const cents = entry.exactNote - targetNote
            const ageMs = now - entry.time.getTime()

            return { cents, ageMs }
        })
        // .filter(box => Math.abs(box.cents) < centsSide) // filter out extreme outlierss
        .filter(entry => entry.ageMs < timeWindow) // only show most recent ones
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

        const alpha = Math.max(0, 1 - Math.max(0, box.ageMs - fadeDelay) / timeWindow) // fades to 0 over window

        // Compute color
        let color = undefined
        if (Math.abs(box.cents) > midCents) {
            // In upper range, interpolate mid and high color
            const t = Math.min(1, Math.max(0, (Math.abs(box.cents) - midCents) / (highCents - midCents)))
            color = interpolateHsl(midColor, highColor, t)
        } else {
            // In lower range, interpolate low and mid color
            const t = Math.min(1, Math.max(0, (midCents - Math.abs(box.cents)) / (midCents - lowCents)))
            color = interpolateHsl(lowColor, midColor, t)
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