import { useEffect, useRef } from "react";

/**
 * Preserves the previous value of a useState() variable by copying it into a ref at the end of every React render phase (using useEffect)
 * @param {any} value value to preserve
 * @returns preserved value from internal ref
 */
const usePrevious = (value) => {
    const ref = useRef()

    // Runs every time
    useEffect(() => {
        ref.current = value
    })

    return ref.current
}

export default usePrevious