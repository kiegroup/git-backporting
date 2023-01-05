
/**
 * Common logger class based on the console.log functionality
 */
 export default class Logger {

  log(prefix: string, ...str: string[]) {
    // eslint-disable-next-line no-console
    console.log.apply(console, [prefix, ...str]);
  }

  emptyLine() {
    this.log("", "");
  }
}