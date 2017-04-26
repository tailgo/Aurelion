function addLineNumbers(str) {

  let lines = str.split('\n');
  for (let i = 0; i < lines.length; i++) {
    lines[i] = (i + 1) + ': ' + lines[i];
  }
  return lines.join('\n');
}

function WebGLShader(gl, type, str) {

  let shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
    console.error('THREE.WebGLShader: Shader couldn\'t compile.');
  }

  if (gl.getShaderInfoLog(shader) !== '') {
    console.warn('THREE.WebGLShader: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(str));
  }

  // --enable-privileged-webgl-extension
  // console.log( type, gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );
  return shader;
}

export { WebGLShader };
