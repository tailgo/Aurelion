function WebGLCapabilities(gl, extensions, parameters) {

  let maxAnisotropy;

  function getMaxAnisotropy() {

    if (maxAnisotropy !== undefined) return maxAnisotropy;

    let extension = extensions.get('EXT_texture_filter_anisotropic');

    if (extension !== null) {

      maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

    } else {

      maxAnisotropy = 0;

    }

    return maxAnisotropy;

  }

  function getMaxPrecision(precision) {

    if (precision === 'highp') {

      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {

        return 'highp';

      }

      precision = 'mediump';

    }

    if (precision === 'mediump') {

      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {

        return 'mediump';

      }

    }

    return 'lowp';

  }

  let precision = parameters.precision !== undefined ? parameters.precision : 'highp';
  let maxPrecision = getMaxPrecision(precision);

  if (maxPrecision !== precision) {

    console.warn('THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.');
    precision = maxPrecision;

  }

  let logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true && !!extensions.get('EXT_frag_depth');

  let maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  let maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  let maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  let maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

  let maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  let maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
  let maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
  let maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

  let vertexTextures = maxVertexTextures > 0;
  let floatFragmentTextures = !!extensions.get('OES_texture_float');
  let floatVertexTextures = vertexTextures && floatFragmentTextures;

  return {

    getMaxAnisotropy: getMaxAnisotropy,
    getMaxPrecision: getMaxPrecision,

    precision: precision,
    logarithmicDepthBuffer: logarithmicDepthBuffer,

    maxTextures: maxTextures,
    maxVertexTextures: maxVertexTextures,
    maxTextureSize: maxTextureSize,
    maxCubemapSize: maxCubemapSize,

    maxAttributes: maxAttributes,
    maxVertexUniforms: maxVertexUniforms,
    maxVaryings: maxVaryings,
    maxFragmentUniforms: maxFragmentUniforms,

    vertexTextures: vertexTextures,
    floatFragmentTextures: floatFragmentTextures,
    floatVertexTextures: floatVertexTextures

  };

}


export { WebGLCapabilities };
