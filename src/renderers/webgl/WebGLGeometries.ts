import { BufferGeometry } from '../../core/BufferGeometry';

export class WebGLGeometries {

  private geometries;
  private gl;
  private properties;
  private info;

  constructor(gl, properties, info) {
    this.geometries = {};
    this.gl = gl;
    this.properties = properties;
    this.info = info;
  }

  public get(object) {

    let geometry = object.geometry;

    if (this.geometries[geometry.id] !== undefined) {
      return this.geometries[geometry.id];
    }

    geometry.addEventListener('dispose', this.onGeometryDispose);

    let buffergeometry;

    if (geometry.isBufferGeometry) {
      buffergeometry = geometry;
    } else if (geometry.isGeometry) {
      if (geometry._bufferGeometry === undefined) {
        geometry._bufferGeometry = new BufferGeometry().setFromObject(object);
      }

      buffergeometry = geometry._bufferGeometry;
    }

    this.geometries[geometry.id] = buffergeometry;

    this.info.memory.geometries++;

    return buffergeometry;
  }

  private onGeometryDispose(event) {
    let geometry = event.target;
    let buffergeometry = this.geometries[geometry.id];

    if (buffergeometry.index !== null) {
      this.deleteAttribute(buffergeometry.index);
    }

    this.deleteAttributes(buffergeometry.attributes);

    geometry.removeEventListener('dispose', this.onGeometryDispose);

    delete this.geometries[geometry.id];

    // TODO
    let property = this.properties.get(geometry);

    if (property.wireframe) {
      this.deleteAttribute(property.wireframe);
    }

    this.properties.delete(geometry);

    let bufferproperty = this.properties.get(buffergeometry);

    if (bufferproperty.wireframe) {
      this.deleteAttribute(bufferproperty.wireframe);
    }
    this.properties.delete(buffergeometry);

    //
    this.info.memory.geometries--;
  }

  private getAttributeBuffer(attribute) {
    if (attribute.isInterleavedBufferAttribute) {
      return this.properties.get(attribute.data).__webglBuffer;
    }

    return this.properties.get(attribute).__webglBuffer;
  }

  private deleteAttribute(attribute) {
    let buffer = this.getAttributeBuffer(attribute);

    if (buffer !== undefined) {
      this.gl.deleteBuffer(buffer);
      this.removeAttributeBuffer(attribute);
    }
  }

  private deleteAttributes(attributes) {
    for (let name in attributes) {
      this.deleteAttribute(attributes[name]);
    }
  }

  private removeAttributeBuffer(attribute) {
    if (attribute.isInterleavedBufferAttribute) {
      this.properties.delete(attribute.data);
    } else {
      this.properties.delete(attribute);
    }
  }

}
