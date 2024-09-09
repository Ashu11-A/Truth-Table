export type Position = {
    line: number,
    column: number
}

export type SourceLocation = {
    start: Position,
    end: Position
}

export type Base = {
    loc: SourceLocation
}

export type Proposition = {
    type: 'Proposition',
    value: string
    negatived: boolean,
}

export type OperationValues = '¬' | '~' | '∧' | '^' | '∨' | '→' | '↔'

export enum OperationKey {
    Negation = 'Negation',
    Conjunction = 'Conjunction',
    Disjunction = 'Disjunction',
    Conditional = 'Conditional',
    Biconditional = 'Biconditional',
    None = 'None'
}

export type OperationNegation = {
    key: OperationKey.Negation | 'Negation'
}

export type OperationConjunction = {
    key: OperationKey.Conjunction | 'Conjunction'
}

export type OperationDisjunction = {
    key: OperationKey.Disjunction | 'Disjunction'
}

export type OperationConditional = {
    key: OperationKey.Conditional | 'Conditional'
}

export type OperationBiconditional = {
    key: OperationKey.Biconditional | 'Biconditional'
}

export type OperationNone = {
    key: OperationKey.None | 'None'
}

export type Operation = (
    | OperationNegation
    | OperationConjunction
    | OperationDisjunction
    | OperationConditional
    | OperationBiconditional
    | OperationNone
) & {
    value: string,
    type: 'Operation'
}

export type SubExpression = {
    type: 'SubExpression',
    negatived: boolean,
    body: Node[]
}

export type ErrorSintaxe = SourceLocation & {
    message: string
}

export type Tokanizer = {
    value: OperationValues | string,
    loc: SourceLocation
}

export type Node = (Proposition | Operation | SubExpression) & Base
