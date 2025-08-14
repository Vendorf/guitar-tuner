

import { useState } from "react"
import useIsWindows from "../../../hooks/useIsWindows"
import './ShadowScrollContainer.css'

// from https://codesandbox.io/s/dawn-sunset-uhbtu?fontsize=14
/**
 * Hook to manage a scrolling container and get the `scrollLeft` property
 * @returns {List} [scrollLeft, props] - the targets `scrollLeft` property and params to attach to the scrolling container that manage updating the scroll data
 */
function useScrollLeft() {
    const [scrollLeft, setScrollLeft] = useState(0)
    const onScroll = (e) => setScrollLeft(e.target.scrollLeft)
    return [scrollLeft, { onScroll }]
}

const ShadowScrollContainer = ({ children, wrapperRef, containerRef, propsInner, ...props }) => {    
    const [scrollLeft, scrollProps] = useScrollLeft()
    const isWindows = useIsWindows()

    const totalScrollWidth = containerRef.current?.scrollWidth - wrapperRef.current?.scrollWidth
    const atStart = (scrollLeft === 0)
    const atEnd = (scrollLeft === totalScrollWidth)

    const wrapperProps = {...props}
    const containerProps = {...propsInner}

    const wrapperClassName = `shadow-scroll-wrapper ${wrapperProps.className ? wrapperProps.className : ''}`
    delete wrapperProps.className
    
    const containerClassName = `shadow-scroll-container ${containerProps.className ? containerProps.className : ''} ${isWindows ? 'is-windows' : ''}`
    delete containerProps.className

    return (
        <>
            <div className={wrapperClassName} ref={wrapperRef} {...wrapperProps}>
                <div className="shadow shadow--left" style={atStart ? { opacity: 0 } : { opacity: 1 }}></div>
                <div className="shadow shadow--right" style={atEnd ? { opacity: 0 } : { opacity: 1 }}></div>

                <div className={containerClassName} ref={containerRef}
                    {...containerProps}
                    {...scrollProps}
                >
                    {children}
                </div>
            </div>
        </>
    )
}

export default ShadowScrollContainer