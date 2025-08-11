import { memo, useRef } from "react"
import { useAudioState } from "../../context/AudioContext"

/**
 * Canvas that draws the waveform of the last FFT audio sample
 * 
 * Memoized, so only rerenders when AudioStateContext data changes
 * @param {Object} param
 * @param {boolean} param.drawTime whether to draw the time or frequency domain
 * @returns
 */
const WaveformCanvas = memo(({ drawTime }) => {
    const { audioTimeData, audioFrequencyData } = useAudioState()
    const canvasRef = useRef(undefined)

    const audioData = drawTime ? audioTimeData : audioFrequencyData

    const canvas = canvasRef.current
    if (canvas) {
        const context = canvas.getContext('2d')

        const zeroY = drawTime ? canvas.height / 2 : 0
        const base = drawTime ? zeroY : canvas.height
        const scaleY = drawTime ? 100 : 0.9

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.beginPath() // reset strokes

        // Redraw w data
        context.moveTo(0, base)
        const bufferLength = audioData.length
        const deltaX = canvas.width / bufferLength
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
            const amplitude = audioData[i] * scaleY // TODO: figure out good scaling
            const y = (zeroY) - amplitude

            context.lineTo(x, y)
            x += deltaX
        }

        context.lineTo(canvas.width, base)
        context.stroke()
    }

    return (
        <canvas ref={canvasRef}></canvas>
    )
})


export default WaveformCanvas