/**
 * Defines the structure type with an input string representing a logical expression.
 *
 * @export
 * @typedef {StructureType}
 */
export type StructureType = {
    /**
     * The input string representing a logical expression (e.g., 'p ^ q').
     *
     * @type {string}
     */
    input: string
}

/**
 * Represents the structure of a truth table, containing details about each variable's value in a specific position.
 *
 * @export
 * @typedef {StructureJson}
 */
export type StructureJson = Array<{
    /**
     * The variable or element represented in the truth table (e.g., 'p', 'q').
     *
     * @type {string}
     */
    element: string

    /**
     * The boolean value for the element at a specific position in the truth table.
     *
     * @type {boolean}
     */
    value: boolean

    /**
     * The position of the element in the table, represented as a string in the format 'rowxcolumn' (e.g., '0x1').
     *
     * @type {string}
     */
    position: string

    /**
     * The column index of the element in the truth table.
     *
     * @type {number}
     */
    column: number

    /**
     * The row index of the element in the truth table.
     *
     * @type {number}
     */
    row: number
}>
