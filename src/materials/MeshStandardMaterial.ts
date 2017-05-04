import { Material } from './Material';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';

export class MeshStandardMaterial extends Material {

  public defines;

  public color: Color;
  public roughness: number;
  public metalness: number;

  public map;

  public lightMap;
  public lightMapIntensity: number;

  public aoMap;
  public aoMapIntensity: number;

  public emissive: Color;
  public emissiveIntensity: number;
  public emissiveMap;

  public bumpMap;
  public bumpScale: number;

  public normalMap;
  public normalScale: Vector2;

  public displacementMap;
  public displacementScale: number;
  public displacementBias: number;

  public roughnessMap;

  public metalnessMap;

  public alphaMap;

  public envMap;
  public envMapIntensity: number;

  public refractionRatio: number;

  public wireframe: boolean;
  public wireframeLinewidth: number;
  public wireframeLinecap: string;
  public wireframeLinejoin: string;

  public skinning: boolean;
  public morphTargets: boolean;
  public morphNormals: boolean;

  constructor(parameters?) {
    super();

    this.defines = { 'STANDARD': '' };

    this.type = 'MeshStandardMaterial';

    this.color = new Color(0xffffff); // diffuse
    this.roughness = 0.5;
    this.metalness = 0.5;

    this.map = null;

    this.lightMap = null;
    this.lightMapIntensity = 1.0;

    this.aoMap = null;
    this.aoMapIntensity = 1.0;

    this.emissive = new Color(0x000000);
    this.emissiveIntensity = 1.0;
    this.emissiveMap = null;

    this.bumpMap = null;
    this.bumpScale = 1;

    this.normalMap = null;
    this.normalScale = new Vector2(1, 1);

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.roughnessMap = null;

    this.metalnessMap = null;

    this.alphaMap = null;

    this.envMap = null;
    this.envMapIntensity = 1.0;

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

  public clone() {
    return new MeshStandardMaterial().copy(this);
  }

  public copy(source) {
    super.copy(source);

    this.color.copy(source.color);
    this.roughness = source.roughness;
    this.metalness = source.metalness;

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.roughnessMap = source.roughnessMap;

    this.metalnessMap = source.metalnessMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.envMapIntensity = source.envMapIntensity;

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
