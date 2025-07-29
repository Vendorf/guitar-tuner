// Broken into its own file for easier memoization/to avoid rerenders with constant pitch change of larger component

import { useAudioControls } from "../../context/AudioContext"

/**
 * Button to start audio
 * 
 * Necessary given most browsers don't allow audio capture until some user input
 * 
 * Hides itself once audio begins
 * @returns 
 */
const StartButton = () => {
    // const { started, startAudio, stopAudio, killAudio } = useAudio()
    const { started, startAudio } = useAudioControls()

    return (
        // <button onClick={() => started ? stopAudio() : startAudio()}>{started ? "Stop" : "Start"} Audio</button>
        !started && <button onClick={startAudio} style={{
            width: '100%',
            padding: '1em'
        }}>Start Audio</button>
    )
}

export default StartButton