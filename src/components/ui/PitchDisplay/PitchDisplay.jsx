import { useEffect, useState } from "react"
import { useAudioState } from "../../../context/AudioContext"
import { useTuning } from "../../../context/TuningContext"
import { interpolateHsl } from "../../../utilities/colorUtils"
import PitchDetailDisplay from "./PitchDetailDisplay"
import './PitchDisplay.css'
import { CENTS_DIST_IN_TUNE } from "../../../constants/tuningConstants"
import ClampedContainer from "../../lib/ClampedContainer/ClampedContainer"

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
const MAX_CENTS = CENTS_PER_SIDE * 100 // e.g., 300
const TICK_STEP = 100 // cents between markers


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
    const { notes, noteInfo: { targetMidiNote, inTune } } = useTuning()
    const targetNoteName = notes[targetMidiNote]?.fullName ?? ""

    //TODO: replace with when in tune / when enough iterations or smthng
    // or like 2 glows: one when near, then turns green when in tune fully
    // const inTune = targetNoteName ? Math.abs(centsDist) <= CENTS_DIST_IN_TUNE : false // 5 cents

    // console.log(targetMidiNote, inTune)

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

    // Check if we are in single column mode to remove the ClampedContainer
    const [isSingleColumn, setIsSingleColumn] = useState(false)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 1050px)')

        const handleMediaQueryChange = (e) => {
            setIsSingleColumn(e.matches)
        };

        // Initial check
        setIsSingleColumn(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener('change', handleMediaQueryChange)

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleMediaQueryChange);
        }
    }, [])

    // Derived values
    const pixelsPerMs = VIEW_HEIGHT / TIME_WINDOW
    const boxHeight = pixelsPerMs * BOX_DURATION
    const boxWidthPerCent = (VIEW_WIDTH / 2) / CENTS_PER_SIDE

    const drawBoxes = history
        .map(entry => {
            const cents = entry.exactNote - targetMidiNote
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
            color = interpolateHsl(MID_COLOR, LOW_COLOR, t)
        }

        const colorHsl = `hsl(${color.h}, ${color.s}%, ${color.l}%)`
        const colorHslDark = `hsl(${color.h}, ${color.s}%, ${color.l - 20}%)`

        return { width, offsetX, y, alpha, color, colorHsl, colorHslDark }
    }

    const lastBoxProps = lastBox ? computeBoxProps(lastBox) : undefined

    const ticks = []
    for (let c = -MAX_CENTS; c <= MAX_CENTS; c += TICK_STEP) {
        ticks.push(c)
    }

    // Gradient derived
    const lowOffset = Math.round((LOW_CENTS / CENTS_PER_SIDE) * 100)
    const midOffset = Math.round((MID_CENTS / CENTS_PER_SIDE) * 100)
    const highOffset = Math.round((HIGH_CENTS / CENTS_PER_SIDE) * 100)

    const bubbleWidth = 13
    const targetNoteOffset = 9.5

    return (
        <>
            <div className={`card pitch-display ${showDetails ? 'card-remove-edges' : ''}`}>
                <svg viewBox="0 0 100 100">
                    {/* TODO: use the vars for stopColor and get offset right*/}
                    <defs>
                        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset={`${lowOffset}%`} stopColor={`hsl(${LOW_COLOR.h}, ${LOW_COLOR.s}%, ${LOW_COLOR.l}%)`} /> {/* LOW_COLOR */}
                            <stop offset={`${midOffset}%`} stopColor={`hsl(${LOW_COLOR.h}, ${LOW_COLOR.s}%, ${LOW_COLOR.l * 0.75}%)`} />
                            {/* <stop offset={`${midOffset}%`} stopColor={`hsl(${MID_COLOR.h}, ${MID_COLOR.s}%, ${MID_COLOR.l}%)`} /> */}
                            {/* <stop offset={`${highOffset}%`} stopColor={`hsl(${HIGH_COLOR.h}, ${HIGH_COLOR.s}%, ${HIGH_COLOR.l}%)`} />   HIGH_COLOR */}
                            {/* <stop offset={`${midOffset}%`} stopColor={`hsl(0, 0%, 91%)`} /> */}
                            <stop offset={`${midOffset}%`} stopColor={`var(--background-color)`} />   {/* HIGH_COLOR */}
                        </linearGradient>
                    </defs>
                    {/* GRADIENT BACKGROUND */}
                    <g>
                        <rect
                            x="50"
                            y="0"
                            width="50"
                            height={VIEW_HEIGHT}
                            fill="url(#bg-gradient)"
                            opacity="0.2"
                        />
                        <rect
                            x="0"
                            y="0"
                            width="50"
                            height={VIEW_HEIGHT}
                            fill="url(#bg-gradient)"
                            opacity="0.2"
                            transform={`translate(50, 0) scale(-1 1)`}
                        />
                    </g>
                    {/* TICKS AND LINES */}
                    <g>
                        {ticks.map((cents) => {
                            const x = 50 + (cents / 100) * boxWidthPerCent
                            return (
                                <g key={cents}>
                                    <line
                                        x1={x}
                                        y1="0"
                                        x2={x}
                                        y2={VIEW_HEIGHT}
                                        stroke="var(--tick-color)"
                                        strokeWidth="0.4"
                                    />
                                    <text
                                        x={x}
                                        y={VIEW_HEIGHT + 3}
                                        fontSize="2.5"
                                        textAnchor="middle"
                                        fill={cents === 0 ? "var(--tick-text-accent-color)" : "var(--tick-text-color)"}
                                        fontWeight={cents === 0 ? "bold" : "normal"}
                                    >
                                        {cents > 0 ? `+${cents}c` : `${cents}c`}
                                    </text>
                                </g>
                            )
                        })}
                    </g>
                    {/* LIVE TUNING BOXES */}
                    <g>
                        {/* In tune range TODO: maybe make it shade over the whole range with the colors */}
                        <rect
                            x={50 - boxWidthPerCent * 0.1}
                            y="0"
                            width={boxWidthPerCent * 0.2}
                            height={VIEW_HEIGHT}
                            fill="rgba(0,255,0,0)"
                        />
                        <line x1="0" y1={VIEW_HEIGHT} x2="100" y2={VIEW_HEIGHT} stroke="var(--tick-color)" strokeDasharray="2,2" strokeWidth="0.5" />
                        <text x="52" y={VIEW_HEIGHT - 1} fontSize="3" fill="var(--tick-text-color)">Target</text>
                        {/* <line x1='50' y1='100' x2='50' y2='0' stroke='black' strokeWidth='0.6'></line> */}
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
                    {/* BOTTOM LINE FINAL BOX */}
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
                        {lastBox && (
                            <g>
                                {/* Background bubble */}
                                <rect
                                    x={Math.max(1, Math.min((50 + (lastBox.cents >= 0 ? lastBoxProps.width + 1.5 - bubbleWidth / 2 : -lastBoxProps.offsetX - 16 + bubbleWidth / 2)), 99 - bubbleWidth))}
                                    y={VIEW_HEIGHT + 3.5}
                                    rx="1.5"
                                    ry="1.5"
                                    width={bubbleWidth}
                                    height="5"
                                    fill="var(--bubble-background-color)"
                                    fillOpacity="0.5"
                                    stroke={lastBoxProps.colorHslDark}
                                    strokeWidth="0.3"
                                />

                                {/* Cent deviation text */}
                                <text
                                    x={Math.max(1 + bubbleWidth / 2, Math.min((50 + (lastBox.cents >= 0 ? lastBoxProps.width + 8 - bubbleWidth / 2 : -lastBoxProps.offsetX - 8.5 + bubbleWidth / 2)), 99 - bubbleWidth / 2))}
                                    y={VIEW_HEIGHT + 7}
                                    fontSize="3"
                                    fill={lastBoxProps.colorHslDark}
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    stroke="var(--bubble-background-color)"
                                    strokeWidth="0.2"
                                    paintOrder="stroke"
                                >
                                    {lastBox.cents > 0 && "+"}{Math.round(lastBox.cents * 100)}c
                                </text>
                            </g>
                        )}
                    </g>
                    {/* TARGET NOTE */}
                    <g>
                        <line x1={0} y1={VIEW_HEIGHT + targetNoteOffset} x2={100} y2={VIEW_HEIGHT + targetNoteOffset} stroke="var(--tick-color)" strokeWidth="0.1"></line>
                        {/* Target Note Label */}
                        <text
                            x="50"
                            y={VIEW_HEIGHT + targetNoteOffset + 9}
                            fontSize="6"
                            fontWeight="bold"
                            textAnchor="middle"
                            fill={inTune ? "limegreen" : "var(--text-color)"}
                            stroke={inTune ? "limegreen" : "var(--text-color)"}
                            strokeWidth="0.4"
                            paintOrder="stroke"
                        >
                            {targetNoteName}
                        </text>
                        {/* Direction Label */}
                        {lastBox && !inTune && (
                            <text
                                x="50"
                                y={VIEW_HEIGHT + targetNoteOffset + 14}
                                fontSize="3"
                                textAnchor="middle"
                                fill="var(--tune-label-color)"
                                fontStyle="italic"
                            >
                                {lastBox.cents > 0 ? "↓ Tune Down" : "↑ Tune Up"}
                            </text>
                        )}
                        {/* Direction label (left/right side) */}
                        {/* {lastBox && Math.abs(lastBox.cents) > 0.05 && (
                                <text
                                    x={lastBox.cents > 0 ? 70 : 30}
                                    y="82"
                                    fontSize="3"
                                    textAnchor="middle"
                                    fill="#555"
                                    fontStyle="italic"
                                >
                                    {lastBox.cents > 0 ? "↓ Tune Down" : "↑ Tune Up"}
                                </text>
                            )} */}
                    </g>
                </svg>
                <div className="detail-toggle" onClick={toggleDetails}>{showDetails ? "Hide" : "Show"} Details</div>
                {!isSingleColumn && <ClampedContainer className="detail-container" style={{ display: showDetails ? '' : 'none' }}>
                    <PitchDetailDisplay display={showDetails}></PitchDetailDisplay>
                </ClampedContainer>}
                {isSingleColumn && <div className="detail-container" style={{ display: showDetails ? '' : 'none' }}>
                    <PitchDetailDisplay display={showDetails}></PitchDetailDisplay>
                </div>}
            </div>
            {/* <PitchDetailDisplay display={showDetails}></PitchDetailDisplay> */}
        </>
    )
}

export default PitchDisplay


// {/* {lastBox && (
//                             <text
//                                 x={50 + (lastBox.cents >= 0 ? lastBoxProps.width + 1.5 : -lastBoxProps.offsetX - 4.5)}
//                                 y={VIEW_HEIGHT - 2}
//                                 fontSize="3"
//                                 fill={lastBoxProps.colorHslDark}
//                                 textAnchor={lastBox.cents >= 0 ? 'start' : 'end'}
//                                 // style={{
//                                 //     filter: "drop-shadow(0px 0px 1px black)"
//                                 // }}
//                             >
//                                 {Math.round(lastBox.cents * 100)}c
//                             </text>
//                         )} */}
// {/* <circle cx='50' cy='90' r='8' fill='#aaa' stroke='black' strokeWidth={0.75}></circle> */ }


// <g>
//     {/* Capsule background */}
//     <rect
//         x="35"
//         y="85"
//         rx="6"
//         ry="6"
//         width="30"
//         height="10"
//         fill="#eee"
//         stroke={inTune ? "limegreen" : "black"}
//         strokeWidth={inTune ? 1.5 : 0.75}
//     />
//     {/* Note name */}
//     <text
//         x="50"
//         y="92"
//         fontSize="4"
//         textAnchor="middle"
//         fill="#222"
//         fontWeight="bold"
//     >
//         {targetNoteName}
//     </text>

//     {/* Directional tip */}
//     {lastBox && Math.abs(lastBox.cents) > 0.05 && (
//         <text
//             x={lastBox.cents > 0 ? 70 : 30}
//             y="82"
//             fontSize="3"
//             textAnchor="middle"
//             fill="#555"
//             fontStyle="italic"
//         >
//             {lastBox.cents > 0 ? "↓ Tune Down" : "↑ Tune Up"}
//         </text>
//     )}
// </g>


// {/* <circle
//     cx="50"
//     cy="90"
//     r="8"
//     fill="#eee"
//     stroke={inTune ? "limegreen" : "black"}
//     strokeWidth={inTune ? 2 : 0.75}
//     style={{
//         filter: inTune ? "drop-shadow(0 0 2px limegreen)" : "none",
//         transition: "stroke 0.2s, filter 0.2s"
//     }}
// /> */}
// {/* Animated */}
// {/* {inTune && (
//     <circle
//         cx="50"
//         cy="90"
//         r="11"
//         fill="none"
//         stroke="limegreen"
//         strokeWidth="1.5"
//     >
//         <animate attributeName="r" values="11;13;11" dur="0.6s" repeatCount="indefinite" />
//         <animate attributeName="stroke-opacity" values="1;0;1" dur="0.6s" repeatCount="indefinite" />
//     </circle>
// )} */}

// {/* Meh */}
// {/* <circle
//     cx="50"
//     cy="90"
//     r="8"
//     fill="#eee"
//     stroke="black"
//     strokeWidth="0.75"
// /> */}
// {/* {inTune && (
//     <circle
//         cx="50"
//         cy="90"
//         r="11"
//         fill="none"
//         stroke="rgba(0, 255, 0, 0.6)"
//         strokeWidth="1.5"
//     />
// )} */}

// {/* <text
//     x="50"
//     y="92.5"
//     fontSize="4"
//     textAnchor="middle"
//     fill="#222"
//     fontWeight="bold"
// >
//     {targetNoteName}
// </text> */}
