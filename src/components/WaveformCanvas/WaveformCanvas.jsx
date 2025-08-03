import { memo, useRef } from "react"
import { useAudioState } from "../../context/AudioContext"

/**
 * Canvas that draws the waveform of the last FFT audio sample
 * 
 * Memoized, so only rerenders when AudioStateContext data changes
 * 
 * @returns
 */
const WaveformCanvas = memo(() => {
    const { audioTimeData } = useAudioState()
    const canvasRef = useRef(undefined)

    const canvas = canvasRef.current
    if (canvas) {
        const context = canvas.getContext('2d')

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.beginPath() // reset strokes

        // Redraw w data
        context.moveTo(0, canvas.height / 2)
        const bufferLength = audioTimeData.length / 10
        const deltaX = canvas.width / bufferLength
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
            const amplitude = audioTimeData[i] * 100 // TODO: figure out good scaling
            const y = (canvas.height / 2) - amplitude

            context.lineTo(x, y)
            x += deltaX
        }

        context.lineTo(canvas.width, canvas.height / 2)
        context.stroke()
    }

    return (
        <canvas ref={canvasRef}></canvas>
    )
})


export default WaveformCanvas