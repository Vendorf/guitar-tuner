
import './Tuner.css'

const Tuner = () => {

    // Here compute all shit for tuning?
    // Alternatively can make a TuningContext that uses the AudioContext.... idk
    // that would do all the logic for figuring out nearest string, etc, then can use that
    // in Tuner and pass down or whatever to render

    const toggleThing = (e) => {
        console.log(e)
    }

    const strings = [
        { freq: 110, name: "E" },
        { freq: 110, name: "A" },
        { freq: 110, name: "D" },
        { freq: 110, name: "G" },
        { freq: 110, name: "B" },
        { freq: 110, name: "e" },
    ]

    return (
        <>
            <div className='tuner-wrapper card'>
                {strings.map((s) =>
                    <div className='tuner-peg'>{s.name}</div>)
                }
                {/* <div className="tuner-peg tuner-peg-activated tuner-peg-tuned" onClick={toggleThing}>E</div>
                <div className="tuner-peg tuner-peg-tuned" onClick={toggleThing}>A</div>
                <div className="tuner-peg" onClick={toggleThing}>D</div>
                <div className="tuner-peg" onClick={toggleThing}>G</div>
                <div className="tuner-peg" onClick={toggleThing}>B</div>
                <div className="tuner-peg" onClick={toggleThing}>e</div> */}
            </div>
        </>
    )

}

export default Tuner