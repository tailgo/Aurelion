import { Vector3 } from '../math/Vector3';
import { Box3 } from '../math/Box3';
import { EventDispatcher } from './EventDispatcher';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute';
import { Sphere } from '../math/Sphere';
import { DirectGeometry } from './DirectGeometry';
import { Object3D } from './Object3D';
import { Matrix4 } from '../math/Matrix4';
import { Matrix3 } from '../math/Matrix3';
import { MathTool } from '../math/MathTool';
import { arrayMax } from '../utils';
import { GeometryIdCount } from './Geometry';

interface DrawRange {
  start: number;
  count: number;
}

interface GroupObject {
  start: number;
  count: number;
  materialIndex: number;
}

export class BufferGeometry extends EventDispatcher {

  public readonly id: number;
  public uuid: string;
  public name: string;
  public type: string;

  public isBufferGeometry: boolean = true;

  public index;
  public attributes;

  public morphAttributes;
  public groups: Array<GroupObject>;

  public boundingBox: Box3;
  public boundingSphere;

  public drawRange: DrawRange;

  public static MaxIndex: number = 65535;

  constructor() {
    super();

    this.id = GeometryIdCount();
    this.uuid = MathTool.generateUUID();
    this.name = '';
    this.type = 'BufferGeometry';

    this.index = null;
    this.attributes = {};

    this.morphAttributes = {};
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;

    this.drawRange = {
      start: 0,
      count: Infinity
    };
  }

  public addAttribute(name: string, attr: BufferAttribute): BufferGeometry {
    this.attributes[name] = attr;
    return this;
  }

  public addGroup(start: number, count: number, materialIndex?: number): void {
    this.groups.push({
      start: start,
      count: count,
      materialIndex: materialIndex !== undefined ? materialIndex : 0
    });
  }

  public applyMatrix(matrix: Matrix4) {
    let position = this.attributes.position;

    if (position !== undefined) {

      matrix.applyToBufferAttribute(position);
      position.needsUpdate = true;

    }

    let normal = this.attributes.normal;

    if (normal !== undefined) {

      let normalMatrix = new Matrix3().getNormalMatrix(matrix);

      normalMatrix.applyToBufferAttribute(normal);
      normal.needsUpdate = true;

    }

    if (this.boundingBox !== null) {

      this.computeBoundingBox();

    }

    if (this.boundingSphere !== null) {

      this.computeBoundingSphere();

    }

    return this;
  }

  public center(): Vector3 {
    this.computeBoundingBox();
    let offset = this.boundingBox.getCenter().negate();
    this.translate(offset.x, offset.y, offset.z);
    return offset;
  }

  public clone() {
    return new BufferGeometry().copy(this);
  }

  public copy(source: BufferGeometry) {
    let name, i, l;

    // reset
    this.index = null;
    this.attributes = {};
    this.morphAttributes = {};
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;

    // name
    this.name = source.name;

    // index
    let index = source.index;
    if (index !== null) {
      this.setIndex(index.clone());
    }

    // attributes
    let attributes = source.attributes;
    for (name in attributes) {
      let attribute = attributes[name];
      this.addAttribute(name, attribute.clone());
    }

    // morph attributes
    let morphAttributes = source.morphAttributes;
    for (name in morphAttributes) {
      let array = [];
      // morphAttribute: array of Float32BufferAttributes
      let morphAttribute = morphAttributes[name];
      for (i = 0, l = morphAttribute.length; i < l; i++) {
        array.push(morphAttribute[i].clone());
      }
      this.morphAttributes[name] = array;
    }

    // groups
    let groups = source.groups;
    for (i = 0, l = groups.length; i < l; i++) {
      let group = groups[i];
      this.addGroup(group.start, group.count, group.materialIndex);
    }

    // bounding box
    let boundingBox = source.boundingBox;
    if (boundingBox !== null) {
      this.boundingBox = boundingBox.clone();
    }

    // bounding sphere
    let boundingSphere = source.boundingSphere;
    if (boundingSphere !== null) {
      this.boundingSphere = boundingSphere.clone();
    }

    // draw range
    this.drawRange.start = source.drawRange.start;
    this.drawRange.count = source.drawRange.count;
    return this;
  }

  public clearGroups(): void {
    this.groups = [];
  }

  public computeBoundingBox(): void {
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }

    let position = this.attributes.position;

    if (position !== undefined) {
      this.boundingBox.setFromBufferAttribute(position);
    } else {
      this.boundingBox.makeEmpty();
    }

    if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
      console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
  }

  public computeBoundingSphere(): void {
    let box = new Box3();
    let vector = new Vector3();

    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }

    let position = this.attributes.position;

    if (position) {
      let center = this.boundingSphere.center;

      box.setFromBufferAttribute(position);
      box.getCenter(center);

      // hoping to find a boundingSphere with a radius smaller than the
      // boundingSphere of the boundingBox: sqrt(3) smaller in the best case

      let maxRadiusSq = 0;

      for (let i = 0, il = position.count; i < il; i++) {
        vector.x = position.getX(i);
        vector.y = position.getY(i);
        vector.z = position.getZ(i);
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

      if (isNaN(this.boundingSphere.radius)) {
        console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
      }
    }

  }

  public computeVertexNormals(): void {
    let index = this.index;
    let attributes = this.attributes;
    let groups = this.groups;

    if (attributes.position) {
      let positions = attributes.position.array;

      if (attributes.normal === undefined) {
        this.addAttribute(
          'normal',
          new BufferAttribute(new Float32Array(positions.length), 3)
        );
      } else {
        // reset existing normals to zero
        let array = attributes.normal.array;

        for (let i = 0, il = array.length; i < il; i++) {
          array[i] = 0;
        }
      }

      let normals = attributes.normal.array;

      let vA, vB, vC;
      let pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
      let cb = new Vector3(), ab = new Vector3();

      // indexed elements
      if (index) {
        let indices = index.array;
        if (groups.length === 0) {
          this.addGroup(0, indices.length);
        }
        for (let j = 0, jl = groups.length; j < jl; ++j) {
          let group = groups[j];

          let start = group.start;
          let count = group.count;

          for (let i = start, il = start + count; i < il; i += 3) {
            vA = indices[i + 0] * 3;
            vB = indices[i + 1] * 3;
            vC = indices[i + 2] * 3;

            pA.fromArray(positions, vA);
            pB.fromArray(positions, vB);
            pC.fromArray(positions, vC);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            normals[vA] += cb.x;
            normals[vA + 1] += cb.y;
            normals[vA + 2] += cb.z;

            normals[vB] += cb.x;
            normals[vB + 1] += cb.y;
            normals[vB + 2] += cb.z;

            normals[vC] += cb.x;
            normals[vC + 1] += cb.y;
            normals[vC + 2] += cb.z;
          }
        }
      } else {
        // non-indexed elements (unconnected triangle soup)
        for (let i = 0, il = positions.length; i < il; i += 9) {
          pA.fromArray(positions, i);
          pB.fromArray(positions, i + 3);
          pC.fromArray(positions, i + 6);

          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);

          normals[i] = cb.x;
          normals[i + 1] = cb.y;
          normals[i + 2] = cb.z;

          normals[i + 3] = cb.x;
          normals[i + 4] = cb.y;
          normals[i + 5] = cb.z;

          normals[i + 6] = cb.x;
          normals[i + 7] = cb.y;
          normals[i + 8] = cb.z;
        }
      }
      this.normalizeNormals();
      attributes.normal.needsUpdate = true;
    }
  }

  public dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

  public fromDirectGeometry(geometry) {
    let positions = new Float32Array(geometry.vertices.length * 3);
    this.addAttribute(
      'position',
      new BufferAttribute(positions, 3).copyVector3sArray(geometry.vertices)
    );

    if (geometry.normals.length > 0) {
      let normals = new Float32Array(geometry.normals.length * 3);
      this.addAttribute(
        'normal',
        new BufferAttribute(normals, 3).copyVector3sArray(geometry.normals)
      );
    }

    if (geometry.colors.length > 0) {
      let colors = new Float32Array(geometry.colors.length * 3);
      this.addAttribute(
        'color',
        new BufferAttribute(colors, 3).copyColorsArray(geometry.colors)
      );
    }

    if (geometry.uvs.length > 0) {
      let uvs = new Float32Array(geometry.uvs.length * 2);
      this.addAttribute(
        'uv',
        new BufferAttribute(uvs, 2).copyVector2sArray(geometry.uvs)
      );
    }

    if (geometry.uvs2.length > 0) {
      let uvs2 = new Float32Array(geometry.uvs2.length * 2);
      this.addAttribute(
        'uv2',
        new BufferAttribute(uvs2, 2).copyVector2sArray(geometry.uvs2)
      );
    }

    if (geometry.indices.length > 0) {
      let TypeArray = arrayMax(geometry.indices) > 65535 ? Uint32Array : Uint16Array;
      let indices = new TypeArray(geometry.indices.length * 3);
      this.setIndex(new BufferAttribute(indices, 1).copyIndicesArray(geometry.indices));
    }

    // groups
    this.groups = geometry.groups;

    // morphs
    for (let name in geometry.morphTargets) {
      let array = [];
      let morphTargets = geometry.morphTargets[name];

      for (let i = 0, l = morphTargets.length; i < l; i++) {
        let morphTarget = morphTargets[i];

        let attribute = new Float32BufferAttribute(morphTarget.length * 3, 3);

        array.push(attribute.copyVector3sArray(morphTarget));
      }

      this.morphAttributes[name] = array;
    }

    // skinning
    if (geometry.skinIndices.length > 0) {
      let skinIndices = new Float32BufferAttribute(geometry.skinIndices.length * 4, 4);
      this.addAttribute(
        'skinIndex',
        skinIndices.copyVector4sArray(geometry.skinIndices)
      );
    }

    if (geometry.skinWeights.length > 0) {
      let skinWeights = new Float32BufferAttribute(geometry.skinWeights.length * 4, 4);
      this.addAttribute(
        'skinWeight',
        skinWeights.copyVector4sArray(geometry.skinWeights)
      );
    }

    //
    if (geometry.boundingSphere !== null) {
      this.boundingSphere = geometry.boundingSphere.clone();
    }

    if (geometry.boundingBox !== null) {
      this.boundingBox = geometry.boundingBox.clone();
    }

    return this;
  }

  public fromGeometry(geometry) {
    geometry.__directGeometry = new DirectGeometry().fromGeometry(geometry);

    return this.fromDirectGeometry(geometry.__directGeometry);
  }

  public getAttribute(name: string) {
    return this.attributes[name];
  }

  public getIndex() {
    return this.index;
  }

  public lookAt(vector: Vector3) {
    let obj = new Object3D();
    obj.lookAt(vector);
    obj.updateMatrix();
    this.applyMatrix(obj.matrix);
  }

  public merge(geometry, offset) {
    if ((geometry && geometry.isBufferGeometry) === false) {
      console.error('THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.', geometry);
      return;
    }

    if (offset === undefined) offset = 0;

    let attributes = this.attributes;

    for (let key in attributes) {
      if (geometry.attributes[key] === undefined) continue;

      let attribute1 = attributes[key];
      let attributeArray1 = attribute1.array;

      let attribute2 = geometry.attributes[key];
      let attributeArray2 = attribute2.array;

      let attributeSize = attribute2.itemSize;

      for (let i = 0, j = attributeSize * offset; i < attributeArray2.length; i++ , j++) {
        attributeArray1[j] = attributeArray2[i];
      }
    }

    return this;
  }

  public normalizeNormals() {
    let normals = this.attributes.normal.array;

    let x, y, z, n;

    for (let i = 0, il = normals.length; i < il; i += 3) {
      x = normals[i];
      y = normals[i + 1];
      z = normals[i + 2];

      n = 1.0 / Math.sqrt(x * x + y * y + z * z);

      normals[i] *= n;
      normals[i + 1] *= n;
      normals[i + 2] *= n;
    }
  }

  public removeAttribute(name: string): BufferGeometry {
    delete this.attributes[name];
    return this;
  }

  public rotateX(angle: number) {
    let m1 = new Matrix4();
    m1.makeRotationX(angle);
    this.applyMatrix(m1);
    return this;
  }

  public rotateY(angle: number) {
    let m1 = new Matrix4();
    m1.makeRotationY(angle);
    this.applyMatrix(m1);
    return this;
  }

  public rotateZ(angle: number) {
    let m1 = new Matrix4();
    m1.makeRotationZ(angle);
    this.applyMatrix(m1);
    return this;
  }

  public scale(x: number, y: number, z: number) {
    let m1 = new Matrix4();
    m1.makeScale(x, y, z);
    this.applyMatrix(m1);
    return this;
  }

  public setIndex(index): void {
    if (Array.isArray(index)) {
      if (arrayMax(index) > 65535) {
        this.index = new Uint32BufferAttribute(index, 1);
      } else {
        this.index = new Uint16BufferAttribute(index, 1);
      }
    } else {
      this.index = index;
    }
  }

  public setDrawRange(start: number, count: number): void {
    this.drawRange.start = start;
    this.drawRange.count = count;
  }

  public setFromObject(object) {
    let g = object.geometry;

    if (object.isPoints || object.isLine) {

      let positions = new Float32BufferAttribute(g.vertices.length * 3, 3);
      let colors = new Float32BufferAttribute(g.colors.length * 3, 3);

      this.addAttribute('position', positions.copyVector3sArray(g.vertices));
      this.addAttribute('color', colors.copyColorsArray(g.colors));

      if (g.lineDistances && g.lineDistances.length === g.vertices.length) {
        let lineDistances = new Float32BufferAttribute(g.lineDistances.length, 1);
        this.addAttribute('lineDistance', lineDistances.copyArray(g.lineDistances));
      }

      if (g.boundingSphere !== null) {
        this.boundingSphere = g.boundingSphere.clone();
      }

      if (g.boundingBox !== null) {
        this.boundingBox = g.boundingBox.clone();
      }

    } else if (object.isMesh) {

      if (g && g.isGeometry) {
        this.fromGeometry(g);
      }

    }

    return this;
  }

  public translate(x: number, y: number, z: number) {
    let m1 = new Matrix4();
    m1.makeTranslation(x, y, z);
    this.applyMatrix(m1);
    return this;
  }

  public updateFromObject(object) {
    let geometry = object.geometry;

    if (object.isMesh) {
      let direct = geometry.__directGeometry;

      if (geometry.elementsNeedUpdate === true) {
        direct = undefined;
        geometry.elementsNeedUpdate = false;
      }

      if (direct === undefined) {
        return this.fromGeometry(geometry);
      }

      direct.verticesNeedUpdate = geometry.verticesNeedUpdate;
      direct.normalsNeedUpdate = geometry.normalsNeedUpdate;
      direct.colorsNeedUpdate = geometry.colorsNeedUpdate;
      direct.uvsNeedUpdate = geometry.uvsNeedUpdate;
      direct.groupsNeedUpdate = geometry.groupsNeedUpdate;

      geometry.verticesNeedUpdate = false;
      geometry.normalsNeedUpdate = false;
      geometry.colorsNeedUpdate = false;
      geometry.uvsNeedUpdate = false;
      geometry.groupsNeedUpdate = false;

      geometry = direct;
    }

    let attribute;

    if (geometry.verticesNeedUpdate === true) {
      attribute = this.attributes.position;

      if (attribute !== undefined) {
        attribute.copyVector3sArray(geometry.vertices);
        attribute.needsUpdate = true;
      }

      geometry.verticesNeedUpdate = false;
    }

    if (geometry.normalsNeedUpdate === true) {
      attribute = this.attributes.normal;

      if (attribute !== undefined) {
        attribute.copyVector3sArray(geometry.normals);
        attribute.needsUpdate = true;
      }

      geometry.normalsNeedUpdate = false;
    }

    if (geometry.colorsNeedUpdate === true) {
      attribute = this.attributes.color;

      if (attribute !== undefined) {
        attribute.copyColorsArray(geometry.colors);
        attribute.needsUpdate = true;
      }

      geometry.colorsNeedUpdate = false;
    }

    if (geometry.uvsNeedUpdate) {
      attribute = this.attributes.uv;

      if (attribute !== undefined) {
        attribute.copyVector2sArray(geometry.uvs);
        attribute.needsUpdate = true;
      }

      geometry.uvsNeedUpdate = false;
    }

    if (geometry.lineDistancesNeedUpdate) {
      attribute = this.attributes.lineDistance;

      if (attribute !== undefined) {
        attribute.copyArray(geometry.lineDistances);
        attribute.needsUpdate = true;
      }

      geometry.lineDistancesNeedUpdate = false;
    }

    if (geometry.groupsNeedUpdate) {
      geometry.computeGroups(object.geometry);
      this.groups = geometry.groups;

      geometry.groupsNeedUpdate = false;
    }

    return this;
  }
}
