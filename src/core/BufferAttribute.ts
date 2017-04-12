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
