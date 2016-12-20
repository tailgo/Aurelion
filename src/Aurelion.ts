'use strict';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Math Classes
 */
export * from './Math/Color';
export * from './Math/Vector2';
export * from './Math/Vector3';

global['__debug__'] = false;

class Aurelion {
  private _gConfig: JSON;
  private _gDebug: boolean = false;

  constructor() {
    if (process.argv.indexOf('--dg') > -1) {
      global['__debug__'] = true;
    }
  }

  public init(config: string = 'aurelion.json') {
    let configPath: string = path.resolve(config);
    this._gConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (global['__debug__']) {
      console.log(`Init Aurelion Core, config is ${JSON.stringify(this._gConfig)}`);
    }
  }
}

const Core: Aurelion = new Aurelion();

export { Core };
