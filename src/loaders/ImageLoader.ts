import { Cache } from './Cache';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';

const IMAGE_NS = 'http://www.w3.org/1999/xhtml';

export class ImageLoader {

  public manager: LoadingManager;

  public path: string; // base path from the file
  public crossOrigin;

  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }

  public load(
    url: string = '',
    onLoad?: Function,
    onProgree?: Function,
    onError?: Function
  ) {
    if (this.path !== undefined) {
      url = this.path + url;
    }

    let cached = Cache.get(url);

    if (cached !== undefined) {
      this.manager.itemStart(url);
      setTimeout(() => {
        if (onLoad) {
          onLoad(cached);
          this.manager.itemEnd(url);
        }
      }, 0);

      return cached;
    }

    let image = <HTMLImageElement>document.createElementNS(IMAGE_NS, 'img');

    image.addEventListener('load', () => {
      Cache.add(url, this);

      if (onLoad) {
        onLoad(this);
      }

      this.manager.itemEnd(url);
    }, false);

    image.addEventListener('error', () => {
      if (onError) {
        onError(event);
      }

      this.manager.itemError(url);
    }, false);

    this.manager.itemStart(url);
    image.src = url;

    return image;
  }

  public setPath(value: string): ImageLoader {
    this.path = value;
    return this;
  }

  public setCrossOrigin(value) {
    this.crossOrigin = value;
    return this;
  }
}
