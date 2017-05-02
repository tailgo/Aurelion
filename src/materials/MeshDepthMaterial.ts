import { Material } from './Material';
import { BasicDepthPacking } from '../Constants';

export class MeshDepthMaterial extends Material {

  public alphaMap;

  public depthPacking;

  public displacementMap;
  public displacementScale;
  public displacementBias;

  public fog: boolean;

  public isMeshDepthMaterial: boolean = true;

  public lights: boolean;

  public map;

  public morphTargets: boolean;

  public skinning: boolean;

  public wireframe: boolean;
  public wireframeLinewidth: number;

  public clipping;

  constructor(parameters?) {
    super();

    this.type = 'MeshDepthMaterial';

    this.depthPacking = BasicDepthPacking;

    this.skinning = false;
    this.morphTargets = false;

    this.map = null;

    this.alphaMap = null;

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.wireframe = false;
    this.wireframeLinewidth = 1;

    this.fog = false;
    this.lights = false;

    this.setValues(parameters);
  }

  public copy(source) {
    super.copy(this);

    this.depthPacking = source.depthPacking;

    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    return this;
  }

  public clone() {
    return new MeshDepthMaterial().copy(this);
  }

}
