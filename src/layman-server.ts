import fs from 'fs';
import { ProtractorHandler, CypressHandler, WebdriverIOHandler } from '@handlers';
import { logger } from '@shared';
const selectedFramework = process.env.FRAMEWORK || 'protractor';
try {
  const laymanConfigFile = fs.readFileSync('layman-config.json');
  const laymanConfig = JSON.parse(laymanConfigFile.toString());
  if (selectedFramework === 'protractor') {
    logger.info('Generating protractor testcases.');
    const protractorHandler = new ProtractorHandler();
    protractorHandler.generate(laymanConfig);
  } else if (selectedFramework === 'cypress') {
    logger.info('Generating cypress testcases.');
    const cypressHandler = new CypressHandler();
    cypressHandler.generate(laymanConfig);
  } else if (selectedFramework === 'webdriverio') {
    logger.info('Generating webdriverio testcases.');
    const webdriverIOHandler = new WebdriverIOHandler();
    webdriverIOHandler.generate(laymanConfig);
  }
} catch (err) {
  logger.error('layman-config not found. Please add it and try again.');
}
