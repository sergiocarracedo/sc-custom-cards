export const getBaseColor = (el: Element, color: string | number[]): string => {
  const normalizeHexColor = (hex: string): string => {
    // Check if it's a 3-digit hex color
    if (/^#([0-9a-f]{3})$/i.test(hex)) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    }
    return hex
  }

  if (Array.isArray(color)) {
    const hexColor = color
      .slice(0, 3)
      .map((c) => {
        const hex = Number(c).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
    return normalizeHexColor('#' + hexColor)
  }

  let value = color

  if (typeof color === 'string' && color.startsWith('var(')) {
    value = getComputedStyle(el).getPropertyValue(color.replace('var(', '').replace(')', '')).trim()
  }

  return normalizeHexColor(value as string)
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

const RED = 0.2126
const GREEN = 0.7152
const BLUE = 0.0722

const GAMMA = 2.4

export function colorToDec(el: Element, color: string | number[]): [number, number, number] {
  const baseColor = getBaseColor(el, color)

  // Extract the r, g, b components from the #rrggbb string
  const r = parseInt(baseColor.slice(1, 3), 16)
  const g = parseInt(baseColor.slice(3, 5), 16)
  const b = parseInt(baseColor.slice(5, 7), 16)

  return [r, g, b]
}

export function luminance(el: Element, color: string | number[]) {
  const [r, g, b] = colorToDec(el, color)
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA)
  })
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE
}

export function contrast(
  el: Element,
  color1: string | number[],
  color2: string | number[],
): number {
  const lum1 = luminance(el, color1)
  const lum2 = luminance(el, color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}
