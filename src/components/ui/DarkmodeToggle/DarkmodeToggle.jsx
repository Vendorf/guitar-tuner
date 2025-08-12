import './DarkmodeToggle.css'

/**
 * Floating darkmode toggle component with animated sun/moon
 * 
 * Floats at top/left on large screens and bottom/left on small screens
 * 
 * @param {Object} param
 * @param {boolean} param.darkMode whether dark mode is active
 * @param {()=>void} param.toggleDark callback to toggle dark mode
 * @returns div with darkmode toggle
 */
const DarkmodeToggle = ({ darkMode, toggleDark }) => {
    return (
        <div className='darkmode-float-wrapper'>
            <div className='darkmode-toggle' onClick={() => toggleDark()}>
                {/* <div className={`sun ${darkMode ? 'sun-off' : ''}`}>A</div> */}
                {/* <div className={`moon ${darkMode ? '' : 'moon-off'}`}>B</div> */}

                <svg
                    className={`sun ${darkMode ? 'sun-off' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="hsla(41, 100%, 65%, 1.00)"
                    viewBox="0 0 32 32"
                >
                    <clipPath id="theme-toggle__expand__cutout">
                        <path d="M0-11h25a1 1 0 0017 13v30H0Z" />
                    </clipPath>
                    <g clipPath="url(#theme-toggle__expand__cutout)">
                        <circle cx="16" cy="16" r="8.4" />
                        <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
                    </g>
                </svg>

                <svg
                    className={`moon ${darkMode ? '' : 'moon-off'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32">
                    <defs>
                        <mask id="Mask">
                            <rect width="32" height="32" fill="white" />
                            <circle cx="22" cy="10" r="10" fill="black" />
                        </mask>
                    </defs>
                    <circle cx="16" cy="16" r="10" fill="hsl(0, 0%, 78%)" mask="url(#Mask)" />
                </svg>
            </div>
        </div>
    )
}

export default DarkmodeToggle