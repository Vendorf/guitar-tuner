
import { TUNINGS } from '../../utilities/tuner'
import './TunerDisplay.css'

const TunerDisplay = () => {

    // Here compute all shit for tuning?
    // Alternatively can make a TuningContext that uses the AudioContext.... idk
    // that would do all the logic for figuring out nearest string, etc, then can use that
    // in Tuner and pass down or whatever to render

    // const strings = [
    //     { freq: 110, name: "E" },
    //     { freq: 110, name: "A" },
    //     { freq: 110, name: "D" },
    //     { freq: 110, name: "G" },
    //     { freq: 110, name: "B" },
    //     { freq: 110, name: "e" },
    // ]
    //TODO replace and use key='' in mapping

    const strings = TUNINGS['standard'].strings

    return (
        <>
            <div className='tuner-wrapper card'>
                {strings.map((s) =>
                    <div className='tuner-peg'>{s}</div>)
                }
            </div>
        </>
    )

}

export default TunerDisplay