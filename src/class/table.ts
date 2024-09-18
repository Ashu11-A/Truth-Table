import { TableType } from '../types/table.js'
import { writeFile } from 'fs/promises'
import { Structure } from './structure.js'

/**
 * Represents a table with a specific structure, type, and display format.
 *
 * @export
 * @class Table
 */
export class Table {
  /**
   * The type of the table, defining the format of the table (e.g., CSV or text).
   *
   * @type {TableType['type']}
   */
  public type: TableType['type']

  /**
   * The display format for the table values, determining whether values are displayed
   * as booleans (`true`/`false`) or as numbers (`1`/`0`).
   *
   * @type {TableType['display']}
   */
  public display: TableType['display']

  /**
   * The structure of the table, including variables and their corresponding values.
   *
   * @type {Structure}
   */
  private structure: Structure

  /**
   * Creates an instance of the Table class.
   *
   * @param {TableType & { structure: Structure }} param0 - An object containing the type, structure, and display format of the table.
   */
  constructor({type, structure, display }: TableType & { structure: Structure }) {
    this.type = type
    this.structure = structure
    this.display = display
  }

  /**
   * Converts the table structure into a CSV string format.
   * The `display` format determines whether the values are presented as booleans (`true`/`false`)
   * or as numbers (`1`/`0`).
   *
   * @returns {string} The CSV representation of the table.
   */
  csv (): string {
    const header = Object.values(this.structure.propositions).join(',')
    let lineContent: string = ''
    const lines: Array<boolean>[] = []

    for (const [index, element] of Object.entries(this.structure.propositions)) {
      for (const variable of this.structure.structure) {
        if (element === variable.element) lines[Number(index)] = [...lines?.[Number(index)] ?? [], variable.value]
      }
    }

    for (let line = 0; line < lines[0].length; line++) {
      for (const [index, element] of Object.entries(lines)) {
        const value = element[line]
        const content = this.display === 'boolean'
          ? value
          : (value === true
            ? 1
            : 0)

        lineContent += content + (Number(index) == (lines.length - 1) ? '' : ',')
      }
      lineContent += '\n'
    }
    return [header, lineContent].join('\n')
  }

  /**
   * Creates a file based on the table type (e.g., CSV) and writes the content to the specified file path.
   *
   * @async
   * @param {string} filePath - The path to the file where the table content will be written.
   * @returns {Promise<void>} A promise that resolves when the file has been successfully written.
   */
  async create (filePath: string): Promise<void> {
    switch (this.type) {
    case 'csv': {
      const content = this.csv()
      writeFile(filePath, content)
      break
    }
    case 'txt':
    }
  }
}
