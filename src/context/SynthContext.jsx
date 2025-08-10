import { createContext, use } from "react"
import useSynthEngine from "../hooks/useSynthEngine"

const SynthContext = createContext(undefined)

/**
 * TODO
 * @param {Object} param
 * @param {Object} param.children
 * @returns TODO
 */
const SynthProvider = ({ children }) => {
    const synth = useSynthEngine()

    return (
        <SynthContext value={synth}>
            {children}
        </SynthContext>
    )
}

/**
 * TODO
 * @returns TODO
 */
const useSynth = () => {
    return use(SynthContext)
}

export { SynthProvider, SynthContext, useSynth }