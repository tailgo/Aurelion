import { Material } from './Material';
import { MultiplyOperation } from '../Constants';
import { Color } from '../math/Color';

export class MeshBasicMaterial extends Material {

  public alphaMap;
  public aoMap;
  public aoMapIntensity: number;

  public color: Color;

  public combine: number;

  public isMeshBasicMaterial: boolean = true;

  public envMap;
  public lightMap;
  public lightMapIntensity: number;
  public lights: boolean;

  public map;

  public morphTargets: boolean;

  public reflectivity: number;
  public refractionRatio: number;

  public skinning: boolean;

  public specularMap;

  public wireframe: boolean;
  public wireframeLinecap: string;
  public wireframeLinejoin: string;
  public wireframeLinewidth: number;

  constructor(parameters) {
    super();

    this.type = 'MeshBasicMaterial';
    this.color = new Color(0xffffff);

    this.map = null;

    this.lightMap = null;
    this.lightMapIntensity = 1.0;

    this.aoMap = null;
    this.aoMapIntensity = 1.0;

    this.specularMap = null;

    this.alphaMap = null;

    this.envMap = null;
    this.combine = MultiplyOperation;
    this.reflectivity = 1;
    this.refractionRatio = 0.98;

    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';

    this.skinning = false;
    this.morphTargets = false;

    this.lights = false;
    this.setValues(parameters);
  }

  public copy(source: MeshBasicMaterial) {
    super.copy(source);
    this.color.copy(source.color);

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.specularMap = source.specularMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;

    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;

    return this;
  }
}
