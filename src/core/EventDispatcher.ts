export class EventDispatcher {

  private _listeners = {};

  constructor() {}

  public addEventListener(type: string, listener: Function): void {


    let listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }

  }

  public hasEventListener(type: string, listener: Function): boolean {

    let l = this._listeners;

    return l[type] !== undefined && l[type].indexOf(listener) !== -1;

  }

  public removeEventListener(type: string, listener: Function): void {
    let l = this._listeners;
    let la = l[type];

    if (la !== undefined) {
      let index = la.indexOf(listener);

      if (index !== -1) {
        la.splice(index, 1);
      }
    }
  }

  public dispatchEvent(event) {
    let l = this._listeners;
    let la = l[event.type];

    if (la !== undefined) {
      event.target = this;

      let array = [], i = 0;
      let len = la.length;

      for (i = 0; i < len; ++i) {
        array[i] = la[i];
      }

      for (i = 0; i < len; ++i) {
        array[i].call(this, event);
      }
    }
  }

}
