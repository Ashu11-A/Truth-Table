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
 * Gera uma representação em Markdown de uma tabela lógica a partir da estrutura definida.
 * A tabela inclui proposições e suas respectivas expressões, formatando o conteúdo de forma
 * a garantir que todas as colunas estejam corretamente alinhadas e centralizadas.
 * 
 * @returns {string}
 */
  markdown(): string {
  // Obtém as proposições do cabeçalho da estrutura
    const header = Object.values(this.structure.propositions)
    let lineContent = ''

    /**
   * Calcula o comprimento máximo entre os arrays fornecidos.
   * 
   * @param {string[][]} arrays - Um ou mais arrays de strings.
   * @returns {number} O comprimento máximo encontrado entre as strings.
   */
    const getMaxLen = (...arrays: string[][]) => 
      Math.max(...arrays.flat().map((value) => value.length))

    /**
   * Calcula o preenchimento necessário para centralizar o conteúdo.
   * 
   * @param {string} content - O conteúdo que precisa ser centralizado.
   * @returns {{ leftPad: number, rightPad: number }} O número de espaços à esquerda e à direita.
   */
    const getPadding = (content: string) => {
      const totalSpace = maxLen - content.length
      const leftPad = Math.floor(totalSpace / 2)
      const rightPad = Math.ceil(totalSpace / 2)
      return { leftPad, rightPad }
    }

    /**
   * Formata a linha de separadores da tabela.
   * 
   * @param {string[]} row - A linha contendo os cabeçalhos ou valores.
   * @returns {string} A linha formatada com separadores.
   */
    const formatSeparator = (row: string[]) => 
      row.map(() => `|${'-'.repeat(maxLen)}`).join('') + '|\n'

    /**
   * Formata uma linha de conteúdo da tabela, centralizando cada valor.
   * 
   * @param {string[]} row - A linha contendo os valores a serem formatados.
   * @returns {string} A linha formatada com o conteúdo centralizado.
   */
    const formatRow = (row: string[]) => 
      row.map((value) => {
        const { leftPad, rightPad } = getPadding(value)
        return `|${' '.repeat(leftPad)}${value}${' '.repeat(rightPad)}`
      }).join('') + '|'

    // Tamanho do espaçamento
    const maxLen = getMaxLen(
      header,
      this.structure.structure.map((expression) => expression.element),
      this.structure.structure.map((expression) => String(expression.value))
    )

    // Adiciona o cabeçalho formatado ao conteúdo da linha
    lineContent += formatRow(header) + '\n'
    // Adiciona a linha de separadores ao conteúdo da linha
    lineContent += formatSeparator(header)

    // Itera pelas linhas da estrutura e adiciona o conteúdo formatado
    for (let line = 0; line < this.structure.rows; line++) {
      const elements = this.structure.structure.filter((element) => element.row === line)
      const rowContent = elements.map((element) => String(element.value))
      lineContent += formatRow(rowContent) + '\n'
    }

    return lineContent
  }


  /**
   * Creates a file based on the table type (e.g., CSV) and writes the content to the specified file path.
   *
   * @async
   * @param {string} filePath - The path to the file where the table content will be written.
   * @returns {Promise<void>} A promise that resolves when the file has been successfully written.
   */
  async create (filePath: string): Promise<void> {
    switch (this.type ?? 'csv') {
    case 'csv': {
      const content = this.csv()
      await writeFile(filePath, content)
      break
    }
    case 'markdown': {
      const content = this.markdown()
      await writeFile(filePath, content, { encoding: 'utf-8' })
    }
    }
  }
}
