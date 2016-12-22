'use strict';
import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

global['__debug__'] = false;

class AurelionWindow {
  private _gConfig: JSON;
  private _gDebug: boolean = false;

  private _electronApp: Electron.App;
  private _electronWindow: Electron.BrowserWindow;

  constructor() {
    if (process.argv.indexOf('--dg') > -1) {
      global['__debug__'] = true;
    }

    this._electronApp = electron.app;
  }

  public init(config: string = 'aurelion.json') {
    // load config file
    let configPath: string = path.resolve(config);
    this._gConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (global['__debug__']) {
      console.log(`Init Core, config is ${JSON.stringify(this._gConfig)}`);
    }
  }

  public run() {
    if (global['__debug__']) {
      console.log('Start Core Run.');
    }

    this._electronApp.on('ready', this._createWindow);
    this._electronApp.on('activate', () => {
      if (this._electronWindow === null) {
        this._createWindow();
      }
    });
  }

  private _createWindow() {
    this._electronWindow = new electron.BrowserWindow({
      width: 800,
      height: 600
    });

    this._electronWindow.loadURL(url.format({
      pathname: path.resolve('entrance.html'),
      protocol: 'file:',
      slashes: true
    }));

    if (global['__debug__']) {
      this._electronWindow.webContents.openDevTools();
    }

    this._electronWindow.on('closed', () => {
      this._electronWindow = null;
    });
  }
}

const ALWindow: AurelionWindow = new AurelionWindow();

export { ALWindow };
