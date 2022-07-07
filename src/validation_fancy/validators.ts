import { Result, ResultRecord, ResultTuple } from './Result'

export type Validator<T> = (input: unknown) => Result<T>

export function number (input: unknown): Result<number> {
  return typeof input === 'number'
    ? Result.success(input)
    : Result.failure('expected a number')
}

export function string (input: unknown): Result<string> {
  return typeof input === 'string'
    ? Result.success(input)
    : Result.failure('expected a string')
}

export function optional<T> (check: Validator<T>): Validator<T | undefined> {
  return (input) => {
    return input === undefined ? Result.success(undefined) : check(input)
  }
}

export function array<T> (check: Validator<T>): Validator<T[]> {
  return (input) => {
    return Array.isArray(input)
      ? Result.all(input.map(check))
      : Result.failure('expected an array')
  }
}

export function tuple<T extends unknown[]> (
  checks: ValidatorTuple<T>
): Validator<T> {
  return (input) => {
    if (!Array.isArray(input) || input.length !== checks.length) {
      return Result.failure(`expected a tuple of length ${checks.length}`)
    } else {
      // As is often the case, actually _constructing_ a value of a generic
      // mapped type -- in this case a mapped tuple -- is hard for TS to check.
      // We get back an Array<Result<unknown>> here because .map doesn't
      // preserve the tuple structure, so we have to cast it.
      const results = checks.map((check, i) => check(input[i]))
      return Result.all(results as ResultTuple<T>)
    }
  }
}

// Note that the only difference between a mapped object type and a mapped tuple
// type is that this one says T has to extend unknown[]. This is another case of
// TS adding new type-level features "magically", without new syntax.
//
// If you accidentally use a mapped object type where you should've used a
// mapped tuple type, it'll try to map over all the array methods (they're
// object properties!) and you'll get a very inscrutable type error.
export type ValidatorTuple<T extends unknown[]> = {
  [K in keyof T]-?: Validator<T[K]>
}

export type ValidatorRecord<T> = {
  [K in keyof T]-?: Validator<T[K]>
}

/**
 * Builds a Validator for a record type from a record of Validators for the
 * fields.
 */
// This one is the trickest yet, but it's less bad than it looks -- apart from
// the comments, it's only a little more complicated than the tuple example.
export function record<T> (fieldValidators: ValidatorRecord<T>): Validator<T> {
  return (input) => {
    if (typeof input !== 'object' || input == null) {
      return Result.failure('expected an object')
    }

    // Convert each key into a Result -- either a failure (with a message) or
    // a success (with a [k, validatedValue] pair).
    const results = Object.keys(fieldValidators).map((key) => {
      // Object.keys(o) always returns an array of strings, even if you think
      // you know that `keyof typeof o` is some more specific type. This is
      // because a _subtype_ of `typeof o` -- which has to be substitutable in
      // place of a `typeof o` -- might have more fields, and therefore
      // include keys that aren't in `keyof typeof o`.
      //
      // In this case the conversion is safe, though. The thing TS is
      // protecting us from is the very silly situation where:
      // - You call `record` with an explicit type parameter T,
      // - you pass in an object with extra fields not mentioned in T,
      // - and you give those fields values that aren't actually a Validator.
      //
      // I would say you deserve what you get if you do that.
      const k = key as string & keyof T

      const check = fieldValidators[k]
      const field = (input as Partial<T>)[k]
      const result = check(field)
      // Attach the key on success, and give an informative message on failure.
      return result
        .map((result) => [k, result])
        .mapMessages((messages) =>
          k in input
            ? messages.map((m) => `${k}: ${m}`)
            : [`${k}: required field missing`]
        )
    })

    // We have an array of Results, which each have a [key, value] pair (if they
    // passed validation). If they all passed, combine them back into an object.
    return Result.all(results).map(Object.fromEntries)
  }
}
