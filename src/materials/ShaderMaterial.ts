import { Material } from './Material';
import { UniformsUtils } from '../renderers/shaders/UniformsUtils';

export class ShaderMaterial extends Material {

  public defines;
  public uniforms;

  public vertexShader: string;
  public fragmentShader: string;

  public linewidth: number;

  public wireframe: boolean;
  public wireframeLinewidth: number;

  public clipping: boolean;

  public skinning: boolean;
  public morphTargets: boolean;
  public morphNormals: boolean;

  public extensions;
  public defaultAttributeValues;

  public index0AttributeName;

  public isShaderMaterial: boolean = true;

  constructor(parameters) {
    super();

    this.type = 'ShaderMaterial';

    this.defines = {};
    this.uniforms = {};

    this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
    this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';

    this.linewidth = 1;

    this.wireframe = false;
    this.wireframeLinewidth = 1;

    this.fog = false;
    this.lights = false;
    this.clipping = false;

    this.skinning = false;
    this.morphTargets = false; // set to use morph targets
    this.morphNormals = false; // set to use morph normals

    this.extensions = {
      derivatives: false, // set to use derivatives
      fragDepth: false, // set to use fragment depth values
      drawBuffers: false, // set to use draw buffers
      shaderTextureLOD: false // set to use shader texture LOD
    };

    this.defaultAttributeValues = {
      'color': [1, 1, 1],
      'uv': [0, 0],
      'uv2': [0, 0]
    };

    this.index0AttributeName = undefined;

    if (parameters !== undefined) {

      if (parameters.attributes !== undefined) {
        console.error('ShaderMaterial: attributes should now be defined in BufferGeometry instead.');
      }
      this.setValues(parameters);
    }
  }

  public copy(source) {
    super.copy(source);
    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;

    this.uniforms = UniformsUtils.clone(source.uniforms);

    this.defines = source.defines;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.lights = source.lights;
    this.clipping = source.clipping;

    this.skinning = source.skinning;

    this.morphTargets = source.morphTargets;
    this.morphNormals = source.morphNormals;

    this.extensions = source.extensions;

    return this;
  }
}
