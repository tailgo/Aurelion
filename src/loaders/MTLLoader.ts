import { Loader } from './Loader';
import { FileLoader } from './FileLoader';
import { TextureLoader } from './TextureLoader';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';
import { Mesh } from '../objects/Mesh';
import { Group } from '../objects/Group';
import { LineSegments } from '../objects/LineSegments';
import { BufferGeometry } from '../core/BufferGeometry';
import { BufferAttribute } from '../core/BufferAttribute';
import { MultiMaterial } from '../materials/MultiMaterial';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { MeshPhongMaterial } from '../materials/MeshPhongMaterial';
import { SmoothShading, FlatShading } from '../Constants';
import { FrontSide, RepeatWrapping } from '../Constants';
import { Color } from '../math/Color';
import { Vector2 } from '../math/Vector2';

interface MaterialsParam {
  name: string;
  side: number;

  color?: Color;
  specular?: Color;

  map?;
  specularMap?;
  bumpMap?;

  shininess?: number;
  opacity?: number;
  transparent?: boolean;
}

interface TextureParam {
  scale: Vector2;
  offset: Vector2;

  url?: string;
}

class MaterialCreator {

  public baseUrl: string;
  public options;
  public materialsInfo;
  public materials;
  public materialsArray;
  public nameLookup;

  public side: number;
  public wrap: number;

  public crossOrigin;
  public manager: LoadingManager;

  constructor(baseUrl: string = '', options) {
    this.baseUrl = baseUrl || '';
    this.options = options;
    this.materialsInfo = {};
    this.materials = {};
    this.materialsArray = [];
    this.nameLookup = {};

    this.side = (this.options && this.options.side) ? this.options.side : FrontSide;
    this.wrap = (this.options && this.options.wrap) ? this.options.wrap : RepeatWrapping;
  }

  public setCrossOrigin(value): void {
    this.crossOrigin = value;
  }

  public setManager(value): void {
    this.manager = value;
  }

  public setMaterials(materialsInfo) {
    this.materialsInfo = this.convert(materialsInfo);
    this.materials = {};
    this.materialsArray = [];
    this.nameLookup = {};
  }

  public convert(materialsInfo) {
    if (!this.options) {
      return materialsInfo;
    }

    let converted = {};

    for (let mn in materialsInfo) {
      // Convert materials info into normalized form based on options

      let mat = materialsInfo[mn];

      let covmat = {};

      converted[mn] = covmat;

      for (let prop in mat) {
        let save = true;
        let value = mat[prop];
        let lprop = prop.toLowerCase();

        switch (lprop) {
          case 'kd':
          case 'ka':
          case 'ks':
            // Diffuse color (color under white light) using RGB values
            if (this.options && this.options.normalizeRGB) {
              value = [value[0] / 255, value[1] / 255, value[2] / 255];
            }

            if (this.options && this.options.ignoreZeroRGBs) {
              if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
                // ignore
                save = false;
              }
            }
            break;

          default:
            break;
        }

        if (save) {
          covmat[lprop] = value;
        }
      }
    }
    return converted;
  }

  public preload() {
    for (let mn in this.materialsInfo) {
      this.create(mn);
    }
  }

  public getIndex(materialName) {
    return this.nameLookup[materialName];
  }

  public getAsArray() {
    let index = 0;

    for (let mn in this.materialsInfo) {
      this.materialsArray[index] = this.create(mn);
      this.nameLookup[mn] = index;
      index++;
    }

    return this.materialsArray;
  }

  public create(materialName) {
    if (this.materials[materialName] === undefined) {
      this.createMaterial_(materialName);
    }
    return this.materials[materialName];
  }

  public createMaterial_(materialName) {
    // Create material
    let scope = this;
    let mat = this.materialsInfo[materialName];
    let params: MaterialsParam = {
      name: materialName,
      side: this.side
    };

    function resolveURL(baseUrl, url) {
      if (typeof url !== 'string' || url === '') {
        return '';
      }
      // Absolute URL
      if (/^https?:\/\//i.test(url)) {
        return url;
      }

      return baseUrl + url;
    }

    function setMapForType(mapType, value) {

      if (params[mapType]) {
        return; // Keep the first encountered texture
      }

      let texParams = scope.getTextureParams(value, params);
      let map = scope.loadTexture(resolveURL(scope.baseUrl, texParams.url));

      map.repeat.copy(texParams.scale);
      map.offset.copy(texParams.offset);

      map.wrapS = scope.wrap;
      map.wrapT = scope.wrap;

      params[mapType] = map;
    }

    for (let prop in mat) {
      let value = mat[prop];

      if (value === '') {
        continue;
      }

      switch (prop.toLowerCase()) {
        // Ns is material specular exponent
        case 'kd':
          // Diffuse color (color under white light) using RGB values
          params.color = new Color().fromArray(value);
          break;

        case 'ks':
          // Specular color (color when light is reflected from shiny surface) using RGB values
          params.specular = new Color().fromArray(value);
          break;

        case 'map_kd':
          // Diffuse texture map
          setMapForType('map', value);
          break;

        case 'map_ks':
          // Specular map
          setMapForType('specularMap', value);
          break;

        case 'map_bump':
        case 'bump':
          // Bump texture map
          setMapForType('bumpMap', value);
          break;

        case 'ns':
          // The specular exponent (defines the focus of the specular highlight)
          // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.
          params.shininess = parseFloat(value);
          break;

        case 'd':
          if (value < 1) {
            params.opacity = value;
            params.transparent = true;
          }
          break;

        case 'Tr':
          if (value > 0) {
            params.opacity = 1 - value;
            params.transparent = true;
          }
          break;

        default:
          break;
      }
    }

    this.materials[materialName] = new MeshPhongMaterial(params);
    return this.materials[materialName];
  }

  public getTextureParams(value, matParams) {
    let texParams: TextureParam = {
      scale: new Vector2(1, 1),
      offset: new Vector2(0, 0)
    };

    let items = value.split(/\s+/);
    let pos;

    pos = items.indexOf('-bm');

    if (pos >= 0) {
      matParams.bumpScale = parseFloat(items[pos + 1]);
      items.splice(pos, 2);
    }

    pos = items.indexOf('-s');

    if (pos >= 0) {
      texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
      items.splice(pos, 4); // we expect 3 parameters here!
    }

    pos = items.indexOf('-o');

    if (pos >= 0) {
      texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
      items.splice(pos, 4); // we expect 3 parameters here!
    }

    texParams.url = items.join(' ').trim();
    return texParams;
  }

  public loadTexture(url, mapping?, onLoad?, onProgress?, onError?) {
    let texture;
    let loader = Loader.Handlers.get(url);
    let manager = (this.manager !== undefined) ? this.manager : DefaultLoadingManager;

    if (loader === null) {
      loader = new TextureLoader(manager);
    }

    if (loader.setCrossOrigin) {
      loader.setCrossOrigin(this.crossOrigin);
    }
    texture = loader.load(url, onLoad, onProgress, onError);

    if (mapping !== undefined) {
      texture.mapping = mapping;
    }

    return texture;
  }

}

export class MTLLoader {

  public manager: LoadingManager;

  public path: string;
  public texturePath: string;
  public crossOrigin;
  public materialOptions;

  constructor(manager: LoadingManager = DefaultLoadingManager) {

    this.manager = manager;

  }

  public load(
    url: string, onLoad?: Function, onProgress?: Function, onError?: Function
  ): void {
    let loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.load(url, (text) => {

      onLoad(this.parse(text));

    }, onProgress, onError);
  }

  public setPath(path: string): void {
    this.path = path;
  }

  public setTexturePath(path: string): void {
    this.texturePath = path;
  }

  public setCrossOrigin(value): void {
    this.crossOrigin = value;
  }

  public setMaterialOptions(value): void {
    this.materialOptions = value;
  }

  public parse(text) {
    let lines = text.split('\n');
    let info = {};
    let delimiter_pattern = /\s+/;
    let materialsInfo = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      line = line.trim();

      if (line.length === 0 || line.charAt(0) === '#') {
        // Blank line or comment ignore
        continue;
      }

      let pos = line.indexOf(' ');

      let key = (pos >= 0) ? line.substring(0, pos) : line;
      key = key.toLowerCase();

      let value = (pos >= 0) ? line.substring(pos + 1) : '';
      value = value.trim();

      if (key === 'newmtl') {
        // New material
        info = { name: value };
        materialsInfo[value] = info;
      } else if (info) {
        if (key === 'ka' || key === 'kd' || key === 'ks') {
          let ss = value.split(delimiter_pattern, 3);
          info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
        } else {
          info[key] = value;
        }
      }
    }

    let materialCreator = new MaterialCreator(this.texturePath || this.path, this.materialOptions);
    materialCreator.setCrossOrigin(this.crossOrigin);
    materialCreator.setManager(this.manager);
    materialCreator.setMaterials(materialsInfo);
    return materialCreator;
  }
}
