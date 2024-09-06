/**
 * Defines the type and display format options for a table.
 *
 * @export
 * @typedef {TableType}
 */
export type TableType = {
    /**
     * The type of the table, which determines how the table will be handled (e.g., 'csv' for CSV format or 'text' for plain text).
     *
     * @type {'csv' | 'text'}
     */
    type: 'csv' | 'text'
  
    /**
     * The optional display format for the table values. If provided, it specifies whether the values will be displayed as booleans ('boolean')
     * or as numbers ('number'). Defaults to 'boolean' if not specified.
     *
     * @type {'boolean' | 'number'}
     * @optional
     */
    display?: 'boolean' | 'number'
  }
  