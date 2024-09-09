export * from './class/index.js'
export * from './types/index.js'

export const lettersAllowed = 'abcdefghijklmnopqrsuwxyz'.split('')

export const negationExpressions = ['¬', '~']
export const conjunctionExpressions = ['^', '∧']
export const disjunctionExpressions = ['∨', '˅']
export const conditionalExpressions = ['→', '->']
export const biconditionalExpressions = ['↔', '<>', '<->']

export const operationsAllowed = [...negationExpressions, ...conjunctionExpressions, ...disjunctionExpressions, ...conditionalExpressions, ...biconditionalExpressions]
export const subExpressions = ['(', ')']