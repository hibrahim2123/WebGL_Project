document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  const vsSource = `
      attribute vec4 aVertexPosition;
      void main(void) {
          gl_Position = aVertexPosition;
      }
  `;

  const fsSource = `
    void main(void) {
        if (gl_FragCoord.x < -0.8) {
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);  // Yellow for H
        } else if (gl_FragCoord.x < -0.6) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);  // White for A
        } else if (gl_FragCoord.x < -0.4) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);  // Green for L
        } else if (gl_FragCoord.x < -0.2) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red for I
        } else {
            gl_FragColor = vec4(0.5, 0.0, 0.5, 1.0);  // Purple for L (final one)
        }
    }
`;

  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(shaderProgram)
      );
      return null;
    }

    return shaderProgram;
  }

  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
  };

  const buffers = initBuffers(gl);

  drawScene(gl, programInfo, buffers);

  function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      // H
      -0.9, 0.8, -0.9, -0.8, -0.7, 0.0, -0.9, 0.0, -0.7, 0.8, -0.7, -0.8,

      // A
      -0.6, -0.8, -0.5, 0.8, -0.5, 0.8, -0.4, -0.8, -0.55, 0.0, -0.45, 0.0,

      // L
      -0.3, 0.8, -0.3, -0.8, -0.3, -0.8, -0.1, -0.8,

      // I
      0.0, 0.8, 0.0, -0.8,

      // L
      0.1, 0.8, 0.1, -0.8, 0.1, -0.8, 0.3, -0.8,

      // L (final one)
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  }

  function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    gl.useProgram(programInfo.program);

    {
      const offset = 0;
      const vertexCount = 24;
      gl.drawArrays(gl.LINES, offset, vertexCount);
    }
  }
});
