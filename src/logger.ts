const PREFIX = '[SC Custom Cards]'

function withPrefix(args: unknown[]): unknown[] {
  if (typeof args[0] === 'string') {
    return [`${PREFIX} ${args[0]}`, ...args.slice(1)]
  }

  return [PREFIX, ...args]
}

export const logger = {
  log: (...args: unknown[]): void => {
    console.log(...withPrefix(args))
  },
  info: (...args: unknown[]): void => {
    console.info(...withPrefix(args))
  },
  warn: (...args: unknown[]): void => {
    console.warn(...withPrefix(args))
  },
  error: (...args: unknown[]): void => {
    console.error(...withPrefix(args))
  },
}
