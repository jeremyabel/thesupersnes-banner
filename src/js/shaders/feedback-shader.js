export const vertexShader = [
	
	'attribute vec3 aPos;',
	'attribute vec2 aTexCoord;',

	'varying vec2 uv;',

	'void main() {',
		'uv = aTexCoord;',
		'gl_Position = vec4( aPos, 1.0 );',
	'}'

].join( '\n' );

export const fragmentShader = [
	
	'#ifdef GL_ES',
		'precision lowp float;',
	'#endif',

	'varying vec2 uv;',

	'uniform float time;',
	'uniform sampler2D tReaction;',
	'uniform sampler2D tSource;',

	'const vec4 col1 = vec4( 0.1, 0.1, 0.2, 1.0 );',
	'const vec4 col2 = vec4( 0.1, 0.1, 0.3, 1.0 );',

	'void main() {',

		'vec2 uv0 = -1.0 + 2.0 * uv;',
		'uv0 *= 0.995;',
		'uv0 = uv0 * 0.5 + 0.5;',
		
		'vec2 o[9];',
		'float k[9];',

		'vec2 step = 1.0 / vec2( 2048.0, 1024.0 );',

		'o[0] = vec2(-step.x, -step.y);',
	    'o[1] = vec2(0.0, -step.y);',
	    'o[2] = vec2(step.x, -step.y);',
	    
	    'o[3] = vec2(-step.x, 0.0);',
	    'o[4] = vec2(0.0, 0.0);',
	    'o[5] = vec2(step.x, 0.0);',
	    
	    'o[6] = vec2(-step.x, step.y);',
	    'o[7] = vec2(0.0, step.y);',
	    'o[8] = vec2(step.x, step.y);',

	    'float a = -0.5;',
	    'float b = -a / 2.0;',
	    'float z = 0.0;',
	    
	    'k[0] = a; k[1] = z; k[2] = b;',
	    'k[3] = z; k[4] = b; k[5] = z;',
	    'k[6] = z; k[7] = z; k[8] = z;',

	    'vec4 last = texture2D( tSource, uv0 );',
	    'vec4 c = last;',

	    'last.gb = -1.0 + 2.0 * last.gb;',

	    'for ( int i = 0; i < 9; i++ ) {',
	    	'c.gbar += texture2D( tSource, ( uv0 + o[i] ) - last.rb * 0.025 ) * k[i];',
	    '}',

	    'vec4 src = vec4( texture2D( tReaction, uv ).ggg, 1.0 ) + col1 * col2;',
	    'c.rgb = mix( c.rgb, src.rgb, src.gbr * 0.15 + 0.21 );',

		'gl_FragColor = vec4( clamp( c.rgb, 0.0, 1.0 ), 1.0 );',
	'}'

].join( '\n' );