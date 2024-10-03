import { BaseError } from '../lib'
import { OperationValues, SourceLocation } from './analyzer'

export type Tokenizer = {
    value: OperationValues | string,
    loc: SourceLocation
}

export type TokenizerContent = {
    tokens: Tokenizer[]
    exceptions: Array<BaseError>
}