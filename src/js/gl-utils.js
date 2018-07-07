/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/license-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the license.
 */

/**
 * GLUtils
 *
 * Static class which has functions for setting up and rendering shaders and textures on a simple 2-triangle 
 * plane surface, facing the camera. 
 *
 * This class is derived from the the version I wrote for anypixel.js for Google:
 * https://github.com/googlecreativelab/anypixel/blob/master/frontend/examples/heatmap/src/gl-utils.js
 */
class StaticGLUtils {

	/**
 	 * Creates a uv-mapped display surface for a given shader program
 	 */
	prepareSurface( gl, outputProgram, vertPosName, vertTexCoordName ) {
		const posBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, posBuffer );

		const vertices = new Float32Array( [ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ] );

		const aPosLoc = gl.getAttribLocation( outputProgram, vertPosName );
		gl.enableVertexAttribArray( aPosLoc );

		const aTexLoc = gl.getAttribLocation( outputProgram, vertTexCoordName );
		gl.enableVertexAttribArray( aTexLoc );

		const texCoords = new Float32Array( [ 0, 0, 1, 0, 0, 1, 1, 1 ] );
		const texCoordOffset = vertices.byteLength;

		gl.bufferData(gl.ARRAY_BUFFER, texCoordOffset + texCoords.byteLength, gl.STATIC_DRAW);
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertices );
		gl.bufferSubData( gl.ARRAY_BUFFER, texCoordOffset, texCoords );
		gl.vertexAttribPointer( aPosLoc, 3, gl.FLOAT, gl.FALSE, 0, 0 );
		gl.vertexAttribPointer( aTexLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset );
	}

	/**
	 * Compiles a shader script into either a vertex shader or a fragment shader
	 */
	getShader( gl, shaderScript, shaderType ) {
		const shader = gl.createShader( shaderType );

		gl.shaderSource( shader, shaderScript );
		gl.compileShader( shader );

		// Log any errors
		if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
			console.error( gl.getShaderInfoLog( shader ) );
			return null;
		}

		return shader;
	}

	/**
	 * Creates a shader program from separate vertex and fragment shader scripts
	 */
	createAndLinkProgram( gl, vertScript, fragScript ) {
		const program = gl.createProgram();

		const vert = this.getShader( gl, vertScript, gl.VERTEX_SHADER );
		const frag = this.getShader( gl, fragScript, gl.FRAGMENT_SHADER );

		gl.attachShader( program, vert );
		gl.attachShader( program, frag );
		gl.linkProgram( program );
		return program;
	}

	/**
	 * Creates a texture and binds it to a WebGLFramebuffer object.
	 */
	createAndBindTexture( gl, glPixels, sizeX, sizeY, fbo, options ) {
		const opts = options || {};
		const minFilter = opts.minFilter || opts.filter || gl.LINEAR;
		const magFilter = opts.magFilter || opts.filter || gl.LINEAR;
		const wrap = opts.wrap || gl.REPEAT;
		const format = opts.format || gl.RGBA;
		const type = opts.formatType || gl.UNSIGNED_BYTE;

		const texture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );
		gl.texImage2D( gl.TEXTURE_2D, 0, format, sizeX, sizeY, 0, format, type, glPixels );

		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap );
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0 );
		
		return texture;
	}

	/**
	 * Creates a WebGLTexture from a given Image
	 */
	createTextureFromImage( gl, image, options ) {
		const opts = options || {};
		const minFilter = opts.minFilter || opts.filter || gl.LINEAR;
		const magFilter = opts.magFilter || opts.filter || gl.LINEAR;
		const wrap = opts.wrap || gl.REPEAT;
		const format = opts.format || gl.RGBA;
		const type = opts.formatType || gl.UNSIGNED_BYTE;

		const texture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
		gl.texImage2D( gl.TEXTURE_2D, 0, format, format, type, image );

		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap );
		
		gl.bindTexture( gl.TEXTURE_2D, null );

		return texture;
	}

	/**
	 * Updates a given WebGLTexture with a given Image
	 */
	updateImageTexture( gl, texture, image ) {
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image )
	}

	/**
	 * Sets a single uniform value in a given shader program.
	 */
	setUniform( gl, program, type, name, value ) {
		const location = gl.getUniformLocation( program, name );

		switch (type) {
			case 't': 
			case '1i':  gl.uniform1i( location, value ); break;
			case '1f':  gl.uniform1f( location, value ); break;
			case '2f':  gl.uniform2f( location, value[ 0 ], value[ 1 ] ); break;
			case '3f':  gl.uniform3f( location, value[ 0 ], value[ 1 ], value[ 2 ] ); break;
			case '4f':  gl.uniform4f( location, value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ] ); break;
			case '1iv': gl.uniform1iv( location, value ); break;
			case '3iv': gl.uniform3iv( location, value ); break;
			case '1fv': gl.uniform1fv( location, value ); break;
			case '2fv': gl.uniform2fv( location, value ); break;
			case '3fv': gl.uniform3fv( location, value ); break;
			case '4fv': gl.uniform4fv( location, value ); break;
			case 'Matrix3fv': gl.uniformMatrix3fv( location, false, value ); break;
			case 'Matrix4fv': gl.uniformMatrix4fv( location, false, value ); break;
		}
	}

	/**
	 * Sets multiple uniform values for a given shader program
	 */
	setUniforms( gl, program, uniforms ) {
		for ( var uniformName in uniforms ) {
			const uniform = uniforms[ uniformName ];
			this.setUniform( gl, program, uniform.type, uniformName, uniform.value );
		}
	}

	/**
	 * Returns a pixel array at a given size with each pixel set to rgba(0, 0, 0, 255).
	 */
	getEmptyPixelArray( sizeX, sizeY ) {
		var pixels = [];

		for ( var i = 0, l = sizeX * sizeY; i < l; i++ ) {
			pixels.push( 0, 0, 0, 255 );
		}

		return pixels;
	}
}

export let GLUtils = new StaticGLUtils();