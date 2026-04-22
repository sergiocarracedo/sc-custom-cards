import { describe, it, expect } from 'vitest'
import { getBaseColor } from '../utils'

describe('utils', () => {
  describe('getBaseColor', () => {
    it('should return valid hex color when passed a valid hex string', () => {
      const mockElement = document.createElement('div')
      expect(getBaseColor(mockElement, '#ff0000')).toBe('#ff0000')
    })

    it('should return valid hex color when passed a 3-digit hex string', () => {
      const mockElement = document.createElement('div')
      expect(getBaseColor(mockElement, '#f00')).toBe('#ff0000')
    })

    it('should handle numeric array for color', () => {
      const mockElement = document.createElement('div')
      // Array configuration from yaml often comes through as number array
      expect(getBaseColor(mockElement, [142, 26, 26])).toBe('#8e1a1a')
    })

    it('should correctly format numeric arrays with single digit hex values', () => {
      const mockElement = document.createElement('div')
      // e.g. 10 -> 0a
      expect(getBaseColor(mockElement, [10, 200, 5])).toBe('#0ac805')
    })

    it('should retrieve custom property from element', () => {
      const mockElement = document.createElement('div')
      mockElement.style.setProperty('--my-color', '#123456')
      document.body.appendChild(mockElement)

      expect(getBaseColor(mockElement, 'var(--my-color)')).toBe('#123456')

      document.body.removeChild(mockElement)
    })
  })
})
