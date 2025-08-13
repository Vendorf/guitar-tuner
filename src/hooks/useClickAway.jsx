import { useEffect, useRef } from "react"

// TODO: so this doesn't cause callbacks with stale state, can instead have this set some state/ref and then return that
// then can useEffect() on the return of useClickAway in order to handle a click away event, after render, with latest state accessible

const useClickAway = (containerRef, onClickOutside) => {
    // Need to store this in a ref as otherwise caputed in initial closure so end up with stale state
    const callbackRef = useRef(onClickOutside)

    useEffect(() => {
        // Update ref if callback ever changes
        callbackRef.current = onClickOutside
    }, [onClickOutside])

    useEffect(() => {
        const checkClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                callbackRef.current?.()
            }
        }

        document.addEventListener("mousedown", checkClickOutside)
        document.addEventListener("touchstart", checkClickOutside)

        return () => {
            document.removeEventListener("mousedown", checkClickOutside)
            document.removeEventListener("touchstart", checkClickOutside)
        }
    }, [containerRef.current])
}

export default useClickAway