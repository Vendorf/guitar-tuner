import { useEffect, useRef, useState } from 'react'
import './ClampedContainer.css'

// SEE ./notes.md for rationales/etc

//TODO: make this adjust x/y as well?
// maybe not honestly so that it works okay with scrolling and the like; can have another component
// or a flag to get x/y clamed as well

//TODO: should we make this a portal? not really sure if its necessary but maybe good for some edge cases?
// idk need to think... https://react.dev/reference/react-dom/createPortal

/**
 * Container that after React's render phase will clamp this element's width/height to either the bounding rect of the provided 
 * boundingElementRef or the provided boundingRect
 * 
 * Only one or none of `boundingElementRef` or `boundingRect` should be supplied. If both are supplied, `boundingElementRef` is ignored
 * If no parameters are supplied, the entire window size is used as the bounding rectangle
 * 
 * You should set styles on the ClampedContainer as usual, including a desired width/height CSS property, as the property will be
 * overwritten after the initial render if the desired width/height were out of bounds
 * 
 * Note because it only overwrites the width/height, min-width, max-width, min-height, and max-height will still be respected
 * @param {Object} param 
 * @param {Object} children the React `children` prop for child elements inside ClampedContainer
 * @param {Object} boundingElementRef the React ref to the DOM element which should bound this component. Will use the 
 * `boundingElementRef.current` value to extract the bounding rectangle from the element
 * @param {Object} boundingRect the bounding rect supplied directly
 * @param {Object} style React style prop for overriding CSS styles
 * @param {any[]} props remaining props to apply to this container (ex: className)
 * @returns container div that will clamp its width/height styles to the bounding element's bounding box, supplied bounding box, or window size
 */
const ClampedContainer = ({ children, boundingElementRef, boundingRect, style, ...props }) => {

    console.log('props', props)

    const selfRef = useRef(undefined)
    // For React version
    // const [dimensions, setDimensions] = useState(undefined)

    // useEffect runs after rest of React component/layout phase, so should have refs ready/etc
    useEffect(() => {
        if (!selfRef.current) {
            // Ref not yet attached, abort
            console.error("SELFREF UNDEFINED")
            return
        }

        const constrainDimensions = () => {
            if (!selfRef.current) {
                // Ref not yet attached, abort
                console.error("SELFREF UNATTACHED")
                return
            }

            // For resetting in React version
            // const initialStyle = {
            //     width: selfRef.current.style.width,
            //     height: selfRef.current.style.height,
            // }
            // console.log('init styles', initialStyle)

            console.log('pre dims', selfRef.current.offsetWidth, selfRef.current.offsetHeight)

            // Unset the width/height style to go back to CSS default
            // If they supply their own style prop with width/height overrides for the CSS defaults, use those instead
            selfRef.current.style.width = style?.width ?? ''
            selfRef.current.style.height = style?.height ?? ''
            
            //TODO: offseWidth/Height probably better than getBoundingClientRect(), but not on SVG
            // (I don't think we care though given this is a div always, can't use this inside SVG)
            const preferredRect = selfRef.current.getBoundingClientRect()
            // Set preferred width/height with offset to include any CSS transforms
            preferredRect.width = selfRef.current.offsetWidth
            preferredRect.height = selfRef.current.offsetHeight
            console.log('preferred rect', preferredRect)

            let boundDims = undefined
            if (boundingRect) {
                boundDims = boundingRect
            } else if (boundingElementRef?.current) {
                boundDims = boundingElementRef.current.getBoundingClientRect()
                // Account for scrollbars
                const scrollbarWidth = boundingElementRef.current.offsetWidth - boundingElementRef.current.clientWidth
                const scrollbarHeight = boundingElementRef.current.offsetHeight - boundingElementRef.current.clientHeight
                const availableWidth = boundDims.width - scrollbarWidth
                const availableHeight = boundDims.height - scrollbarHeight

                boundDims.width = availableWidth
                boundDims.height = availableHeight
            } else {
                const windowDimensions = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    x: 0,
                    y: 0
                }
                boundDims = windowDimensions
            }

            //// Do Constrain /////////////////////////////////////////////////
            //TODO: this actually needs to be a 2 phase constrain I think:
            // first, we constrain width for example, and set the style --> this will cause height to potentially change
            // to fit content
            // next, we constrain the new height now --> content may now cut off, but it's by the bounds
            // as otherwise we constrain width and height together --> content no longer fits
            // this will mean two reflows tho :P ig make it an optional flag thing
            // see the ClampTest for example
            // also make sure they can configure which axis has priority then?
            // so if they want width to first shrink so it takes on a large height then gets cropped or vice versa

            // Use current x/y, but the desired initial width/height
            // How far we are beyond the window width/height
            // This is offset to adjust by to get to the end of the window
            // (or 0, if end position is smaller than end of window)
            const overflowWidth = Math.max(0, (preferredRect.x + preferredRect.width) - (boundDims.x + boundDims.width))
            const overflowHeight = Math.max(0, (preferredRect.y + preferredRect.height) - (boundDims.y + boundDims.height))

            // Squeezed dimensions
            const adjustedDims = {
                width: preferredRect.width - overflowWidth,
                height: preferredRect.height - overflowHeight
            }

            console.log('adjusted dims', adjustedDims)

            //// DIRECT DOM VERSION ///////////////////////////////////////
            //TODO: if style prop supplied and flag to only adjust width/height alone, revert other to original
            selfRef.current.style.width = `${adjustedDims.width}px`
            selfRef.current.style.height = `${adjustedDims.height}px`
            ///////////////////////////////////////////////////////////////
            console.log('final dims', selfRef.current.offsetWidth, selfRef.current.offsetHeight)

            // Avoiding this bc extra render then ig idk? not sure what best practice would be cause
            // might be nice to do it inside react render so it plays well
            //// REACT VERSION ////////////////////////////////////////////
            // // Reset to initial styles
            // // TODO: is px right here or just do initialStyle directly.... I think direct is right but check edge cases ig
            // // selfRef.current.style.width = `${initialStyle.width}px`
            // // selfRef.current.style.height = `${initialStyle.height}px`
            // selfRef.current.style.width = initialStyle.width
            // selfRef.current.style.height = initialStyle.height
            // // Set React style vars to trigger rerender
            // setDimensions(adjustedDimensions)
            ///////////////////////////////////////////////////////////////
        }

        let animationFrameId = null
        const safeConstrain = () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
            animationFrameId = requestAnimationFrame(constrainDimensions)
        }

        const resizeObserver = new ResizeObserver(safeConstrain)
        // TODO: will this react to parent changes too?
        resizeObserver.observe(selfRef.current)
        if (boundingElementRef?.current) {
            // If we have a bounding element, observe it's changes too
            resizeObserver.observe(boundingElementRef.current)
        }
        window.addEventListener('resize', safeConstrain)

        safeConstrain()

        // Cleanup listeners so if component unmounts and remounts won't get duplicates
        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', safeConstrain)
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [boundingRect, boundingElementRef]) //TODO: is this best
    // }, [])

    // For React version
    // const clampedStyle = dimensions ? { width: dimensions.width, height: dimensions.height } : {}
    // const mergedStyle = { ...style, ...clampedStyle }

    return (
        <div
            ref={selfRef}
            // style={mergedStyle}
            style={style}
            {...props}
        // style={{width: '60%'}}
        >
            {children}
        </div>
    )
}

export default ClampedContainer