import { describe, expect, it } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('tracks edits and restores the initial value', () => {
    const input = useInput({ name: 'Delcom' })
    expect(input.isDirty.value).toBe(false)
    input.value.value.name = 'New name'
    expect(input.isDirty.value).toBe(true)
    input.reset()
    expect(input.value.value).toEqual({ name: 'Delcom' })
    expect(input.isDirty.value).toBe(false)
  })

  it('clones nested initial values so reset does not retain edits', () => {
    const input = useInput({ preferences: { currency: 'IDR' } })
    input.value.value.preferences.currency = 'USD'
    input.reset()
    expect(input.value.value.preferences.currency).toBe('IDR')
  })
})
