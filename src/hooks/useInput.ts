import { computed, ref, type Ref } from 'vue'

export function useInput<T>(initialValue: T): {
  value: Ref<T>
  reset: () => void
  isDirty: Readonly<Ref<boolean>>
} {
  const initial = structuredClone(initialValue)
  const value = ref(structuredClone(initialValue)) as Ref<T>
  const isDirty = computed(() => JSON.stringify(value.value) !== JSON.stringify(initial))

  function reset(): void {
    value.value = structuredClone(initial)
  }

  return { value, reset, isDirty }
}
