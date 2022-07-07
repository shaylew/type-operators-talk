export type Validator<T> = (input: unknown) => input is T

export class ValidationError extends Error {}

export const string: Validator<string> = (input): input is string => {
  return typeof input === 'string'
}

export const number: Validator<number> = (input): input is number => {
  return typeof input === 'number'
}

export function optional<T> (check: Validator<T>): Validator<T | undefined> {
  return (input): input is T | undefined => {
    return input === undefined || check(input)
  }
}

export function array<T> (check: Validator<T>): Validator<T[]> {
  return (input): input is T[] => {
    return Array.isArray(input) && input.every((value) => check(value))
  }
}

export type RecordValidator<T> = {
  [K in keyof T]-?: Validator<T[K]>
}

export function record<T extends Record<never, unknown>> (
  fields: RecordValidator<T>
): Validator<T> {
  return (input): input is T => {
    if (typeof input !== 'object' || input == null) {
      return false
    }

    const object = input as Record<string, unknown>
    for (const k in fields) {
      if (!fields[k](object[k])) {
        return false
      }
    }

    return true
  }
}

interface Example {
  count: number
  name: string
  objects: Array<{
    field: string
    otherField?: number
  }>
}

export const complex = record<Example>({
  count: number,
  name: string,
  objects: array(
    record({
      field: string,
      otherField: optional(number)
    })
  )
})
