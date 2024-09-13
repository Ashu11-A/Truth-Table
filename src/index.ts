export * from './class/index.js'
export * from './types/index.js'

export const lettersAllowed = 'abcdefghijklmnopqrsuwxyz'.split('')

export const negationExpressions = ['¬', '~']
export const conjunctionExpressions = ['^', '∧']
export const disjunctionExpressions = ['∨', '˅']
export const conditionalExpressions = ['→', '->']
export const biconditionalExpressions = ['↔', '<>', '<->']
export const xorExpressions = ['⊕']
export const subExpressions = ['(', ')']

export const operationsAllowed = [...negationExpressions, ...conjunctionExpressions, ...disjunctionExpressions, ...conditionalExpressions, ...biconditionalExpressions, ...xorExpressions]