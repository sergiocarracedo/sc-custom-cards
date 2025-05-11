export const getBaseColor = (el: Element, color: string): string => {
  const normalizeHexColor = (hex: string): string => {
    // Check if it's a 3-digit hex color
    if (/^#([0-9a-f]{3})$/i.test(hex)) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    }
    return hex
  }

  let value = color

  if (color.startsWith('var(')) {
    value = getComputedStyle(el).getPropertyValue(color.replace('var(', '').replace(')', '')).trim()
  }

  return normalizeHexColor(value)
}
