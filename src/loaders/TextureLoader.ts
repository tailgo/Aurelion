import { RGBAFormat, RGBFormat } from '../Constants';
import { ImageLoader } from './ImageLoader';
import { Texture } from '../textures/Texture';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';

export class TextureLoader {
  public manager: LoadingManager;
  public path: string;

  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }

  public load(
    url: string,
    onLoad?: Function,
    onProgress?: Function,
    onError?: Function
  ) {
    let texture = new Texture();

    let loader = new ImageLoader(this.manager);
    loader.setPath(this.path);
    loader.load(url, (image) => {
      let isJPEG = url.search(/\.(jpg|jpeg)$/) > 0
        || url.search(/^data\:image\/jpeg/) === 0;

        texture.format = isJPEG ? RGBFormat : RGBAFormat;
        texture.image = image;
        texture.needsUpdate = true;

        if (onLoad) {
          onLoad(texture);
        }
    }, onProgress, onError);

    return texture;
  }

  public setPath(value: string): TextureLoader {
    this.path = value;
    return this;
  }

}
