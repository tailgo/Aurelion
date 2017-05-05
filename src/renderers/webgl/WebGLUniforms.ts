import { CubeTexture } from '../../textures/CubeTexture';
import { Texture } from '../../textures/Texture';

let emptyTexture = new Texture();
let emptyCubeTexture = new CubeTexture();

/**
 * --- Utilities ---
 */
// Array Caches (provide typed arrays for temporary by size)
let arrayCacheF32 = [];
let arrayCacheI32 = [];

// Flattening for arrays of vectors and matrices
function flatten(array, nBlocks, blockSize) {
  let firstElem = array[0];

  if (firstElem <= 0 || firstElem > 0) return array;
  // unoptimized: ! isNaN( firstElem )
  // see http://jacksondunstan.com/articles/983

  let n = nBlocks * blockSize,
    r = arrayCacheF32[n];

  if (r === undefined) {
    r = new Float32Array(n);
    arrayCacheF32[n] = r;
  }

  if (nBlocks !== 0) {
    firstElem.toArray(r, 0);
    for (let i = 1, offset = 0; i !== nBlocks; ++i) {
      offset += blockSize;
      array[i].toArray(r, offset);
    }
  }
  return r;
}

// Texture unit allocation
function allocTexUnits(renderer, n) {
  let r = arrayCacheI32[n];

  if (r === undefined) {
    r = new Int32Array(n);
    arrayCacheI32[n] = r;
  }

  for (let i = 0; i !== n; ++i) {
    r[i] = renderer.allocTextureUnit();
  }

  return r;
}

/**
 * --- Setters ---
 */
// Single scalar
function setValue1f(gl, v) { gl.uniform1f(this.addr, v); }
function setValue1i(gl, v) { gl.uniform1i(this.addr, v); }

// Single float vector (from flat array or THREE.VectorN)
function setValue2fv(gl, v) {
  if (v.x === undefined) gl.uniform2fv(this.addr, v);
  else gl.uniform2f(this.addr, v.x, v.y);
}

function setValue3fv(gl, v) {
  if (v.x !== undefined)
    gl.uniform3f(this.addr, v.x, v.y, v.z);
  else if (v.r !== undefined)
    gl.uniform3f(this.addr, v.r, v.g, v.b);
  else
    gl.uniform3fv(this.addr, v);
}

function setValue4fv(gl, v) {
  if (v.x === undefined) gl.uniform4fv(this.addr, v);
  else gl.uniform4f(this.addr, v.x, v.y, v.z, v.w);
}

// Single matrix (from flat array or MatrixN)
function setValue2fm(gl, v) {
  gl.uniformMatrix2fv(this.addr, false, v.elements || v);
}

function setValue3fm(gl, v) {
  gl.uniformMatrix3fv(this.addr, false, v.elements || v);
}

function setValue4fm(gl, v) {
  gl.uniformMatrix4fv(this.addr, false, v.elements || v);
}

// Single texture (2D / Cube)
function setValueT1(gl, v, renderer) {
  let unit = renderer.allocTextureUnit();
  gl.uniform1i(this.addr, unit);
  renderer.setTexture2D(v || emptyTexture, unit);
}

function setValueT6(gl, v, renderer) {
  let unit = renderer.allocTextureUnit();
  gl.uniform1i(this.addr, unit);
  renderer.setTextureCube(v || emptyCubeTexture, unit);
}

// Integer / Boolean vectors or arrays thereof (always flat arrays)
function setValue2iv(gl, v) { gl.uniform2iv(this.addr, v); }
function setValue3iv(gl, v) { gl.uniform3iv(this.addr, v); }
function setValue4iv(gl, v) { gl.uniform4iv(this.addr, v); }

// Helper to pick the right setter for the singular case

function getSingularSetter(type) {
  switch (type) {

    case 0x1406: return setValue1f; // FLOAT
    case 0x8b50: return setValue2fv; // _VEC2
    case 0x8b51: return setValue3fv; // _VEC3
    case 0x8b52: return setValue4fv; // _VEC4

    case 0x8b5a: return setValue2fm; // _MAT2
    case 0x8b5b: return setValue3fm; // _MAT3
    case 0x8b5c: return setValue4fm; // _MAT4

    case 0x8b5e: return setValueT1; // SAMPLER_2D
    case 0x8b60: return setValueT6; // SAMPLER_CUBE

    case 0x1404: case 0x8b56: return setValue1i; // INT, BOOL
    case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4

  }
}

// Array of scalars
function setValue1fv(gl, v) { gl.uniform1fv(this.addr, v); }
function setValue1iv(gl, v) { gl.uniform1iv(this.addr, v); }

// Array of vectors (flat or from THREE classes)
function setValueV2a(gl, v) {
  gl.uniform2fv(this.addr, flatten(v, this.size, 2));
}

function setValueV3a(gl, v) {
  gl.uniform3fv(this.addr, flatten(v, this.size, 3));
}

function setValueV4a(gl, v) {
  gl.uniform4fv(this.addr, flatten(v, this.size, 4));
}

// Array of matrices (flat or from THREE clases)
function setValueM2a(gl, v) {
  gl.uniformMatrix2fv(this.addr, false, flatten(v, this.size, 4));
}

function setValueM3a(gl, v) {
  gl.uniformMatrix3fv(this.addr, false, flatten(v, this.size, 9));
}

function setValueM4a(gl, v) {
  gl.uniformMatrix4fv(this.addr, false, flatten(v, this.size, 16));
}

// Array of textures (2D / Cube)
function setValueT1a(gl, v, renderer) {
  let n = v.length,
    units = allocTexUnits(renderer, n);

  gl.uniform1iv(this.addr, units);

  for (let i = 0; i !== n; ++i) {
    renderer.setTexture2D(v[i] || emptyTexture, units[i]);
  }
}

function setValueT6a(gl, v, renderer) {
  let n = v.length,
    units = allocTexUnits(renderer, n);

  gl.uniform1iv(this.addr, units);
  for (let i = 0; i !== n; ++i) {
    renderer.setTextureCube(v[i] || emptyCubeTexture, units[i]);
  }
}

// Helper to pick the right setter for a pure (bottom-level) array
function getPureArraySetter(type) {
  switch (type) {

    case 0x1406: return setValue1fv; // FLOAT
    case 0x8b50: return setValueV2a; // _VEC2
    case 0x8b51: return setValueV3a; // _VEC3
    case 0x8b52: return setValueV4a; // _VEC4

    case 0x8b5a: return setValueM2a; // _MAT2
    case 0x8b5b: return setValueM3a; // _MAT3
    case 0x8b5c: return setValueM4a; // _MAT4

    case 0x8b5e: return setValueT1a; // SAMPLER_2D
    case 0x8b60: return setValueT6a; // SAMPLER_CUBE

    case 0x1404: case 0x8b56: return setValue1iv; // INT, BOOL
    case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
    case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
    case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
  }
}

/**
 * --- Top-level ---
 */
// Parser - builds up the property tree from the path strings
const RePathPart = /([\w\d_]+)(\])?(\[|\.)?/g;

// extracts
// 	- the identifier (member name or array index)
//  - followed by an optional right bracket (found when array index)
//  - followed by an optional left bracket or dot (type of subscript)
//
// Note: These portions can be read in a non-overlapping fashion and
// allow straightforward parsing of the hierarchy that WebGL encodes
// in the uniform names.
function addUniform(container, uniformObject) {
  container.seq.push(uniformObject);
  container.map[uniformObject.id] = uniformObject;
}

function parseUniform(activeInfo, addr, container) {
  let path = activeInfo.name,
    pathLength = path.length;

  // reset RegExp object, because of the early exit of a previous run
  RePathPart.lastIndex = 0;

  for (; ;) {
    let match = RePathPart.exec(path),
      matchEnd = RePathPart.lastIndex,

      tid = match[1],
      idIsIndex = match[2] === ']',
      subscript = match[3];

    let id;

    if (idIsIndex) {
      id = parseInt(tid);
      id = id | 0; // convert to integer
    } else {
      id = tid;
    }

    if (subscript === undefined ||
      subscript === '[' && matchEnd + 2 === pathLength) {
      // bare name or "pure" bottom-level array "[0]" suffix
      addUniform(container, subscript === undefined ?
        new SingleUniform(id, activeInfo, addr) :
        new PureArrayUniform(id, activeInfo, addr));
      break;
    } else {
      // step into inner node / create it in case it doesn't exist
      let map = container.map,
        next = map[id];

      if (next === undefined) {
        next = new StructuredUniform(id);
        addUniform(container, next);
      }
      container = next;
    }
  }
}

/**
 * Base node
 */
class UniformContainer {
  public seq;
  public map;

  constructor() {
    this.seq = [];
    this.map = {};
  }
}

/**
 * Uniform Classes
 */
class SingleUniform {
  public id;
  public addr;
  public setValue: Function;

  constructor(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;

    this.setValue = getSingularSetter(activeInfo.type);
  }
}

class PureArrayUniform {

  public id;
  public addr;
  public size;
  public setValue: Function;

  constructor(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.size = activeInfo.size;

    this.setValue = getPureArraySetter(activeInfo.type);
  }

}

class StructuredUniform extends UniformContainer {
  public id;

  constructor(id) {
    super();
    this.id = id;
  }

  public setValue(gl, value) {
    let seq = this.seq;

    for (let i = 0, n = seq.length; i !== n; ++i) {
      let u = seq[i];
      u.setValue(gl, value[u.id]);
    }
  }
}

/**
 * Root Container
 */
export class WebGLUniforms extends UniformContainer {

  public renderer;

  constructor(gl, program, renderer) {
    super();

    this.renderer = renderer;

    let n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < n; ++i) {
      let info = gl.getActiveUniform(program, i),
        path = info.name,
        addr = gl.getUniformLocation(program, path);
      parseUniform(info, addr, this);
    }
  }

  public setValue(gl, name, value) {

    let u = this.map[name];

    if (u !== undefined) {
      u.setValue(gl, value, this.renderer);
    }
  }

  public set(gl, object, name) {

    let u = this.map[name];

    if (u !== undefined) {
      u.setValue(gl, object[name], this.renderer);
    }
  }

  public setOptional(gl, object, name) {

    let v = object[name];

    if (v !== undefined) {
      this.setValue(gl, name, v);
    }
  }

  public static upload(gl, seq, values, renderer) {

    for (let i = 0, n = seq.length; i !== n; ++i) {
      let u = seq[i],
        v = values[u.id];

      if (v.needsUpdate !== false) {
        // note: always updating when .needsUpdate is undefined
        u.setValue(gl, v.value, renderer);
      }
    }
  }

  public static seqWithValue(seq, values) {

    let r = [];

    for (let i = 0, n = seq.length; i !== n; ++i) {
      let u = seq[i];

      if (u.id in values) {
        r.push(u);
      }
    }

    return r;
  }
}
