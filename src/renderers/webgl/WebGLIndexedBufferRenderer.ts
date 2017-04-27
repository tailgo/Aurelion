export class WebGLIndexedBufferRenderer {

  private mode;
  private type;
  private size;

  private gl;
  private extensions;
  private infoRender;

  constructor(gl, extensions, infoRender) {
    this.gl = gl;
    this.extensions = extensions;
    this.infoRender = infoRender;
  }

  public setMode(value) {
    this.mode = value;
  }

  public setIndex(index) {
    if (index.array instanceof Uint32Array && this.extensions.get('OES_element_index_uint')) {
      this.type = this.gl.UNSIGNED_INT;
      this.size = 4;
    } else if (index.array instanceof Uint16Array) {
      this.type = this.gl.UNSIGNED_SHORT;
      this.size = 2;
    } else {
      this.type = this.gl.UNSIGNED_BYTE;
      this.size = 1;
    }
  }

  public render(start, count) {
    this.gl.drawElements(this.mode, count, this.type, start * this.size);

    this.infoRender.calls++;
    this.infoRender.vertices += count;

    if (this.mode === this.gl.TRIANGLES) this.infoRender.faces += count / 3;
  }

  public renderInstances(geometry, start, count) {
    let extension = this.extensions.get('ANGLE_instanced_arrays');

    if (extension === null) {
      console.error('WebGLBufferRenderer: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
      return;
    }

    extension.drawElementsInstancedANGLE(this.mode, count, this.type, start * this.size, geometry.maxInstancedCount);

    this.infoRender.calls++;
    this.infoRender.vertices += count * geometry.maxInstancedCount;

    if (this.mode === this.gl.TRIANGLES) {
      this.infoRender.faces += geometry.maxInstancedCount * count / 3;
    }
  }

}
