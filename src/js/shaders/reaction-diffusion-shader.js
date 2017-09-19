export const vertexShader = [
	
	'#ifdef GL_ES',
		'precision mediump float;',
	'#endif',

	'attribute vec3 aPos;',
	'attribute vec2 aTexCoord;',

	'varying vec2 uv;',
	'varying vec2 logoUV;',

	'uniform float screenX;',
	'uniform float screenY;',

	'void main() {',
		'uv = aTexCoord;',

		'float logoSize = 0.27;',
		'float aspect = screenX / screenY;',
		'vec2 logoSize2 = vec2( logoSize, logoSize * aspect );',
		
		'logoUV = ( uv / logoSize2 ) + 0.5 - ( 0.5 / logoSize2 );',

		'gl_Position = vec4( aPos, 1.0 );',
	'}'

].join( '\n' );


export const fragmentShader = [

	'#ifdef GL_ES',
		'precision mediump float;',
	'#endif',

	'const vec2 size = vec2( 1024.0, 512.0 );',

	'varying vec2 uv;',
	'varying vec2 logoUV;',

	'uniform float sizeX;',
	'uniform float sizeY;',
	'uniform float screenX;',
	'uniform float screenY;',
	
	'uniform float delta;',
	'uniform float time;',
	'uniform float mx;',
	'uniform float my;',

	'uniform float feed;',
	'uniform float kill;',
	'uniform float rateA;',
	'uniform float rateB;',
	
	'uniform float logoAmount;',
	'uniform float addLogoPre;',
	'uniform float addLogoPost;',
	'uniform float reset;',

	'uniform sampler2D tSource;',
	'uniform sampler2D tBrush;',
	'uniform sampler2D tButtons;',

	'float halfMask( float a, float b ) {',
		'return clamp( ( 1.0 - ( abs( a - b ) * 2.0 ) ) * 4096.0, 0.0, 1.0 );',
	'}',

	'void main() {',

		'float gradient = length( uv * 2.0 - 1.0 ) / 2.0;',

		// Calculate the laplacian, which is the difference between the average of nearby cells and 
		// this cell. This is done via a 3x3 convolution using only adjacent neighbors each with a 
		// weight of 0.25
		'vec2 step = 0.5 / mix( size * 0.5, size * 0.25, gradient );',
		'vec2 uvA = texture2D( tSource, uv ).rg;',
		'vec2 uv0 = texture2D( tSource, uv + vec2( -step.x,  0.0 ) ).rg;',
		'vec2 uv1 = texture2D( tSource, uv + vec2(  step.x,  0.0 ) ).rg;',
		'vec2 uv2 = texture2D( tSource, uv + vec2( 0.0,  -step.y ) ).rg;',
		'vec2 uv3 = texture2D( tSource, uv + vec2( 0.0,   step.y ) ).rg;',
		'vec2 lapl = uv0 + uv1 + uv2 + uv3 - 4.0 * uvA;',

		'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		'float logo = texture2D( tBrush, logoUV * mask ).r;',
		'float btns = texture2D( tButtons, uv ).r;',

		// 'float f = mix( 0.022, 0.021, gradient );',
		'float f = mix( 0.015, 0.042, mix( 0.11, 0.364, mx ) );',
		'float k = mix( 0.055, 0.054, gradient );',
		'float mmy = mix( 0.33, 1.0, my );',

		'float da = mix( rateA, rateA, gradient ) * mmy;',
		'float db = mix( rateB, rateB, gradient ) * mmy;',

		// Add logo to A and B to integrate it into the pattern.
		'float a = uvA.r + ( logo / logoAmount ) * addLogoPre;',
		'float b = uvA.g + ( logo / logoAmount ) * addLogoPre;',
		'float reaction = a * b * b;',

		'float d = delta * 1.0;',

		// Equation explanation: http://www.karlsims.com/rd.html
		'float du = a + ( da * lapl.r - reaction + f * ( 1.0 - a ) ) * d;',
		'float dv = b + ( db * lapl.g + reaction - ( k + f ) * b ) * d;',

		// Add logo to reaction both reaction components
		'if ( logo > 0.0 && addLogoPost > 0.0 ) {',
			'dv = logo / 3.0;',
			'du = logo / 3.0;',
		'}',

		'gl_FragColor = vec4( du, dv, 0.0, 1.0 );',
	'}'

].join( '\n' );