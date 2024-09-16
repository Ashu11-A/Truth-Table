<div align="center">

# Truth Table

![license-info](https://img.shields.io/github/license/Ashu11-A/Truth-Table?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af)
![stars-infoa](https://img.shields.io/github/stars/Ashu11-A/Truth-Table?colorA=302D41&colorB=f9e2af&style=for-the-badge)
![Last-Comitt](https://img.shields.io/github/last-commit/Ashu11-A/Truth-Table?style=for-the-badge&colorA=302D41&colorB=b4befe)

![Comitts Year](https://img.shields.io/github/commit-activity/y/Ashu11-A/Truth-Table?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af&authorFilter=Ashu11-A&label=COMMIT+ACTIVITY)
![reposize-info](https://img.shields.io/github/languages/code-size/Ashu11-A/Truth-Table?style=for-the-badge&colorA=302D41&colorB=90dceb)

</div>

## 🔍 | What can this do?

This project is based on AST (Abstract Syntax Tree). It can both generate the AST and validate the syntax of the input, transforming it into a consumable data structure to generate any type of representation, such as CSV tables. In case of an error, it is possible to handle the error, allowing the display of the line and column where a syntax error is present. Below is an example of how to work with this library:

## 💫 Main Features:

- Syntax validation and error location reporting
- Abstract Syntax Tree (AST) generation
- Support for generating truth tables from parsed logic expressions
- Flexible output formats (e.g., CSV)


## 🚀 | Getting Started
To get a local copy up and running, follow these simple steps:

Prerequisites
Node.js (v20+ recommended)

NPM (recommended)

### Installation
```sh
npm i truth-table-ast
```

## 📚 | Usage
### 📟 | Terminal:

```sh
tt -p "p ˅ (p ^ q)"
# OR
npx truth-table -p "p ˅ (p ^ q)" -o table.csv
```

#### 📄 | Help:

```txt
Usage: ttt [options]

  Options:

   -h --help        Show all available arguments
   -o --output      File where the truth table will be saved
   -d --display     How the data will be displayed in the table, supports: boolean, number
   -t --type        Type of file the table will be saved in (csv | text)
   -p --proposition Define proposition to generate truth table
```

### 👨‍💻 | Code:
Here's an example of how to work with this library:
```ts
// ESM:
import { AST, Structure, Table } from 'truth-table-ast'
// Communjs:
// const { AST, Structure, Table } = require('truth-table-ast')

const input = 'p ˅ (p ^ q)'
const parser = await (new AST(input)).loader() // Loader must be initialized at least once, before any parse interaction
const ast = parser.parse()
// await parser.save('ast.json')

if (AST.isUnexpectedError(ast)) throw new Error(JSON.stringify(ast, null, 2))

const structure = new Structure(ast).generate()
// await structure.save('structure.json')

await (new Table({
  structure,
  type: 'csv',
  display: 'boolean'
})).create('table.csv')
```

## ✨ | Outputs

#### 📜 | AST:
The AST (Abstract Syntax Tree) generated from the input of p ˅ (p ^ q):
```json
[
  {
    "value": "p",
    "type": "Proposition",
    "negatived": false,
    "loc": {
      "start": {
        "line": 1,
        "column": 0
      },
      "end": {
        "line": 1,
        "column": 0
      }
    }
  },
  {
    "type": "Operation",
    "value": "˅",
    "key": "Disjunction",
    "loc": {...}
  },
  {
    "type": "SubExpression",
    "body": [
      {
        "value": "p",
        "type": "Proposition",
        "negatived": false,
        "loc": {...}
      },
      {
        "type": "Operation",
        "value": "^",
        "key": "Conjunction",
        "loc": {...}
      },
      {
        "value": "q",
        "type": "Proposition",
        "negatived": false,
        "loc": {...}
      }
    ],
    "negatived": false,
    "loc": {...}
  }
]
```

#### 📃 | Structure:
The structured data generated from the AST to generate the truth table:
```json
[
  {
    "type": "Variable",
    "element": "p",
    "value": true,
    "column": 0,
    "row": 0,
    "position": "0x0"
  },
  {
    "type": "Variable",
    "element": "q",
    "value": true,
    "column": 1,
    "row": 0,
    "position": "0x1"
  },
  {
    "type": "Result",
    "element": "p ˅ (p ^ q)",
    "value": true,
    "column": 2,
    "row": 0,
    "position": "0x2"
  },
  {...},
  {
    "type": "Variable",
    "element": "p",
    "value": false,
    "column": 0,
    "row": 3,
    "position": "3x0"
  },
  {
    "type": "Variable",
    "element": "q",
    "value": false,
    "column": 1,
    "row": 3,
    "position": "3x1"
  },
  {
    "type": "Result",
    "element": "p ˅ (p ^ q)",
    "value": false,
    "column": 2,
    "row": 3,
    "position": "3x2"
  }
]
```

#### 📋 | Truth Table:
|   p   |   q   | p ˅ (p ^ q)
|-------|-------|------------|
| true  | true  | true       |
| true  | false | true       |
| false | true  | false      |
| false | false | false      |

## 🤝 | Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## 📝 | License
Distributed under the MIT License. See LICENSE.txt for more information.