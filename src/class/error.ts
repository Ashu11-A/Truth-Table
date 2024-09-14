import { BaseAST } from '../types/ast.js'

export type ErrorType = BaseAST & {
  name: string
  message: string
  code: string
  statusCode: number
}

type UnexpectedType = BaseAST & {
  origin: string,
  expected: string[],
  unexpected: string
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
      statusCode: 2422, // code 2422: Windows Server 2008 R2
      loc
    })
  }
}