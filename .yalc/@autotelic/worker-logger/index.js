const consoleReporter = async queue => {
  queue.forEach(logEvent => console.log(`${logEvent['@l']}: ${logEvent[`@m`]}`))
}

class Logger {
  constructor({ reporter = consoleReporter
 }) {
    this.reporter = reporter
    this.queue = []
  }

  enqueue(level, msg) {
    this.queue.push({
      '@t': new Date().toISOString(),
      '@m': msg,
      '@l': level,
    })
  }

  info(msg) {
    this.enqueue('INFO', msg)
  }

  report() {
    return this.reporter(this.queue)
  }
}

export {
  Logger
}
