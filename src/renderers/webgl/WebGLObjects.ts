import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute';
import { arrayMax } from '../../utils';
import { WebGLGeometries } from './WebGLGeometries';

export class WebGLObjects {

  private geometries: WebGLGeometries;
  private gl;
  private properties;
  private info;

  constructor(gl, properties, info) {
    this.geometries = new WebGLGeometries(gl, properties, info);
    this.gl = gl;
    this.properties = properties;
    this.info = info;
  }

  public getAttributeBuffer(attribute) {
    if (attribute.isInterleavedBufferAttribute) {
      return this.properties.get(attribute.data).__webglBuffer;
    }

    return this.properties.get(attribute).__webglBuffer;
  }

  public getAttributeProperties(attribute) {
    if (attribute.isInterleavedBufferAttribute) {
      return this.properties.get(attribute.data);
    }

    return this.properties.get(attribute);
  }

  public getWireframeAttribute(geometry) {
    let property = this.properties.get(geometry);

    if (property.wireframe !== undefined) {
      return property.wireframe;
    }

    let indices = [];

    let index = geometry.index;
    let attributes = geometry.attributes;

    if (index !== null) {
      let array = index.array;
      for (let i = 0, l = array.length; i < l; i += 3) {
        let a = array[i + 0];
        let b = array[i + 1];
        let c = array[i + 2];

        indices.push(a, b, b, c, c, a);
      }
    } else {
      let array = attributes.position.array;
      for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {
        let a = i + 0;
        let b = i + 1;
        let c = i + 2;

        indices.push(a, b, b, c, c, a);
      }
    }

    let attribute = new (arrayMax(indices) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);

    this.updateAttribute(attribute, this.gl.ELEMENT_ARRAY_BUFFER);

    property.wireframe = attribute;

    return attribute;
  }

  public update(object) {
    let geometry = this.geometries.get(object);

    if (object.geometry.isGeometry) {
      geometry.updateFromObject(object);
    }

    let index = geometry.index;
    let attributes = geometry.attributes;

    if (index !== null) {
      this.updateAttribute(index, this.gl.ELEMENT_ARRAY_BUFFER);
    }

    for (let name in attributes) {
      this.updateAttribute(attributes[name], this.gl.ARRAY_BUFFER);
    }

    // morph targets
    let morphAttributes = geometry.morphAttributes;
    for (let name in morphAttributes) {
      let array = morphAttributes[name];
      for (let i = 0, l = array.length; i < l; i++) {
        this.updateAttribute(array[i], this.gl.ARRAY_BUFFER);
      }
    }
    return geometry;
  }

  private updateAttribute(attribute, bufferType) {
    let data = (attribute.isInterleavedBufferAttribute) ? attribute.data : attribute;

    let attributeProperties = this.properties.get(data);

    if (attributeProperties.__webglBuffer === undefined) {
      this.createBuffer(attributeProperties, data, bufferType);
    } else if (attributeProperties.version !== data.version) {
      this.updateBuffer(attributeProperties, data, bufferType);
    }
  }

  private createBuffer(attributeProperties, data, bufferType) {
    attributeProperties.__webglBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);

    let usage = data.dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;

    this.gl.bufferData(bufferType, data.array, usage);

    let type = this.gl.FLOAT;
    let array = data.array;

    if (array instanceof Float32Array) {
      type = this.gl.FLOAT;
    } else if (array instanceof Float64Array) {
      console.warn('Unsupported data buffer format: Float64Array');
    } else if (array instanceof Uint16Array) {
      type = this.gl.UNSIGNED_SHORT;
    } else if (array instanceof Int16Array) {
      type = this.gl.SHORT;
    } else if (array instanceof Uint32Array) {
      type = this.gl.UNSIGNED_INT;
    } else if (array instanceof Int32Array) {
      type = this.gl.INT;
    } else if (array instanceof Int8Array) {
      type = this.gl.BYTE;
    } else if (array instanceof Uint8Array) {
      type = this.gl.UNSIGNED_BYTE;
    }

    attributeProperties.bytesPerElement = array.BYTES_PER_ELEMENT;
    attributeProperties.type = type;
    attributeProperties.version = data.version;

    data.onUploadCallback();
  }

  private updateBuffer(attributeProperties, data, bufferType) {
    this.gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);

    if (data.dynamic === false) {
      this.gl.bufferData(bufferType, data.array, this.gl.STATIC_DRAW);
    } else if (data.updateRange.count === - 1) {
      // Not using update ranges
      this.gl.bufferSubData(bufferType, 0, data.array);
    } else if (data.updateRange.count === 0) {
      console.error('THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.');
    } else {
      this.gl.bufferSubData(bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
        data.array.subarray(data.updateRange.offset, data.updateRange.offset + data.updateRange.count));

      data.updateRange.count = 0; // reset range
    }

    attributeProperties.version = data.version;
  }

}
