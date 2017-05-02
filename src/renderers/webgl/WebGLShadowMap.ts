import { FrontSide, BackSide, DoubleSide } from '../../Constants';
import {
  RGBAFormat, NearestFilter, PCFShadowMap, RGBADepthPacking
} from '../../Constants';
import { WebGLRenderTarget } from '../WebGLRenderTarget';
import { UniformsUtils } from '../shaders/UniformsUtils';
import { ShaderLib } from '../shaders/ShaderLib';
import { ShaderMaterial } from '../../materials/ShaderMaterial';
import { MeshDepthMaterial } from '../../materials/MeshDepthMaterial';
import { Vector2 } from '../../math/Vector2';
import { Vector3 } from '../../math/Vector3';
import { Vector4 } from '../../math/Vector4';
import { Matrix4 } from '../../math/Matrix4';
import { Frustum } from '../../math/Frustum';

export class WebGLShadowMap {

  public enabled: boolean;

  public autoUpdate: boolean;
  public needsUpdate: boolean;

  public type;

  public renderReverseSided: boolean;
  public renderSingleSided: boolean;

  // private
  private _renderer;
  private _lights;
  private _objects;

  private _gl;
  private _state;
  private _frustum;
  private _projScreenMatrix: Matrix4;

  private _lightShadows;

  private _shadowMapSize: Vector2;
  private _maxShadowMapSize: Vector2;

  private _lookTarget: Vector3;
  private _lightPositionWorld: Vector3;

  private _renderList;

  private _MorphingFlag: number;
  private _SkinningFlag: number;

  private _NumberOfMaterialVariants: number;

  private _depthMaterials;
  private _distanceMaterials;

  private _materialCache;

  private cubeDirections: Array<Vector3>;
  private cubeUps: Array<Vector3>;
  private cube2DViewPorts: Array<Vector4>;

  constructor(_renderer, _lights, _objects, capabilities) {
    this._renderer = _renderer;
    this._lights = _lights;
    this._objects = _objects;

    this._gl = _renderer.context;
    this._state = _renderer.state;
    this._frustum = new Frustum();
    this._projScreenMatrix = new Matrix4();

    this._lightShadows = _lights.shadows;

    this._shadowMapSize = new Vector2();
    this._maxShadowMapSize = new Vector2(capabilities.maxTextureSize, capabilities.maxTextureSize);

    this._lookTarget = new Vector3();
    this._lightPositionWorld = new Vector3();

    this._renderList = [];

    this._MorphingFlag = 1;
    this._SkinningFlag = 2;

    this._NumberOfMaterialVariants = (this._MorphingFlag | this._SkinningFlag) + 1;

    this._depthMaterials = new Array(this._NumberOfMaterialVariants);
    this._distanceMaterials = new Array(this._NumberOfMaterialVariants);

    this._materialCache = {};

    this.cubeDirections = [
      new Vector3(1, 0, 0), new Vector3(- 1, 0, 0), new Vector3(0, 0, 1),
      new Vector3(0, 0, - 1), new Vector3(0, 1, 0), new Vector3(0, - 1, 0)
    ];

    this.cubeUps = [
      new Vector3(0, 1, 0), new Vector3(0, 1, 0), new Vector3(0, 1, 0),
      new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, - 1)
    ];

    this.cube2DViewPorts = [
      new Vector4(), new Vector4(), new Vector4(),
      new Vector4(), new Vector4(), new Vector4()
    ];

    let depthMaterialTemplate = new MeshDepthMaterial();
    depthMaterialTemplate.depthPacking = RGBADepthPacking;
    depthMaterialTemplate.clipping = true;

    let distanceShader = ShaderLib['distanceRGBA'];
    let distanceUniforms = UniformsUtils.clone(distanceShader.uniforms);

    for (let i = 0; i !== this._NumberOfMaterialVariants; ++i) {

      let useMorphing = (i & this._MorphingFlag) !== 0;
      let useSkinning = (i & this._SkinningFlag) !== 0;

      let depthMaterial = depthMaterialTemplate.clone();
      depthMaterial.morphTargets = useMorphing;
      depthMaterial.skinning = useSkinning;

      this._depthMaterials[i] = depthMaterial;

      let distanceMaterial = new ShaderMaterial({
        defines: {
          'USE_SHADOWMAP': ''
        },
        uniforms: distanceUniforms,
        vertexShader: distanceShader.vertexShader,
        fragmentShader: distanceShader.fragmentShader,
        morphTargets: useMorphing,
        skinning: useSkinning,
        clipping: true
      });

      this._distanceMaterials[i] = distanceMaterial;
    }

    this.enabled = false;

    this.autoUpdate = true;
    this.needsUpdate = false;

    this.type = PCFShadowMap;

    this.renderReverseSided = true;
    this.renderSingleSided = true;
  }

  public render(scene, camera) {
    if (this.enabled === false) return;
    if (this.autoUpdate === false && this.needsUpdate === false) return;

    if (this._lightShadows.length === 0) return;

    // Set GL state for depth map.
    this._state.buffers.color.setClear(1, 1, 1, 1);
    this._state.disable(this._gl.BLEND);
    this._state.setDepthTest(true);
    this._state.setScissorTest(false);

    // render depth map
    let faceCount, isPointLight;

    for (let i = 0, il = this._lightShadows.length; i < il; i++) {
      let light = this._lightShadows[i];
      let shadow = light.shadow;

      if (shadow === undefined) {
        console.warn('WebGLShadowMap:', light, 'has no shadow.');
        continue;
      }

      let shadowCamera = shadow.camera;

      this._shadowMapSize.copy(shadow.mapSize);
      this._shadowMapSize.min(this._maxShadowMapSize);

      if (light && light.isPointLight) {
        faceCount = 6;
        isPointLight = true;

        let vpWidth = this._shadowMapSize.x;
        let vpHeight = this._shadowMapSize.y;

        // These viewports map a cube-map onto a 2D texture with the
        // following orientation:
        //
        //  xzXZ
        //   y Y
        //
        // X - Positive x direction
        // x - Negative x direction
        // Y - Positive y direction
        // y - Negative y direction
        // Z - Positive z direction
        // z - Negative z direction

        // positive X
        this.cube2DViewPorts[0].set(vpWidth * 2, vpHeight, vpWidth, vpHeight);
        // negative X
        this.cube2DViewPorts[1].set(0, vpHeight, vpWidth, vpHeight);
        // positive Z
        this.cube2DViewPorts[2].set(vpWidth * 3, vpHeight, vpWidth, vpHeight);
        // negative Z
        this.cube2DViewPorts[3].set(vpWidth, vpHeight, vpWidth, vpHeight);
        // positive Y
        this.cube2DViewPorts[4].set(vpWidth * 3, 0, vpWidth, vpHeight);
        // negative Y
        this.cube2DViewPorts[5].set(vpWidth, 0, vpWidth, vpHeight);

        this._shadowMapSize.x *= 4.0;
        this._shadowMapSize.y *= 2.0;
      } else {
        faceCount = 1;
        isPointLight = false;
      }

      if (shadow.map === null) {
        let pars = { minFilter: NearestFilter, magFilter: NearestFilter, format: RGBAFormat };

        shadow.map = new WebGLRenderTarget(this._shadowMapSize.x, this._shadowMapSize.y, pars);

        shadowCamera.updateProjectionMatrix();
      }

      if (shadow.isSpotLightShadow) {
        shadow.update(light);
      }

      // TODO (abelnation / sam-g-steel): is this needed?
      if (shadow && shadow.isRectAreaLightShadow) {
        shadow.update(light);
      }

      let shadowMap = shadow.map;
      let shadowMatrix = shadow.matrix;

      this._lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
      shadowCamera.position.copy(this._lightPositionWorld);

      this._renderer.setRenderTarget(shadowMap);
      this._renderer.clear();

      // render shadow map for each cube face (if omni-directional) or
      // run a single pass if not
      for (let face = 0; face < faceCount; face++) {
        if (isPointLight) {
          this._lookTarget.copy(shadowCamera.position);
          this._lookTarget.add(this.cubeDirections[face]);
          shadowCamera.up.copy(this.cubeUps[face]);
          shadowCamera.lookAt(this._lookTarget);

          let vpDimensions = this.cube2DViewPorts[face];
          this._state.viewport(vpDimensions);
        } else {
          this._lookTarget.setFromMatrixPosition(light.target.matrixWorld);
          shadowCamera.lookAt(this._lookTarget);
        }

        shadowCamera.updateMatrixWorld();
        shadowCamera.matrixWorldInverse.getInverse(shadowCamera.matrixWorld);

        // compute shadow matrix
        shadowMatrix.set(
          0.5, 0.0, 0.0, 0.5,
          0.0, 0.5, 0.0, 0.5,
          0.0, 0.0, 0.5, 0.5,
          0.0, 0.0, 0.0, 1.0
        );

        shadowMatrix.multiply(shadowCamera.projectionMatrix);
        shadowMatrix.multiply(shadowCamera.matrixWorldInverse);

        // update camera matrices and frustum
        this._projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
        this._frustum.setFromMatrix(this._projScreenMatrix);

        // set object matrices & frustum culling
        this._renderList.length = 0;

        this.projectObject(scene, camera, shadowCamera);

        // render shadow map
        // render regular objects
        for (let j = 0, jl = this._renderList.length; j < jl; j++) {
          let object = this._renderList[j];
          let geometry = this._objects.update(object);
          let material = object.material;

          if (material && material.isMultiMaterial) {

            let groups = geometry.groups;
            let materials = material.materials;

            for (let k = 0, kl = groups.length; k < kl; k++) {
              let group = groups[k];
              let groupMaterial = materials[group.materialIndex];

              if (groupMaterial.visible === true) {
                let depthMaterial = this.getDepthMaterial(object, groupMaterial, isPointLight, this._lightPositionWorld);
                this._renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, group);
              }
            }
          } else {
            let depthMaterial = this.getDepthMaterial(object, material, isPointLight, this._lightPositionWorld);
            this._renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, null);
          }
        }
      }
    }

    // Restore GL state.
    let clearColor = this._renderer.getClearColor(),
      clearAlpha = this._renderer.getClearAlpha();
    this._renderer.setClearColor(clearColor, clearAlpha);

    this.needsUpdate = false;
  }

  private getDepthMaterial(object, material, isPointLight, lightPositionWorld) {
    let geometry = object.geometry;

    let result = null;

    let materialVariants = this._depthMaterials;
    let customMaterial = object.customDepthMaterial;

    if (isPointLight) {
      materialVariants = this._distanceMaterials;
      customMaterial = object.customDistanceMaterial;
    }

    if (!customMaterial) {
      let useMorphing = false;

      if (material.morphTargets) {
        if (geometry && geometry.isBufferGeometry) {
          useMorphing = geometry.morphAttributes && geometry.morphAttributes.position && geometry.morphAttributes.position.length > 0;
        } else if (geometry && geometry.isGeometry) {
          useMorphing = geometry.morphTargets && geometry.morphTargets.length > 0;
        }
      }

      let useSkinning = object.isSkinnedMesh && material.skinning;

      let variantIndex = 0;

      if (useMorphing) variantIndex |= this._MorphingFlag;
      if (useSkinning) variantIndex |= this._SkinningFlag;

      result = materialVariants[variantIndex];
    } else {
      result = customMaterial;
    }

    if (this._renderer.localClippingEnabled &&
      material.clipShadows === true &&
      material.clippingPlanes.length !== 0) {

      // in this case we need a unique material instance reflecting the
      // appropriate state
      let keyA = result.uuid, keyB = material.uuid;

      let materialsForVariant = this._materialCache[keyA];

      if (materialsForVariant === undefined) {
        materialsForVariant = {};
        this._materialCache[keyA] = materialsForVariant;
      }

      let cachedMaterial = materialsForVariant[keyB];
      if (cachedMaterial === undefined) {
        cachedMaterial = result.clone();
        materialsForVariant[keyB] = cachedMaterial;
      }

      result = cachedMaterial;
    }

    result.visible = material.visible;
    result.wireframe = material.wireframe;

    let side = material.side;

    if (this.renderSingleSided && side === DoubleSide) {
      side = FrontSide;
    }

    if (this.renderReverseSided) {
      if (side === FrontSide) side = BackSide;
      else if (side === BackSide) side = FrontSide;
    }

    result.side = side;

    result.clipShadows = material.clipShadows;
    result.clippingPlanes = material.clippingPlanes;

    result.wireframeLinewidth = material.wireframeLinewidth;
    result.linewidth = material.linewidth;

    if (isPointLight && result.uniforms.lightPos !== undefined) {
      result.uniforms.lightPos.value.copy(lightPositionWorld);
    }

    return result;
  }

  private projectObject(object, camera, shadowCamera) {
    if (object.visible === false) return;

    let visible = (object.layers.mask & camera.layers.mask) !== 0;

    if (visible && (object.isMesh || object.isLine || object.isPoints)) {
      if (object.castShadow && (object.frustumCulled === false || this._frustum.intersectsObject(object) === true)) {

        let material = object.material;

        if (material.visible === true) {
          object.modelViewMatrix.multiplyMatrices(shadowCamera.matrixWorldInverse, object.matrixWorld);
          this._renderList.push(object);
        }
      }

    }

    let children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {
      this.projectObject(children[i], camera, shadowCamera);
    }

  }
}
