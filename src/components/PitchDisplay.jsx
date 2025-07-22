import { useAudio } from "../context/AudioContext"
import './PitchDisplay.css'

const PitchDisplay = () => {

    const {pitch, clarity, started, startAudio, stopAudio, killAudio} = useAudio()


    return (
        <>
            {/* <button onClick={startAudio}>Resume audio</button> */}
            <button onClick={() => started ? stopAudio() : startAudio()}>{started ? "Stop" : "Start"} Audio</button>

            <h1>Pitch: </h1> <div>{Math.round(pitch * 100) / 100}</div>
            <h1>Clarity: </h1> <div>{Math.round(clarity * 100)}%</div>
        </>
    )
}

export default PitchDisplay