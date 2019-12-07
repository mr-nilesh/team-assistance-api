let describeKeyword: string;
let mainSplitter: string;
let itKeyword: string;
export class ParseTemplate {
  public config: any;
  constructor(configObj: any) {
    this.config = configObj;
    describeKeyword = configObj.describe;
    itKeyword = configObj.it;
    mainSplitter = configObj.splitBy.main;
  }
  /**
   * describeTemplate method is used to replace suite to `describe` format
   * @param {*} line line from the file
   */
  public describeTemplate(line: string) {
    const suite = line.split(mainSplitter);
    const newString = `describe(${suite[1].trim()}, () => {`;
    const startPosition = line.indexOf(describeKeyword);
    return line.replace(line.substring(startPosition, line.length), newString);
  }

  /**
   * scenarioTemplate method is used to replace scenario to `it` format
   * @param {*} line line from the file
   */
  public scenarioTemplate(line: string) {
    const scenario = line.split(mainSplitter);
    const newString = `it(${scenario[1].trim()}, () => {`;
    const startPosition = line.indexOf(itKeyword);
    return line.replace(line.substring(startPosition, line.length), newString);
  }
}
