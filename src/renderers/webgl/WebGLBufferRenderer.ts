export class WebGLBufferRenderer {

  private mode;

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

  public render(start, count) {
    this.gl.drawArrays(this.mode, start, count);

    this.infoRender.calls++;
    this.infoRender.vertices += count;

    if (this.mode === this.gl.TRIANGLES) {
      this.infoRender.faces += count / 3;
    }
  }

  public renderInstances(geometry) {
    let extension = this.extensions.get('ANGLE_instanced_arrays');

    if (extension === null) {
      console.error('WebGLBufferRenderer: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
      return;
    }

    let position = geometry.attributes.position;

    let count = 0;

    if (position.isInterleavedBufferAttribute) {
      count = position.data.count;

      extension.drawArraysInstancedANGLE(this.mode, 0, count, geometry.maxInstancedCount);
    } else {
      count = position.count;

      extension.drawArraysInstancedANGLE(this.mode, 0, count, geometry.maxInstancedCount);
    }

    this.infoRender.calls++;
    this.infoRender.vertices += count * geometry.maxInstancedCount;

    if (this.mode === this.gl.TRIANGLES) {
      this.infoRender.faces += geometry.maxInstancedCount * count / 3;
    }
  }

}
