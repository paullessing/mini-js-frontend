namespace mj.logger {
  type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'off';
  const logLevels: readonly LogLevel[] = ['debug', 'log', 'warn', 'error', 'off'] as const;

  export interface Logger {
    debug(...args: any[]): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    setLogLevel(level: LogLevel): void;
  }


  function logLevel(level: LogLevel, currentLevel: ()=> LogLevel, log: (...args: any[]) => void): (...args: any[]) => void {
    const numericLevel = logLevels.indexOf(level);
    return (...args: any[]) => {
      logLevels.indexOf(currentLevel()) >= numericLevel ? log(...args) : void(0);
    };
  }

  export const consoleLogger: Logger & { _logLevel: LogLevel } = {
    _logLevel: 'error' as LogLevel,
    setLogLevel(level: LogLevel) {
      this._logLevel = level;
    },
    debug: logLevel('debug', () => consoleLogger._logLevel, console.info.bind(console)),
    log:   logLevel('log',   () => consoleLogger._logLevel, console.log.bind(console)),
    warn:  logLevel('warn',  () => consoleLogger._logLevel, console.warn.bind(console)),
    error: logLevel('error', () => consoleLogger._logLevel, console.error.bind(console)),
  };
}
