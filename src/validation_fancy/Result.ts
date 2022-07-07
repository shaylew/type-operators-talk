/** Represents the result of a computation: ok (with a value) or failed. */
export type Result<T> = Success<T> | Failure<T>
export type Success<T> = { ok: true; value: T } & ResultMethods<T>
export type Failure<T> = { ok: false; messages: string[] } & ResultMethods<T>

/** Wraps each element of a tuple or array type with Result. */
export type ResultTuple<T extends unknown[]> = {
  [I in keyof T]: Result<T[I]>
}

/** Wraps each value of a record type with Result. */
export type ResultRecord<T> = {
  [K in keyof T]: Result<T[K]>
}

// These are "static methods" on the "Result class", except for the part where
// we want to export a union type and classes can't be unions. So instead
// they're methods on an exported object value, which has the same name as the
// exported union type.

// (This is, under the hood, really just what classes are -- a value that's the
// constructor function with any static methods, and a type for the objects you
// construct with it.)

// Intentionally naming the variable the same as the type!
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Result = {
  success<T> (value: T): Success<T> {
    return new _Result(true, value, undefined)
  },

  failure<T> (message: string): Failure<T> {
    return Result.failures([message])
  },

  failures<T> (messages: string[]): Failure<T> {
    // Have to give the type parameters explicitly. Passing undefined as the
    // second argument means there's nothing for TS to go on when determining
    // the type parameter, and in this case it guesses wrong without the nudge.
    return new _Result<false, T>(false, undefined, messages)
  },

  /**
   * Convert a tuple of Result values into a Result with a tuple in it.
   *
   * If any of the Results were a Failure, returns a Failure combining all their
   * messages. Otherwise, returns a Success with a tuple containing each of
   * their values.
   */
  all<T extends unknown[]> (results: ResultTuple<T>): Result<T> {
    let failed = false
    const messages: string[] = []

    const succeeded = results.map((result) => {
      if (result.ok) {
        return result.value
      } else {
        failed = true
        messages.push(...result.messages)
        return undefined
      }
    })

    if (!failed) {
      // Cast is safe -- if none of the results were failures, we have a value
      // in every slot.
      return Result.success(succeeded as T)
    } else {
      return Result.failures(messages)
    }
  }
}

// Now let's define some methods for Result<T> values to support, because
// getting to press period and see useful completions is one of the best things
// about having types. It's worth some complications on the implementation of an
// API to provide nice things for the API's users.

/** Methods on a {@link Result}. */
export interface ResultMethods<T> {
  /** Transform the result value of a Success, leaving failures unchanged. */
  map: <S>(fn: (value: T) => S) => Result<S>
  /** Transform the message list of a Failure, leaving successes unchanged. */
  mapMessages: (fn: (messages: string[]) => string[]) => Result<T>
}

class _Result<B extends boolean, T> implements ResultMethods<T> {
  // Using a subtype of boolean here instead of just boolean means we can have
  // other types depend on whether B is (statically known to be) true or false.
  readonly ok: B

  // Using "declare" here keeps these from both being initialized to undefined.
  // We only want one of them present, or Result values will print weirdly.

  // The conditional type here says value is undefined if B is false, and
  // messages is undefined if B is true. Note
  declare readonly value: B extends true ? T : undefined
  declare readonly messages: B extends false ? string[] : undefined

  constructor (
    ok: B,
    value: B extends true ? T : undefined,
    messages: B extends false ? string[] : undefined
  ) {
    this.ok = ok
    if (ok) {
      this.value = value
    } else {
      this.messages = messages
    }
  }

  // This "cast function" asserts that a _Result<B, T> is always a Result<T>.
  // This isn't automatically true by subtyping, because -- since the class
  // can't be a sum type -- it's legal for an instance of _Result<boolean, T> to
  // have ok = true but value = undefined.
  //
  // The constructor won't ever allow this to happen, so this cast is safe.
  //
  // (The # in the name makes this an ES6 private method; it's not TS specific.)
  #asResult (): Result<T> {
    return this as Result<T>
  }

  mapMessages (fn: (messages: string[]) => string[]): Result<T> {
    const self = this.#asResult()
    return self.ok ? self : Result.failures(fn(self.messages))
  }

  map<S> (fn: (value: T) => S): Result<S> {
    const self = this.#asResult()
    return self.ok
      ? Result.success(fn(self.value))
      : Result.failures(self.messages)
    // Failure<S> isn't the same type as Failure<T>, because the type of the
    // methods are different. It's mostly also safe to use `self as Result<S>`
    // instead of creating a new Result.failures object here... except if
    // someone subclassed _Result to also keep around a T then suddenly you'd be
    // casting T to S, not just absence-of-T to absence-of-S!
    //
    // Quite often, when TS refuses to believe in some "obvious" type
    // equivalence, it's because there's some non-obvious case where that
    // equivalence isn't actually true.
  }
}
