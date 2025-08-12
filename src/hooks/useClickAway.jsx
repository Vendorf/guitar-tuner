import { useEffect } from "react"

const useClickAway = (containerRef, onClickOutside) => {
    useEffect(() => {
        const checkClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClickOutside?.()
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