/**
 * @typedef {Object} HSLColor
 * @property {number} h hue from 0 to 255
 * @property {number} s percent saturation from 0 to 100
 * @property {number} l percent lightness from 0 to 100
 */

/**
 * Interpolates between two HSL colors
 * @param {HSLColor} c1 HSL color 1  as {h, s, l}
 * @param {HSLColor} c2 HSL color 1  as {h, s, l}
 * @param {number} t interpolation factor from 0 to 1
 * @returns {HSLColor} interpolated color
 */
function interpolateHsl(c1, c2, t) {
    const h = c1.h + ((c2.h - c1.h) * t)
    const s = 100
    const l = 50

    return { h, s, l }
}

export { interpolateHsl }