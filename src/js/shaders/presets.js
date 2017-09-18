
/////////////////////////////////////////////////////////////////////////////////
// Pink + yellow large scale
/////////////////////////////////////////////////////////////////////////////////
'#define T( x ) texture2D( tSource, fract( ( x ) / size ) )',
'#define T2( x ) texture2D( tBrush, ( ( x ) ) )',

'vec2 uv2 = uv * size;',
'vec4 c = uv2.yyyx / 1000.0;',

'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
'vec4 logo = T2( logoUV * mask ) * 0.5;',

	'for( float t = 0.8; t < 40.0; t += 10.0 ) {',
		'c += c.bgar / 4.0 - c * 0.23 * logo;',
		'c += c.gbar / 1.4 - c.brga * 0.9 + T( uv2 - cos( c.ra ) ) * logo.r;',
	'}',

'gl_FragColor = mix( T( uv2 + c.xy ), cos( c + 0.5 ), 0.03 );',



/////////////////////////////////////////////////////////////////////////////////
// Brown feedback
/////////////////////////////////////////////////////////////////////////////////
'#define T(x) texture2D( tSource, fract( ( x ) / d ) )',
'#define S c += T( uv - c.xy ) * 2.0 - 0.6;',

'vec2 d = vec2( screenX, screenY );',
'vec4 c = (uv / d / 2.0 ).xxyy * sin( time / 3.0 );',

'S S S S',

'gl_FragColor = mix( T( uv + c.zy ), fract( c / 3.0 ).argb, 0.1 );',






'vec4 c = uv.yyyx / 3000.0;',

'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
'vec4 logo = T2( logoUV * mask ) * 0.5;',

'for( float t = 0.6; t <= 5.0; t += 2.0 ) {',
	'c += c.gbar / 7.6 - c * 2.1 + T( uv - c.wz * t / 0.2 ) * T( cos( c.xy ) * 0.792 - uv );',
	'c += logo / 4.0;',
'}',

'c += logo;',

'gl_FragColor = mix( (T( uv + c.xy ).grra), cos( c - 0.5 * 0.051 ), 0.5142 );',





// THE ONE!!!
		'vec4 c = uv.yyyx / 3000.0;',

		'float mask = halfMask( 0.5, logoUV.x ) * halfMask( 0.5, logoUV.y );',
		'vec4 logo = T2( logoUV * mask ) * 0.5;',

		'for( float t = 0.6; t <= 5.0; t += 2.0 ) {',
			'c += c.gbar / 7.6 - c.bgar * 2.1 + T( uv - c.wz * t / 0.2 ) * T( sin( c.xy ) * 0.792 - uv );',
		'}',

		'c += logo;',

		'gl_FragColor = mix( (T( uv + c.xy ).grra), cos( c - 0.05 * 0.051 ), 0.75142 );',