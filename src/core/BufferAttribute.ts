import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Vector4 } from '../math/Vector4';
import { Color } from '../math/Color';
import { MathTool } from '../math/MathTool';

interface UpdateRange {
  offset: number;
  count: number;
}

export class BufferAttribute {

  public array;
  public count: number;

  public dynamic: boolean;

  public isBufferAttribute: boolean = true;

  public itemSize: number;

  public normalized: boolean;
  public updateRange: UpdateRange;

  public onUploadCallback: Function;

  public uuid: string;

  public version: number;

  constructor(array, itemSize: number, normalized?: boolean) {
    this.uuid = MathTool.generateUUID();

    this.array = array;
    this.itemSize = itemSize;
    this.count = array !== undefined ? array.length / itemSize : 0;
    this.normalized = normalized;

    this.dynamic = false;
    this.updateRange = {
      offset: 0,
      count: -1
    };

    this.onUploadCallback = function () {};
    this.version = 0;
  }

  set needsUpdate(v: boolean) {
    if (v) {
      this.version++;
    }
  }

  public setArray(array): void {
    this.count = array !== undefined ? array.length / this.itemSize : 0;
    this.array = array;
  }

  public setDynamic(v: boolean): BufferAttribute {
    this.dynamic = v;
    return this;
  }

  public copy(s: BufferAttribute): BufferAttribute {
    this.array = new s.array.constructor(s.array);
    this.itemSize = s.itemSize;
    this.count = s.count;
    this.normalized = s.normalized;

    this.dynamic = s.dynamic;

    return this;
  }

  public copyAt(index1, attribute, index2) {
    index1 *= this.itemSize;
    index2 *= attribute.itemSize;
    for (let i = 0, l = this.itemSize; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }
    return this;
  }

  public copyArray(array) {
    this.array.set(array);
    return this;
  }

  public copyColorsArray(colors) {
    let array = this.array, offset = 0;

    for (let i = 0, l = colors.length; i < l; i++) {
      let color = colors[i];

      array[offset++] = color.r;
      array[offset++] = color.g;
      array[offset++] = color.b;
    }
    return this;
  }

  public copyIndicesArray(indices) {
    let array = this.array, offset = 0;

    for (let i = 0, l = indices.length; i < l; i++) {
      let index = indices[i];

      array[offset++] = index.a;
      array[offset++] = index.b;
      array[offset++] = index.c;
    }
    return this;
  }

  public copyVector2sArray(vectors) {
    let array = this.array, offset = 0;

    for (let i = 0, l = vectors.length; i < l; i++) {
      let vector = vectors[i];

      array[offset++] = vector.x;
      array[offset++] = vector.y;
    }
    return this;
  }

  public copyVector3sArray(vectors) {
    let array = this.array, offset = 0;

    for (let i = 0, l = vectors.length; i < l; i++) {
      let vector = vectors[i];

      array[offset++] = vector.x;
      array[offset++] = vector.y;
      array[offset++] = vector.z;
    }
    return this;
  }

  public copyVector4sArray(vectors) {
    let array = this.array, offset = 0;

    for (let i = 0, l = vectors.length; i < l; i++) {
      let vector = vectors[i];

      array[offset++] = vector.x;
      array[offset++] = vector.y;
      array[offset++] = vector.z;
      array[offset++] = vector.w;
    }
    return this;
  }

  public set(value, offset = 0) {
    this.array.set(value, offset);
    return this;
  }

  public getX(index) {
    return this.array[index * this.itemSize];
  }

  public setX(index, x) {
    this.array[index * this.itemSize] = x;
    return this;
  }

  public getY(index) {
    return this.array[index * this.itemSize + 1];
  }

  public setY(index, y) {
    this.array[index * this.itemSize + 1] = y;
    return this;
  }

  public getZ(index) {
    return this.array[index * this.itemSize + 2];
  }

  public setZ(index, z) {
    this.array[index * this.itemSize + 2] = z;
    return this;
  }

  public getW(index) {
    return this.array[index * this.itemSize + 3];
  }

  public setW(index, w) {
    this.array[index * this.itemSize + 3] = w;
    return this;
  }
}

export class Int8BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Int8Array(array), itemSize);
  }

}

export class Uint8BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Uint8Array(array), itemSize);
  }

}

export class Uint8ClampedBufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Uint8ClampedArray(array), itemSize);
  }

}

export class Int16BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Int16Array(array), itemSize);
  }

}

export class Uint16BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Uint16Array(array), itemSize);
  }

}

export class Int32BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Int32Array(array), itemSize);
  }

}

export class Uint32BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Uint32Array(array), itemSize);
  }

}

export class Float32BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Float32Array(array), itemSize);
  }

}

export class Float64BufferAttribute extends BufferAttribute {

  constructor(array, itemSize) {
    super(new Float64Array(array), itemSize);
  }

}
