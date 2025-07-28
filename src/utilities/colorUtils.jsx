/**
 * Interpolates between two HSL colors
 * @param {*} c1 HSL color 1  as {h, s, l}
 * @param {*} c2 HSL color 1  as {h, s, l}
 * @param {*} t interpolation factor from 0 to 1
 */
function interpolateHsl(c1, c2, t) {
    const h = c1.h + ((c2.h - c1.h) * t)
    const s = 100
    const l = 50

    return { h, s, l }
}

export { interpolateHsl }