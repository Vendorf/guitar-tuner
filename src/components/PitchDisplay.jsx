import { useEffect, useState } from "react"
import { useAudio } from "../context/AudioContext"
import { useTuning } from "../context/TuningContext"
import './PitchDisplay.css'
import WaveformCanvas from "./WaveformCanvas/WaveformCanvas"

const PitchDisplay = () => {

    const { pitch, clarity, started, startAudio, stopAudio, killAudio, history, updates } = useAudio()
    const { notes, tuningMode, setTuningMode, noteInfo: { nearestNote, targetNote, note, centsDist } } = useTuning()

    const nearestNoteName = notes[nearestNote]?.fullName ?? ""
    const targetNoteName = notes[targetNote]?.fullName ?? ""
    const targetFreq = notes[targetNote]?.frequency ?? 0

    //TODO maybe convert to canvas for performance idk
    // or D3 lmao

    //TODO interpolate red --> green based on dist from center
    // + organize properly code
    // + get it intergrated with actual history

    // TEMP: cents diff from center + update
    const timeLength = 100 //50
    const centsSide = 3 // guitartuna shows +1 for 0.10 (10 cents); goes up to +3 on furthest edge (30 cents)

    const [boxes, setBoxes] = useState([])

    const updateFunc = () => {
        setBoxes(bs => {
            return [...bs,
            {
                cents: (Math.random() - 0.5) * (centsSide + 1),
                time: bs.length + 1
            }]
        })
    }

    // const lastTime = boxes[boxes.length - 1]?.time ?? 0
    // const drawBoxes = boxes.filter(box => lastTime - box.time <= timeLength)


    const drawBoxes = history
        .map(entry => {
            const cents = entry.exactNote - targetNote
            return { cents, time: entry.time }
        })
        // .filter(box => Math.abs(box.cents) < centsSide) // filter out extreme outliers
        .slice(-timeLength) // only show most recent ones
        .map((box, i) => ({
            ...box,
            time: i // normalize time to index so we can compute Y
        }))

    const boxHeight = 89.0 / (timeLength + 1)
    const boxWidthPerCent = 50.0 / centsSide

    const lastBox = drawBoxes[drawBoxes.length - 1]
    const lastTime = drawBoxes[drawBoxes.length - 1]?.time

    const computeBoxProps = (box) => {
        const width = boxWidthPerCent * Math.abs(box.cents)
        const offsetX = box.cents < 0 ? width : 0
        const y = 89 - boxHeight - (lastTime - box.time) * boxHeight

        return { width, offsetX, y }
    }

    const lastBoxProps = lastBox ? computeBoxProps(lastBox) : undefined
    return (
        <>
            <div className="card">
                <button onClick={() => started ? stopAudio() : startAudio()}>{started ? "Stop" : "Start"} Audio</button>

                <div className="pitch-wrapper">
                    <div className="pitch-label">Pitch:</div> <div className="pitch-value">{Math.round(pitch * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Clarity:</div> <div className="pitch-value">{Math.round(clarity * 100)}%</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note id:</div> <div className="pitch-value">{nearestNote}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Note:</div> <div className="pitch-value">{nearestNoteName}</div>
                </div>
            </div>
            <div className="card">
                <button onClick={updateFunc}>add</button>
                <svg viewBox="0 0 100 100">
                    <g>
                        {drawBoxes.map(box => {
                            // const width = boxWidthPerCent * Math.abs(box.cents)
                            // const offsetX = box.cents < 0 ? width : 0
                            // const y = 89 - boxHeight - (lastTime - box.time) * boxHeight
                            const { width, offsetX, y } = computeBoxProps(box)

                            const capWidth = 0.5
                            return (
                                <g key={box.time}>
                                    <rect x={50 - offsetX} y={y} width={width} height={boxHeight} fill='rgba(6, 163, 6, 0.5)'></rect>
                                    {box.cents < 0 && <rect x={50 - offsetX} y={y} width={capWidth} height={boxHeight} fill="rgba(6, 163, 6, 0.5)"></rect>}
                                    {box.cents >= 0 && <rect x={50 + width - capWidth} y={y} width={capWidth} height={boxHeight} fill="rgba(6, 163, 6, 0.5)"></rect>}
                                </g>
                            )
                        })}
                    </g>
                    <g>
                        <line x1='50' y1='90' x2='50' y2='0' stroke='black' strokeWidth='0.6'></line>
                        <line x1='0' y1='89' x2='100' y2='89' stroke='black' strokeWidth='0.6'></line>
                        {lastBox && lastBox.cents < 0 &&
                            <>
                                <line x1={50 - lastBoxProps.offsetX} y1={89} x2={50} y2={89} stroke="rgb(6, 163, 6)" strokeWidth='0.6'></line>
                                <circle cx={50 - lastBoxProps.offsetX} cy={89} r={1} fill="rgb(6, 163, 6)"></circle>
                            </>}
                        {lastBox && lastBox.cents >= 0 &&
                            <>
                                <line x1={50} y1={89} x2={50 + lastBoxProps.width} y2={89} stroke="rgb(6, 163, 6)" strokeWidth='0.6'></line>
                                <circle cx={50 + lastBoxProps.width} cy={89} r={1} fill="rgb(6, 163, 6)"></circle>
                            </>}
                        <circle cx='50' cy='89' r='10' fill='#aaa' stroke='black'></circle>
                    </g>
                </svg>
            </div>
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Target id:</div> <div className="pitch-value">{targetNote}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Target:</div> <div className="pitch-value">{targetNoteName}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Freq:</div> <div className="pitch-value">{Math.round(targetFreq * 100) / 100}</div>
                </div>
            </div>
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Exact:</div> <div className="pitch-value">{Math.round(note * 100) / 100}</div>
                </div>
                <div className="pitch-wrapper">
                    <div className="pitch-label">Cents:</div> <div className="pitch-value">{Math.round(centsDist * 100) / 100}</div>
                </div>
            </div>
            <div className="card">
                <WaveformCanvas></WaveformCanvas>
            </div>
            <div className="card">
                <div className="pitch-wrapper">
                    <div className="pitch-label">Update:</div> <div className="pitch-value">{updates}</div>
                </div>
                <pre style={{ color: 'black', textAlign: 'left' }}>{history.length} {JSON.stringify(history, null, 2)}</pre>
            </div>

        </>

    )
}

export default PitchDisplay