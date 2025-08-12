
TODO: rewrite this to make sense lmao and give rationales for why wrote what did

//// floating-ui LIB //////////////////////////////////////////////////////////

floating.js is pretty similar to this in many ways
what it just does tho is it has a size() middleware which you give a callback to that tells you the 
available height/width, and then the user sets the css styles from that (https://floating-ui.com/docs/size)

What if we just had it take x,y and then compute the remainign width/height to the clipping boundary
problem is could then set min/max width from here, but same issue of what if htey used a % there already
we don't wanna end up overriding their min width with a smaller one for instance and vice versa for max
so same issue of having to reflow it to tell which one would end up being smaller
we can ofc try to do a css calc() or min()/max().... but again unsure about that :P
I think what I have is honestly fine and robust enough
maybe the only thing is we could create some hidden element or two elements (one 0 width, one 0 height)
or just clone the original one and have it keep the original styles, and then always just read its width/height as the preferred
that way don't even have any thrashing from unsetting styles --> read --> set styles
BUT that doesn't work with the 2 pass thing where we adjust width --> let content recalc height --> adjust height
so.... not sure

///////////////////////////////////////////////////////////////////////////////

//// REFLOW/REPAINT ///////////////////////////////////////////////////////////

Problem rn is offsetWidth and offsetHeight access will trigger reflow and potential repaint
not sure there's a way to avoid the repaint
it honestly seems like it's fine rn, but maybe if slow then will get thrashing
so ideally need to find a way to figure out what the desired size would have been without causing all that... not sure yet

///////////////////////////////////////////////////////////////////////////////

//// RETRIEVE % STYLE /////////////////////////////////////////////////////////

// var child = document.querySelector('.child');
// child.textContent = getDefaultStyle(child, 'width');
// function getDefaultStyle(element, prop) {
//     var parent = element.parentNode,
//         computedStyle = getComputedStyle(element),
//         value;
//     parent.style.display = 'none';
//     value = computedStyle.getPropertyValue(prop);
//     parent.style.removeProperty('display');
//     return value;
// }
// from https://jsfiddle.net/Sjeiti/2qkftdjd/ from https://stackoverflow.com/questions/744319/get-css-rules-percentage-value-in-jquery#comment50329424_19873734
// just don't removeproperty but rather grab the initial display style, set to none, do thing, then set it back
// alternatively: create a div, append child to it, then run func which hides the div and gets the style
// then delete the div ig
// (or maybe we keep it around.... and then don't have to clone each time... idk need to think lmao)

// wait maybe I don't even want the original style
// I just wanna unset my style change --> let it recompute onto the default it wanted --> store that as the real preferred
// --> compute what width/height to clamp --> set that width/height on style directly
// so just the unset is enough to restore the original percentage
// original % only needed if we really do a min(original, new), but worried it won't work in all cases if can't nest
// some functions in css
// note: if in the style prop they have their own width/height they tried to set, then use those as the default and unset
// to those values instead of ''
// so just be like `default = style?.width ? style.widh : ''` or whatever

///////////////////////////////////////////////////////////////////////////////

//// offsetWidth VS getBoundingClientRect() ///////////////////////////////////

// I think offset is better than getBoundingClientRect() b/c will ignore the transform props that happen
// So for example if have scale(0.5) on 100px width, don't want to get 50px and then set that as width
// cause then will transform down to 25px which is wrong; but if get 100px pre-transform width and set that
// then will transform down to 50px which is what want
// Not sure if going to have problems with like x/y and stuff though... ideally would nullify transforms on just this
// element but not any parents, but it seems pretty annoying to get working in a general case: https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms

///////////////////////////////////////////////////////////////////////////////

//// CLAMPED LIB //////////////////////////////////////////////////////////////

// maybe we can make a react clamped lib: clamped() and useClamped()
// clamped() wraps an element and does all this shit
// + allow setting options to push x/y instead of alter width, and combine those, etc (like for tooltips)
// useClamped() will perform the same calculations but just return where it would have clamped element to if
// they wanna do their own thing instead
// also give clamped() settings for scroll behavior, and callbacks for ex: when can no longer resize below minimum supplied
// size/min-width,min-height/etc so the user can for ex swap to some other element or smthng
// maybe also add an avoid() that avoids a given region/regions/element boundary
//  so like, compute if it will cross the region, and push/resize so doesn't
//  essentially just a collision check then a min x/y to avoid type of thing

///////////////////////////////////////////////////////////////////////////////




//// DUMP ALL /////////////////////////////////////////////////////////////////
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓
     ↓↓↓↓↓↓↓↓

import { useEffect, useRef, useState } from 'react'
import './ClampedContainer.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

//floating.js is pretty similar to this in many ways
// what it just does tho is it has a size() middleware which you give a callback to that tells you the 
// available height/width, and then the user sets the css styles from that (https://floating-ui.com/docs/size)

// What if we just had it take x,y and then compute the remainign width/height to the clipping boundary
// problem is could then set min/max width from here, but same issue of what if htey used a % there already
// we don't wanna end up overriding their min width with a smaller one for instance and vice versa for max
// so same issue of having to reflow it to tell which one would end up being smaller
// we can ofc try to do a css calc() or min()/max().... but again unsure about that :P
// I think what I have is honestly fine and robust enough
// maybe the only thing is we could create some hidden element or two elements (one 0 width, one 0 height)
// or just clone the original one and have it keep the original styles, and then always just read its width/height as the preferred
// that way don't even have any thrashing from unsetting styles --> read --> set styles
// BUT that doesn't work with the 2 pass thing where we adjust width --> let content recalc height --> adjust height
// so.... not sure

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
 * @param {any[]} props remaining props to apply to this container (ex: className)
 * @returns container div that will clamp its width/height styles to the bounding element's bounding box, supplied bounding box, or window size
 */
const ClampedContainer = ({ children, boundingElementRef, boundingRect, ...props }) => {

    console.log('props', props)

    const selfRef = useRef(undefined)
    // For React version
    // const [dimensions, setDimensions] = useState(undefined)

    // Given React's order of useEffect, this is guaranteed to happen BEFORE the 
    // useEffect in this function, so the size will be accurate and available
    //TODO: can either remove resize event in useEffect and make it rely on the windowSize changing, or just do what have now
    // and grab window size inside it
    // const windowDimensions = useWindowDimensions()
    // console.log('window', windowDimensions)

    // Problem rn is offsetWidth and offsetHeight access will trigger reflow and potential repaint
    // not sure there's a way to avoid the repaint
    // it honestly seems like it's fine rn, but maybe if slow then will get thrashing
    // so ideally need to find a way to figure out what the desired size would have been without causing all that... not sure yet

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

            // Unset the width/height style to go back to CSS default
            // TODO: if in the style prop they have their own width/height they tried to set, then use those as the default and unset
            //       to those values instead of ''; so just be like `default = style?.width ? style.widh : ''` or whatever
            console.log('pre dims', selfRef.current.offsetWidth, selfRef.current.offsetHeight)

            selfRef.current.style.width = ''
            selfRef.current.style.height = ''
            //TODO: is offsetWidth/Height sizes okay? or bounding rect
            const preferredDims = {
                width: selfRef.current.offsetWidth,
                height: selfRef.current.offsetHeight
            }
            console.log('preferred dims', preferredDims)
            const rect = selfRef.current.getBoundingClientRect()

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
            const overflowWidth = Math.max(0, (rect.x + preferredDims.width) - (boundDims.x + boundDims.width))
            const overflowHeight = Math.max(0, (rect.y + preferredDims.height) - (boundDims.y + boundDims.height))

            // Squeezed dimensions
            const adjustedDims = {
                width: preferredDims.width - overflowWidth,
                height: preferredDims.height - overflowHeight
            }

            console.log('adjusted dims', adjustedDims)

            //// DIRECT DOM VERSION ///////////////////////////////////////
            //TODO: if style prop and only doing one of these, revert other to original
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


    return (
        <div
            ref={selfRef}
            {...props}
        // TODO: would need to merge style declarations
        // style={{width: '60%'}}
        // style={dimensions ? {
        //     width: dimensions.width,
        //     height: dimensions.height
        // } : {}}
        >
            {children}
        </div>
    )
}

export default ClampedContainer



// useEffect(() => {
//     // console.log('ClamedContainer useEffect()')

//     // console.log("computed", window.getComputedStyle(selfRef.current))

//     // TODO: this is still actually problematic in case we start at small size and then grow
//     // so the initial render is not the largest possible size
//     // would ideally just check every time and if it's larger then replace, but the problem is
//     // already have react state setting the style prop so the size is still fucked
//     // idk if can turn it into some css calculation style maybe? like min between whatever the current CSS width/height is and the
//     // width we set? not sure how to get the actual css value tho
//     // can get the computed but that's useless. can somehow extract the actual stylesheet but it's annoying
//     // ig extract the stylesheet on the initial or whatever and then always do a css min rule, but TODO for later
//     if (!initialDimsRef.current) {
//         // On first render, store what this component's size wanted to be, so can always try to get
//         // back to this size later

//         // TODO: actually even bigger problem is % styles just kinda wrong
//         // cuz really we need to know the real % style every time
//         // I think direct dom manipulation + resetting the initial size every time is the move?
//         // problem is even if direct manipulation, on resize we now no longer have the percents going so it's kinda screwed
//         // so ig even with direct manipulation would need to do a css min of the two instead.... idk
//         // but then ofc need to know the iniital % style that was used again so
//         // selfRef.current.style.width = '' this does reset the style which is maybe useful to %

//         // console.log('before: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//         // selfRef.current.style.width = `auto`
//         // console.log('after: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//         // okay so this is useful apparently the offsetWidth/height recalculated right away
//         // so we can in the code: set the width style back to the original, grab what it wants to be, then use that
//         // as the initialSize essentially
//         // console.log('before: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//         //     selfRef.current.style.width = `50%`
//         //     console.log('after: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//         //     selfRef.current.style.width = `300px`
//         //     console.log('afterfinal: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//         // so this works fine for example and no visual thrashing seemingly
//         // maybe thrahsing guaranteed not to happen given JS event loop? so can't be rendering
//         // halfway thru execution, so ig we're fine....?
//         // but unfortunately the style is empty initially, so need to
//         // grab it from the annoying method

//         //LETS GOO found something decent
//         // var child = document.querySelector('.child');
//         // child.textContent = getDefaultStyle(child, 'width');

//         // function getDefaultStyle(element, prop) {
//         //     var parent = element.parentNode,
//         //         computedStyle = getComputedStyle(element),
//         //         value;
//         //     parent.style.display = 'none';
//         //     value = computedStyle.getPropertyValue(prop);
//         //     parent.style.removeProperty('display');
//         //     return value;
//         // }
//         // from https://jsfiddle.net/Sjeiti/2qkftdjd/ from https://stackoverflow.com/questions/744319/get-css-rules-percentage-value-in-jquery#comment50329424_19873734
//         // just don't removeproperty but rather grab the initial display style, set to none, do thing, then set it back
//         // alternatively: create a div, append child to it, then run func which hides the div and gets the style
//         // then delete the div ig
//         // (or maybe we keep it around.... and then don't have to clone each time... idk need to think lmao)

//         // wait maybe I don't even want the original style
//         // I just wanna unset my style change --> let it recompute onto the default it wanted --> store that as the real preferred
//         // --> compute what width/height to clamp --> set that width/height on style directly
//         // so just the unset is enough to restore the original percentage
//         // original % only needed if we really do a min(original, new), but worried it won't work in all cases if can't nest
//         // some functions in css
//         // note: if in the style prop they have their own width/height they tried to set, then use those as the default and unset
//         // to those values instead of ''
//         // so just be like `default = style?.width ? style.widh : ''` or whatever

//         // maybe we can make a react clamped lib: clamped() and useClamped()
//         // clamped() wraps an element and does all this shit
//         // + allow setting options to push x/y instead of alter width, and combine those, etc (like for tooltips)
//         // useClamped() will perform the same calculations but just return where it would have clamped element to if
//         // they wanna do their own thing instead
//         // also give clamped() settings for scroll behavior, and callbacks for ex: when can no longer resize below minimum supplied
//         // size/min-width,min-height/etc so the user can for ex swap to some other element or smthng
//         // maybe also add an avoid() that avoids a given region/regions/element boundary
//         //  so like, compute if it will cross the region, and push/resize so doesn't
//         //  essentially just a collision check then a min x/y to avoid type of thing

//         // TODO: is this or getBoundingClientRect() better? I think this b/c will ignore the transform
//         // props that happen
//         // So for example if have scale(0.5) on 100px width, don't want to get 50px and then set that as width
//         // cause then will transform down to 25px which is wrong; but if get 100px pre-transform width and set that
//         // then will transform down to 50px which is what want
//         // Not sure if going to have problems with like x/y and stuff though... ideally would nullify transforms on just this
//         // element but not any parents, but it seems pretty annoying to get working in a general case: https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms
//         const width = selfRef.current.offsetWidth
//         const height = selfRef.current.offsetHeight
//         const rect = selfRef.current.getBoundingClientRect()

//         initialDimsRef.current = {
//             width: width,
//             height: height,
//             x: rect.x,
//             y: rect.y
//         }

//         console.log('initialDims', initialDimsRef.current)
//     }

//     // const clampToInitialDimensions = () => {

//     // }

//     const constrainDimensions = () => {
//         // console.log("constrainDimensions()")
//         // grab own dimensions from selfRef
//         const width = selfRef.current.offsetWidth
//         const height = selfRef.current.offsetHeight
//         const rect = selfRef.current.getBoundingClientRect()

//         if (boundingRect) {
//             // do this
//             console.error("TODO - boundingRect")
//         } else if (boundingElementRef?.current) {
//             // do this
//             console.error("TODO - boundingElement")
//         } else {
//             const windowDimensions = {
//                 width: window.innerWidth,
//                 height: window.innerHeight
//             }

//             // console.log('windowdims', windowDimensions)
//             // console.log('preresize', rect, width, height)

//             //TODO: I think logic for others stays same, just use their end position instead of windowDimensions.width/heigth
//             // so can extract this to a func that just takes what the bound x/y is

//             // Use window size
//             // const endX = rect.x + width
//             // const endY = rect.y + height

//             //TODO: is this right
//             // Use current x/y, but the desired initial width/height
//             const endX = rect.x + initialDimsRef.current.width
//             const endY = rect.y + initialDimsRef.current.height

//             // How far we are beyond the window width/height
//             // This is offset to adjust by to get to the end of the window
//             // (or 0, if end position is smaller than end of window)
//             const deltaWidth = Math.max(0, endX - windowDimensions.width)
//             const deltaHeight = Math.max(0, endY - windowDimensions.height)

//             // Squeezed dimensions
//             const adjustedDimensions = {
//                 width: initialDimsRef.current.width - deltaWidth,
//                 height: initialDimsRef.current.height - deltaHeight
//             }

//             // console.log("constrained dims: ", adjustedDimensions)

//             console.log("currwidth", selfRef.current.style.width)

//             //TODO: should just manually dom manipulate instead?
//             // setDimensions(adjustedDimensions)
//             console.log('classes ', selfRef.current.className)
//             // console.log('before: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//             // selfRef.current.style.width = `50%`
//             // console.log('after: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//             // selfRef.current.style.width = `300px`
//             // console.log('afterfinal: ', selfRef.current.style.width, selfRef.current.offsetWidth)
//             // selfRef.current.style.width = `${adjustedDimensions.width}px`
//             // selfRef.current.style.width = ''
//             // selfRef.current.style.height = `${adjustedDimensions.height}px`
//         }
//     }

//     constrainDimensions()

//     window.addEventListener('resize', constrainDimensions)

//     return () => window.removeEventListener('resize', constrainDimensions)

//     // on resize --> constraintDimension()

//     // this is after render, so we will know the ClampedContainer's width/height already
//     // even if they set with like % bc it's all calculated already
//     // then we just clamp down widht/height if its outside the bounds
//     // set the width
//     // this will still respect min-width so we're chilling

//     // that width and height is ideally with useState() and then react will rerender with the correct size ig
//     // but if that sucks for some reason then can direct manipulate dom but that feels wrong and janky w react resetting
//     // it on subsequent renders

//     // actually maybe just use the selfRef to adjust it manually bc ow I think rn it will work on first shrink, but if expand up
//     // again then it will fuck up cuz now doesn't have a problem with the current width/height so just stays at small size and
//     // doesn't know what the percentage original was for example or vh or whatever

//     // I think maybe need to store what the initial width/height was,

//     // and remember to add shit for it changing with resize events
// }, [])
