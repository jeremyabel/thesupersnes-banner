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
		// 'uv.x *= 1024.0;',
		// 'uv.y *= 512.0;',

		'float logoSize = 0.17;',
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

	// '#define T( x ) texture2D( tSource, fract( ( x ) / size ) )',
	// '#define T4( x ) texture2D( tSource, fract( ( uv x ) / size ) )',
	// '#define T2( x ) texture2D( tBrush, ( ( x ) ) )',
	// '#define T3( x ) texture2D( tButtons, ( ( x ) / size ) )',

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

	// 'vec2 rotate(vec2 coords, float angle) {',
	// 	'float sin_factor = sin(angle );',
 //    	'float cos_factor = cos(angle );',
 //    	'coords = vec2((coords.x - 0.5) , coords.y - 0.5) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);',
 //    	'coords += 0.5;',
 //    	'return coords;',
	// '}',

	'void main() {',

		// 'vec4 c = uv.yyyx / 3000.0;',

		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		// 'vec4 logo = T2( logoUV * mask ) * 0.5;',

		// 'for( float t = 0.6; t <= 5.0; t += 2.0 ) {',
		// 	'c += c.gbar / 7.6 - c.bgar * 2.1 + T( uv - c.wz * t / 0.2 ) * T( sin( c.xy ) * 0.792 - uv * mx);',
		// '}',

		// 'c += logo;',

		// 'gl_FragColor = mix( (T( uv + c.xy ).grra), cos( c - 0.05 * 0.051 ), 0.75142 );',


		// 'vec4 c = uv.yyyx / 8000.0;',

		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		// 'vec4 logo = T2( logoUV * mask ) * 0.5;',

		// 'for( float t = 0.6; t <= 6.0; t += 2.0 ) {',
		// 	// 'c += c.gbar / 4.0 - c * 0.3 + T( uv - c.wz * t );',
		// 	// 'c += c.gbar / 7.6 - c.bgar * 2.1 + T( uv ) * T( c.xy );',
		// 	// 'c += c.gbar / 7.6 - c.bgar * 2.1 + T( uv - c.wz * t / 0.2 ) * T( ( c.xy ) * 0.7292 - (uv*mxx) * 0.2 * mx );',
		// 	// 'c += c.gbar / (7.6 * mx) - c.bgar * 2.1 + T( uv - c.wz * t / 0.2 ) * T( sin( c.xy ) * 0.7292 - uv * 0.2 );',
		// 	// 'c += c.gbar / 7.6 - c.bgar * 2.1 + T( uv - c.wz * t / 0.2 ) * T( ( c.xy ) * 0.7292 - uv * 0.3 );',
		// '}',

		// // 'c = mix( c, logo, logo.a * 0.9 );',//logo.r * logo.a;',
		// // 'gl_FragColor = mix( T( uv + c.xy ), cos( c ), 0.07 );',
		// 'gl_FragColor = mix( (T( uv * 0.99 + c.xy)), 0.98 * (cos( c - 0.5 * 0.55 )), 0.55 );',//0.55142 );',
		
		
		
		// 'vec4 c = T4() + ( uv.xyyy / 50.0 ) / (time / 1000.0) + logo;',

		// 'for ( int i = 0; i < 5; i++ ) {',
		// 	'c += T4( -c.xx ) - 1.1 * T4( +c.yx * (uv / size) * 0.5 * 0.01 );',
		// '}',

		// 'gl_FragColor = mix( normalize( 0.8 * T4( +c.xy  * logo.a ) + 0.012 * c.wxyz ), cos( c - 0.5 ), 0.07 );',

		// 'gl_FragColor = T3( uv );',




		// 'vec2 uv2 = uv * size;',
		// 'vec4 c = uv2.yyyx / 2000.0;',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		// 'vec4 logo = T2( logoUV * mask ) * 0.25;',

  // 		'for( float t = 0.0; t <= 40.0; t += 20.0 ) {',
		// 	'c += c.bgar / 3.0 - c * 0.52 + logo;',
		// 	'c += c.gbar / 1.4 - c.brag * 0.6 + T( uv2 + cos(c.ar) * 500.0 );',//( t / 0.12 ) * 40.0 );',
  // 		'}',
    	
		// 'gl_FragColor = mix( T( uv2 + c.xy ), cos( c ), 0.0041 );',




		// 'gl_FragColor = mix( T( uv2 + c.xy ), cos( c.garg * 1.1 ), 0.1725 );',




		// 'vec2 uv2 = uv * size;',
		// 'vec4 c = uv2.yyyx / 2000.0;',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		
		// 'for( float t = 0.1; t <= 40.0; t += 20.0 ) {',
		// 	'c += c.bgra / 2.0 - c * 0.2 + ( T2( logoUV * mask ).rrra * 0.25 );',
		// 	'c += c.gbar / 9.4 - c.brag * 0.2 + T( uv2 + c.ra * (t / 0.2) * t );',
		// '}',

		// 'gl_FragColor = mix( T( uv2 + c.yx ), cos( c.garg * 1.2 ), 0.1725 );',





		// 'vec2 uv2 = uv * size;',
		// 'vec4 c = uv2.yyyx / 2030.0;',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',

		// 'for( float t = 0.07; t <= 40.0; t += 20.0 ) {',
		// 	'c += c.bgra / 2.0 - c * 0.3 + ( T2( logoUV ).rrrr * mask );',
		// 	'c += c.gbar / 9.4 - c.barg * 0.3 + T( uv2 + c.ba * (t / 0.2) * t );',
		// '}',

		// 'gl_FragColor = mix( T( uv2 + c.xy ), cos( c.bagr ), 0.075 );',





		// 'vec2 uv2 = uv * size;',
		// 'vec4 c = uv2.yyyx / 130.0;',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',

		// 'for( float t = 0.7; t <= 40.0; t += 20.0 ) {',
		// 	'c += c.bgra / 2.0 - c * 0.3 + ( T2( logoUV * size ) * mask ).rrrr;',
		// 	'c += c.gbar / 9.4 - c.barg * 0.29 + T( uv2 + c.ba * (t / 1.0) );',
		// '}',
		
		// 'gl_FragColor = mix( T( uv2 + c.xy ), cos( c.bagr ), 0.0057 );',







		// 'vec2 uv2 = uv * size;',
		// 'vec4 c = uv2.yyyx / 230.0;',
		
		// 'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',

  		// 'for( float t = 0.0; t <= 40.0; t += 20.0 ) {',
		// 	'c += c.bgra / 2.0 - c * 0.3 + ( T2( logoUV * size ) * mask ).rrrr;',
  		// 	'c += c.gbar / 2.4 - c.rbga * 0.9 + T( uv2 + c.ba * 0.5 );',
  		// '}',
    	
		// 'c += T2( logoUV * size ).rrrr * mask;',
		// 'gl_FragColor = mix( T( uv2 + c.xy ), cos( c ), 0.57 );',






		'float gradient = length( uv * 2.0 - 1.0 ) / 2.0;',

		'vec2 step = 0.5 / mix( size * 0.5, size * 0.25, gradient );',

		// Calculate the laplacian, which is the difference between the average of nearby cells and 
		// this cell. This is done via a 3x3 convolution using only adjacent neighbors each with a 
		// weight of 0.25
		'vec2 uvA = texture2D( tSource, uv ).rg;',
		'vec2 uv0 = texture2D( tSource, uv + vec2( -step.x,  0.0 ) ).rg;',
		'vec2 uv1 = texture2D( tSource, uv + vec2(  step.x,  0.0 ) ).rg;',
		'vec2 uv2 = texture2D( tSource, uv + vec2( 0.0,  -step.y ) ).rg;',
		'vec2 uv3 = texture2D( tSource, uv + vec2( 0.0,   step.y ) ).rg;',
		'vec2 lapl = uv0 + uv1 + uv2 + uv3 - 4.0 * uvA;',

		'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		'float logo = texture2D( tBrush, logoUV * mask ).r;',
		'float btns = texture2D( tButtons, uv ).r;',

		'float f = mix( 0.022, 0.022, gradient );',
		'float k = mix( 0.055, 0.054, gradient );',
		'float da = mix( rateA, rateA, gradient );',
		'float db = mix( rateB, rateB, gradient );',

		// { f: 0.010, k: 0.045 },
		// { f: 0.022, k: 0.055, g: 600, idle: 30000 },
		// { f: 0.014, k: 0.042, g: 900, idle: 30000 },
		// { f: 0.011, k: 0.042, g: 600, idle: 30000 },
		// { f: 0.030, k: 0.057, g: 600, idle: 10000 }

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

		'if ( btns > 0.0 ) {',
			'dv = btns / 2.0;',
		'}',

		'gl_FragColor = vec4( du, dv, 0.0, 1.0 );',
	'}'

].join( '\n' );