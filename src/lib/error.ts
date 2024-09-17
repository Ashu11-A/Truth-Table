import { BaseAST } from '../types/ast.js'

export type ErrorType = BaseAST & {
  name: string
  message: string
  code: string
  statusCode: number
}

export type UnexpectedType = BaseAST & {
  origin: string,
  expected: string[],
  unexpected: string
}

export type NotInstantiatedType = BaseAST & {
  method: string
}

export type UndeterminedType = BaseAST & {
  value: string
}

export class BaseError extends Error {
  public code: string
  public statusCode: number
  public loc : ErrorType['loc']

  constructor({ code, message, statusCode, loc }: Omit<ErrorType, 'name'>) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.loc = loc

    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): ErrorType {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      loc: this.loc
    }
  }
}

export class UnexpectedError extends BaseError {
  constructor({ expected, origin, unexpected, loc }: UnexpectedType) {
    super({
      message: `It was expected that, after an ${origin} element, there would be a ${expected.join(' or ')} element, but there were ${unexpected}`,
      code: 'Unexpected',
      statusCode: 500,
      loc
    })
  }
}

export class NotInstantiatedError extends BaseError {
  constructor({ loc, method }: NotInstantiatedType) {
    super({
      message: `The ${method} method is not instantiated`,
      code: 'NotInstantiated',
      statusCode: 404,
      loc
    })
  }
}

export class UndeterminedError extends BaseError {
  constructor({ loc, value }: UndeterminedType) {
    super({
      message: `It was not possible to determine what the value would be: ${value}`,
      code: 'Undetermined',
      statusCode: 406,
      loc
    })
  }
}