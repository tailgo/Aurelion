'use strict';
export class Color {

  private _r: number;
  private _g: number;
  private _b: number;

  get r(): number {
    return this._r;
  }

  set r(newR: number) {
    this._r = newR;
  }

  get g(): number {
    return this._g;
  }

  set g(newG: number) {
    this._g = newG;
  }

  get b(): number {
    return this._b;
  }

  set b(newB: number) {
    this._b = newB;
  }

  constructor(r: number = 0, g: number = 0, b: number = 0) {
    this._r = r;
    this._g = g;
    this._b = b;
  }

  public add(c: Color): Color {
    this._r += c.r;
    this._g += c.g;
    this._b += c.b;

    return this;
  }

  public sub(c: Color): Color {
    this._r = Math.max(0, this._r - c.r);
    this._g = Math.max(0, this._g - c.g);
    this._b = Math.max(0, this._b - c.b);

    return this;
  }

  public mul(c: Color): Color {
    this._r *= c.r;
    this._g *= c.g;
    this._b *= c.b;

    return this;
  }

  public equals(c: Color): boolean {
    return (this._r === c.r) && (this._g === c.g) && (this._b === c.b);
  }

  public toArray(array: number[] = [], offset: number = 0): number[] {

    array[offset] = this.r;
    array[offset + 1] = this.g;
    array[offset + 2] = this.b;

    return array;
  }
}
