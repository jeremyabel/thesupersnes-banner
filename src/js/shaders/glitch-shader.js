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

	'float sat( float t ) {',
		'return clamp( t, 0.0, 1.0 );',
	'}',

	'vec2 sat( vec2 t ) {',
		'return clamp( t, 0.0, 1.0 );',
	'}',

	'vec3 spectrumOffset( float t ) {',
	    'float t0 = 3.0 * t - 1.5;',
		'return clamp( vec3( -t0, 1.0 - abs( t0 ), t0 ), 0.0, 1.0 );',
	'}',

	'float rand( vec2 n ) {',
	  	'return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);',
	'}',

	'float trunc( float x, float num_levels ) {',
		'return floor(x * num_levels) / num_levels;',
	'}',
	
	'vec2 trunc( vec2 x, float num_levels ) {',
		'return floor(x * num_levels) / num_levels;',
	'}',

	'varying vec2 uv;',

	'uniform sampler2D tRegularImageA;',
	'uniform sampler2D tRegularImageB;',
	'uniform sampler2D tGlitchedImageA;',
	'uniform sampler2D tGlitchedImageB;',
	'uniform sampler2D tMask;',
	'uniform float fTime;',
	'uniform float glitchAmt;',
	'uniform float transition;',

	'void main() {',

		'vec3 mask = texture2D( tMask, uv ).rgb;',
		'vec3 texRegularA = texture2D( tRegularImageA, uv ).rgb;',
		'vec3 texRegularB = texture2D( tRegularImageB, uv ).rgb;',
		'vec3 texRegular = mix( texRegularA, texRegularB, mask.g );',
		
		'vec2 uvs = uv;',
		'float time = mod( fTime, 32.0 );',
		'float GLITCH = 0.04 + glitchAmt;',
		'float gnm = sat( GLITCH );',
			
		'float rnd0 = rand( trunc( vec2( time, time ), 6.0 ) );',
		'float r0 = sat( ( 1.0 - gnm ) * 0.7 + rnd0 );',
		
		// Horizontal
		'float rnd1 = rand( vec2( trunc( uv.x, 40.0 * r0 ), time ) );',
		'float r1 = 0.5 - 0.5 * gnm + rnd1;',
		'r1 = 1.0 - max( 0.0, ( (r1 < 1.0) ? r1 : 0.9999999) );',
		
		// Vertical
		'float rnd2 = rand( vec2( trunc( uv.y, 40.0 * r1 ), time ) );',
		'float r2 = sat( rnd2 );',
		
		'float rnd3 = rand( vec2( trunc( uv.y, 10.0 * r0 ), time ) );',
		'float r3 = ( 1.0 - sat( rnd3 + 0.8 ) ) - 0.1;',

		'float rr4 = rand( trunc( vec2( time, time ), 12.0 ) );',
		'float rnd4 = rand( trunc( vec2( rr4 * 5.0 * uv.x, rr4 * 5.0 * uv.y ), 6.0 ) );',
		'float r4 = rnd4 > 0.95 ? 1.0 : 0.0;',

		'GLITCH += ( rnd0 > 0.1 ? 0.0 : 0.5 );',

		'float ofs = 0.05 * r2 * GLITCH * ( rnd0 > 0.5 ? 1.0 : -1.0 );',
		'ofs += 0.5 * rand( uv + time ) * ofs;',

		'uvs.y += 0.1 * r3 * GLITCH;',

    	'const int NUM_SAMPLES = 4;',
    	'const float RCP_NUM_SAMPLES_F = 1.0 / float( NUM_SAMPLES );',

    	'vec3 sum = vec3( 0.0 );',
		'vec3 wsum = vec3( 0.0 );',

		'for ( int i = 0; i < NUM_SAMPLES; ++i )',
		'{',
			'float t = float( i ) * RCP_NUM_SAMPLES_F;',
			'uvs.x = sat( uvs.x + ofs * t );',

			'vec3 samplecolA = texture2D( tGlitchedImageA, uvs, -10.0 ).rgb;',
			'vec3 samplecolB = texture2D( tGlitchedImageB, uvs, -10.0 ).rgb;',

			'float flicker = (rnd0 > 0.0 ? 1.0 : 0.0) * r4;',
			'vec3 samplecol = mix( mix( samplecolA, samplecolB, mask.g ), texRegular, flicker);',

			'vec3 s = spectrumOffset( t );',
			'samplecol = samplecol * s;',
			'sum += samplecol;',
			'wsum += s;',
		'}',

		'sum.rgb /= wsum;',

		'vec3 c = mix( texRegular, sum.rgb, mask.r ).rgb;',
		'gl_FragColor = vec4( c, 1.0 );',
	'}'

].join( '\n' );