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

	// 'float halfMask( float a, float b ) {',
	// 	'return clamp( ( 1.0 - ( abs( a - b ) * 2.0 ) ) * 4096.0, 0.0, 1.0 );',
	// '}',

	'void main() {',
		'vec4 v = texture2D( tSource, uv );',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		// 'vec4 logo = texture2D( tLogo, logoUV * mask );',

		'float s = -0.5;',	// Brightness
		'float q = 5.5;',	// Contrast
		
		'vec4 c = vec4( v.g * q + s, v.g * q + s, v.g * q + s, 1.0 );',
		'c.rgb = ( c.rgb - 0.5 ) / ( 1.0 - 0.68 ) + 0.5;',

		// 'vec4 black = vec4( vec3( 0.0 ), 1.0 );',
		// 'vec4 logoMask = mix( black, vec4( 1.0 ), mask * logo.a );',
		// 'vec4 logo2 = mix( vec4(0.2), logo, logoMask.rrrr );',

		// 'gl_FragColor = 1.0 - v.agrb - logo2.rrrr;',
		// 'gl_FragColor = clamp( v.raga * 0.5, 0.0, 1.0 );',
		

		// 'gl_FragColor = v.raga;', // <--- THIS ONE
		'gl_FragColor = c;',


		// 'gl_FragColor = mix( cc, black, 1.0 - logo);',

		// 'gl_FragColor += logo2.rrra * 0.5;',
		// 'gl_FragColor += black * logo2.rrrr;',
		// 'gl_FragColor = logo2;',
		// 'gl_FragColor = mix( v * 1.0, vec4( 0.0, 0.0, 0.0, 1.0 ), texture2D( tLogo, logoUV ) * mask );',
		// 'gl_FragColor = texture2D( tLogo, logoUV );',
	'}'

].join( '\n' );

// NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
// ( uv.x * ( newmax - newmin ) ) + newmin