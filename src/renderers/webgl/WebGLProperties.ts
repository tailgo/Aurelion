export class WebGLProperties {
  private properties;

  constructor() {
    this.properties = {};
  }

  public get(object) {
    let uuid = object.uuid;
    let map = this.properties[uuid];

    if (map === undefined) {
      map = {};
      this.properties[uuid] = map;
    }
    return map;
  }

  public delete(object) {
    delete this.properties[object.uuid];
  }

  public clear() {
    this.properties = {};
  }
}
