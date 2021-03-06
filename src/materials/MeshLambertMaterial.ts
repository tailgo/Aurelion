import { Material } from './Material';
import { MultiplyOperation } from '../Constants';
import { Color } from '../math/Color';

export class MeshLambertMaterial extends Material {

  public color: Color;
  public map;

  public lightMap;
  public lightMapIntensity: number;

  public aoMap;
  public aoMapIntensity: number;

  public emissive: Color;
  public emissiveIntensity: number;
  public emissiveMap;

  public specularMap;

  public alphaMap;

  public envMap;
  public combine: number;
  public reflectivity: number;
  public refractionRatio: number;

  public wireframe: boolean;
  public wireframeLinewidth: number;
  public wireframeLinecap: string;
  public wireframeLinejoin: string;

  public skinning: boolean;
  public morphTargets: boolean;
  public morphNormals: boolean;

  public isMeshLambertMaterial: boolean = true;

  constructor(parameters?) {

    super();

    this.type = 'MeshLambertMaterial';

    this.color = new Color(0xfffff);
    this.map = null;

    this.lightMap = null;
    this.lightMapIntensity = 1.0;

    this.aoMap = null;
    this.aoMapIntensity = 1.0;

    this.emissive = new Color(0x000000);
    this.emissiveIntensity = 1.0;
    this.emissiveMap = null;

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
    this.morphNormals = false;

    this.setValues(parameters);
  }

  public copy(source) {
    super.copy(source);

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;

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
    this.morphNormals = source.morphNormals;

    return this;
  }

}
