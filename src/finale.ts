// Using mapped types to relate values.

/**
 * An configuration for an editor that lets you input a T.
 *
 * Depending on the type T, different editors are available.
 */
export type Editor<T> =
  | { type: 'Basic'; btype: string }
  | { type: 'Dropdown'; options: T[] }
  // Notice the direction of the `extends` here -- if T only allows specific
  // subtypes of string, you don't want to be able to use an editor that lets
  // you type any string willy-nilly.
  | (string extends T ? 'Text' | 'LongText' : never)
  | (number extends T ? 'Number' : never)

/**
 * Metadata about a single field.
 *
 * @param TAll The types of all properties.
 * @param T The type of this field in particular.
 */
export interface FieldDescription<TAll, T> {
  /** The display label for the field. Can depend on the current properties. */
  display: string | ((properties: TAll) => string)
  /** A default value for the field. */
  default: T
  /** What editor to use for the field. */
  editor: Editor<T>
}

/** A record mapping each field name to metadata about that field. */
export type FieldDescriptions<TAll> = {
  [K in keyof TAll]: FieldDescription<TAll, TAll[K]>
}

/** The TS types for the properties of an element. */
export interface ContainerFields {
  direction: 'row' | 'column'
  gap: number
  altText?: string
}

/** Information about the properties for the PE to use. */
export const containerFieldDescriptions: FieldDescriptions<ContainerFields> = {
  direction: {
    display: 'Container Type',
    // what if you forget a default?
    default: 'column',
    editor: {
      type: 'Dropdown',
      // what if you add an illegal options?
      options: ['row', 'column']
    }
  },
  gap: {
    // What if you refer to a nonexistent property?
    display: (properties) =>
      `${properties.direction === 'column' ? 'Column' : 'Row'} Gap`,
    default: 0,
    editor: 'Number'
  },
  altText: {
    display: 'Alt Text',
    default: undefined,
    // What if you pick an editor that doesn't work with the type?
    editor: 'LongText'
  }
}

/**
 * Get the display name for a field, which might depend on the current value of
 * the other properties.
 *
 * Works for any field, any set of properties, and any field description object
 * -- so long as the field name, the property values, and the field descriptions
 * match up with each others' types.
 */
export function getFieldDisplay<T> (
  field: keyof T,
  description: FieldDescriptions<T>,
  properties: T
): string {
  const display = description[field].display
  if (typeof display === 'function') {
    return display(properties)
  } else {
    return display
  }
}
