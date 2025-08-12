import { useRef, useState } from 'react'
import ClampedContainer from '../../components/lib/ClampedContainer/ClampedContainer'
import './ClampTest.css'

export default function ClampTest() {
    const parentRef = useRef(null)
    const [tall, setTall] = useState(false)

    return (
        <div className="app">
            <button onClick={() => setTall(!tall)}>
                Toggle Parent Height ({tall ? 'Tall' : 'Short'})
            </button>

            <div
                ref={parentRef}
                className="parent-container"
                style={{ height: tall ? '500px' : '250px' }}
            >
                <ClampedContainer className='clamped-container' boundingElementRef={parentRef}>
                    <div className="content">
                        <h2>Clamped Content</h2>
                        <p>This box will never overflow the parent container.</p>
                        <p>Resize the window or toggle height to see clamping in action.</p>
                    </div>
                </ClampedContainer>
            </div>
        </div>
    )
}