import glob from 'glob';
import fs from 'fs';
import readline from 'readline';
import { logger } from '@shared';

/**
 * FileUtils is used to do some operations on file.
 * It is used to read files and convert it to given framework tests one by one.
 */
export class FileUtils {
  public sourceFiles: any;
  public destDirectory: string;
  public parseTestCallback: any;
  constructor(source: any, dest: any, callback: any) {
    this.sourceFiles = source;
    this.destDirectory = dest;
    this.parseTestCallback = callback;
  }
  /**
   * readSourceFilesAndCreateDestFiles method is used to read all the source files
   * and generate new files in given destination folder
   */
  public readSourceFilesAndCreateDestFiles() {
    // Check destination directory exists or not.
    // If not exists create new one
    if (!fs.existsSync(this.destDirectory)) {
      fs.mkdirSync(this.destDirectory);
    }
    glob(this.sourceFiles, {}, (err, files) => {
      files.map((file) => {
        if (file.includes('/')) {
          const destFile = file.replace('.dt', '.ts');
          const destFileSplit = destFile.split('/');
          destFileSplit.splice(-1, 1);
          destFileSplit[0] = this.destDirectory;
          if (!fs.existsSync(destFileSplit.join('/'))) {
            fs.mkdirSync(destFileSplit.join('/'));
          }
          const directoryNameSplit = destFile.split('/');
          readLaymanTestAndGenerateTest(file, destFile.replace(directoryNameSplit[0], this.destDirectory), this.parseTestCallback);
        }
      });
    });
  }
}

function readLaymanTestAndGenerateTest(sourceFile: string, destinationFile: string, parseTest: any) {
  logger.info(`Reading source file ${sourceFile}`);
  logger.info(`Generating new file ${destinationFile}`);
  // Empty destination file on every new write
  fs.writeFile(destinationFile, '', () => {});
  // create line reader for source file
  const lineReader = readline.createInterface({
    input: fs.createReadStream(sourceFile),
  });
  lineReader.on('line', (line) => {
    if (parseTest(line.toString())) {
      fs.appendFileSync(destinationFile, parseTest(line.toString()) + '\n');
    }
  });
  lineReader.on('close', () => {
    logger.info(`sourceFile:: ${sourceFile} successfully converted.`);
  });
}
