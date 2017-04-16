import { Cache } from './Cache';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';

export class ImageLoader {

  public manager: LoadingManager;

  public path: string; // base path from the file

  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }

  public load() {

  }

  public setPath() {

  }
}
