import { useEffect, useRef, useState } from 'react'
import './ClampedContainer.css'

// SEE ./notes.md for rationales/etc

// TODO: this currently does not adjust x/y if our box is too far to the left
// there we want to adjust width/height by overflow, but also add the overflow to x/y to make it not off the left edge/top of the boundary

// TODO: account for margin/padding?

// TODO: make this adjust x/y as well?
// maybe not honestly so that it works okay with scrolling and the like; can have another component
// or a flag to get x/y clamed as well

// TODO: should we make this a portal? not really sure if its necessary but maybe good for some edge cases?
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

    //console.log('props', props)

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

        /**
         * Clamps the container to the provided boundary (boundingElementRef/boundingRect/window size)
         * 
         * This will directly manipulate the DOM in order to resize the element
         * 
         * Note that computing the preferred size/setting the clamped size triggers reflows that might cause the browser to repaint,
         * potentially leading to some visual layout thrashing
         * 
         * This is a 2-phase constraint
         * 
         * First, we constrain one dimensions, allowing the other to potentially change with it's default style rules to fit content
         * Next, we constrain the second dimension, now placing it within bounds and potentially cutting off content
         * Note this means there are 2 reflows and potential repaints per constraint
         * See the ClampTest for an example
         */
        const constrainDimensions = () => {
            if (!selfRef.current) {
                // Ref not yet attached, abort
                // console.error("SELFREF UNATTACHED")
                return
            }

            //// Get Boundary /////////////////////////////////////////////////
            /**
             * Retrieves bounding box that container must be constrained within
             * @returns {Object} dimensions of the boundary including `x`, `y`, `width`, `height`
             */
            const getBoundary = () => {
                if (boundingRect) {
                    return boundingRect
                } else if (boundingElementRef?.current) {
                    const boundDims = boundingElementRef.current.getBoundingClientRect()
                    // Account for scrollbars
                    const scrollbarWidth = boundingElementRef.current.offsetWidth - boundingElementRef.current.clientWidth
                    const scrollbarHeight = boundingElementRef.current.offsetHeight - boundingElementRef.current.clientHeight
                    const availableWidth = boundDims.width - scrollbarWidth
                    const availableHeight = boundDims.height - scrollbarHeight

                    boundDims.width = availableWidth
                    boundDims.height = availableHeight
                    return boundDims
                } else {
                    const windowDimensions = {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        x: 0,
                        y: 0
                    }
                    return windowDimensions
                }
            }
            const boundDims = getBoundary()
            ///////////////////////////////////////////////////////////////////

            //// Do Constrain /////////////////////////////////////////////////
            // For resetting in React version
            // const initialStyle = {
            //     width: selfRef.current.style.width,
            //     height: selfRef.current.style.height,
            // }
            // console.log('init styles', initialStyle)
            //console.log('pre dims', selfRef.current.offsetWidth, selfRef.current.offsetHeight)

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
            //console.log('preferred rect', preferredRect)

            /**
             * This works fine but for clarity just doing some code reuse with constrainWidth and constrainHeight so easier to follow
             * @param {string} dimension 'width' or 'height'
             */
            // const constrainSingleDimension = (dimension) => {
            //     const position = dimension === 'width' ? 'x' : 'y'

            //     // How far we are beyond the window width/height
            //     // This is offset to adjust by to get to the end of the window (or 0, if end position is smaller than end of window)
            //     const overflow = Math.max(0, (preferredRect[position] + preferredRect[dimension]) - (boundDims[position] + boundDims[dimension]))

            //     // Squeezed dimension
            //     const adjustedDim = preferredRect[dimension] - overflow

            //     //// DIRECT DOM VERSION ///////////////////////////////////////
            //     selfRef.current.style[dimension] = `${adjustedDim}px`
            //     ///////////////////////////////////////////////////////////////
            // }

            /**
             * Clamps the container to the boundary only along the width
             */
            const constrainWidth = () => {
                // How far we are beyond the window width/height
                // This is offset to adjust by to get to the end of the window (or 0, if end position is smaller than end of window)
                const overflowWidth = Math.max(0, (preferredRect.x + preferredRect.width) - (boundDims.x + boundDims.width))

                // Squeezed dimension
                const adjustedWidth = preferredRect.width - overflowWidth

                //// DIRECT DOM VERSION ///////////////////////////////////////
                selfRef.current.style.width = `${adjustedWidth}px`
                ///////////////////////////////////////////////////////////////
            }

            /**
             * Clamps the container to the boundary only along the height
             */
            const constrainHeight = () => {
                // How far we are beyond the window width/height
                // This is offset to adjust by to get to the end of the window (or 0, if end position is smaller than end of window)
                const overflowHeight = Math.max(0, (preferredRect.y + preferredRect.height) - (boundDims.y + boundDims.height))

                // Squeezed dimension
                const adjustedHeight = preferredRect.height - overflowHeight

                //// DIRECT DOM VERSION ///////////////////////////////////////
                selfRef.current.style.height = `${adjustedHeight}px`
                ///////////////////////////////////////////////////////////////
            }

            // Perform 2 phase constraint

            // TODO: if style prop supplied and flag to only adjust width/height alone, revert other to original
            // TODO: let them choose order that width/height constraint done in
            constrainWidth()
            // Update preferred height given new width
            preferredRect.height = selfRef.current.offsetHeight
            constrainHeight()

            // TODO: for React version would need to adjust to do one dimension at a time
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
        /**
         * Debounces constrainDimensions to only trigger at most once per frame
         */
        const safeConstrain = () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
            animationFrameId = requestAnimationFrame(constrainDimensions)
        }

        // Setup resize watchers
        const resizeObserver = new ResizeObserver(safeConstrain)
        // TODO: will this react to parent changes too?
        resizeObserver.observe(selfRef.current)
        if (boundingElementRef?.current) {
            // If we have a bounding element, observe it's changes too
            resizeObserver.observe(boundingElementRef.current)
        }
        window.addEventListener('resize', safeConstrain)

        // Clamp container boundary on initial render as well
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
        >
            {children}
        </div>
    )
}

export default ClampedContainer