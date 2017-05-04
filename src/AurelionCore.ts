import * as fs from 'fs';
import * as path from 'path';

import { ALWindow } from './AurelionWindow';

class AurelionCore {

  public missions;
  public missionsNumber: number;

  constructor() {
    let configPath = path.resolve('./aurelion.json');
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!config['entrance']) {
      console.error('Error: aurelion.json file has no "entrance" name.');
      return;
    }
    let windowTitle = '';
    if (config['window']) {
      windowTitle = config['window']['title'] ? config['window']['title'] : '';
    }
    let renderMainFile = config['entrance'];

    let html = '<!DOCTYPE html>' +
      `<html><head><meta charset="UTF-8"><title>${windowTitle}</title>` +
      '<style>body{margin:0;padding:0;border:0}canvas{display:block}</style></head>' +
      `<body><script src="./app/three.js"></script><script src="${renderMainFile}"></script></body></html>`;

    fs.writeFileSync('entrance.html', html);

    this.missions = [];
    this.missionsNumber = 1;
  }

  public startApp() {
    console.log('start App');
    ALWindow.init();
    ALWindow.run();
  }
}

const ALCore: AurelionCore = new AurelionCore();

export { ALCore };
