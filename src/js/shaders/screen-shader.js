export const vertexShader = [
	
	'attribute vec3 aPos;',
	'attribute vec2 aTexCoord;',

	'varying vec2 uv;',
	'varying vec2 logoUV;',

	'uniform float screenX;',
	'uniform float screenY;',

	'void main() {',
		'uv = aTexCoord;',

		'float logoSize = 0.17;',
		'float aspect = screenX / screenY;',
		'vec2 logoSize2 = vec2( logoSize, logoSize * aspect );',

		'logoUV = ( uv / logoSize2 ) + 0.5 - ( 0.5 / logoSize2 );',

		'gl_Position = vec4( aPos, 1.0 );',
	'}'

].join( '\n' );

export const fragmentShader = [
	
	'#ifdef GL_ES',
		'precision lowp float;',
	'#endif',

	'varying vec2 uv;',
	'varying vec2 logoUV;',

	'uniform sampler2D tSource;',
	'uniform sampler2D tLogo;',
	'uniform float t;',

	'const vec3 cb = vec3( 56.0, 58.0, 65.0 ) / 255.0;',
	// 'const vec3 ca = vec3( 45.0, 46.0, 53.0 ) / 255.0;',
	'const vec3 ca = vec3( 45.0, 46.0, 53.0 ) / 255.0;',

	'void main() {',
		'vec4 v = texture2D( tSource, uv );',

		'float s = -0.05;',	// Brightness
		'float q = 2.0;',	// Contrast
		
		'vec4 c = vec4( v.r * q + s, v.g * q + s, v.b * q + s, 1.0 );',
		'c.rgb = ( c.rgb - 0.5 ) / ( 1.0 - 0.68 ) + 0.5;',

		'vec3 cc = mix( ca, cb, c.rgb );',

		'gl_FragColor = vec4( mix( c.rgb, cc, clamp( t, 0.0, 1.0 ) ), 1.0 );',
	'}'

].join( '\n' );