import { GLUtils } from './utils/gl-utils';

const RDShader = require( './shaders/reaction-diffusion-shader' );
const ScreenShader = require ( './shaders/screen-shader' );

// The GL context
var gl;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

// Framebuffers and textures used to render framebuffers
var fbo1, fbo2;
var tex1, tex2;

// Texture dimensions
const sizeX = 1024;
const sizeY = 512;

// Shader programs
var progReaction, progScreen;

var feedChange = 0.0, killChange = 0.0, logoChange = 0.0;
var changeLimit = 0.00005;

// The feed and kill values that are cycled through according to provided timing intervals
const fkModes = [
	{ f: 0.022, k: 0.055, g: 600, idle: 30000 },
	{ f: 0.014, k: 0.042, g: 900, idle: 30000 },
	{ f: 0.011, k: 0.042, g: 600, idle: 30000 },
	{ f: 0.030, k: 0.057, g: 600, idle: 10000 }
];

var currentMode = 0;
var atInitialState = false;
var initialStateButtons = [];

// Uniforms for the reaction shader
var reactionUniforms = {
	tSource: { type: 't', value: 0 },
	tBrush: { type: 't', value: 1 },
	tButtons: { type: 't', value: 2 },

	sizeX: { type: '1f', value: sizeX },
	sizeY: { type: '1f', value: sizeY },
	screenX: { type: '1f', value: screenWidth },
	screenY: { type: '1f', value: screenHeight },
	delta: { type: '1f', value: 1.0 },
	time: { type: '1f', value: 0.0 },
	mx: { type: '1f', value: 0.0 },
	my: { type: '1f', value: 0.0 },
	
	feed: { type: '1f', value: fkModes[ currentMode ].f },
	kill: { type: '1f', value: fkModes[ currentMode ].k },
	rateA: { type: '1f', value: 0.2097 },
	rateB: { type: '1f', value: 0.105 },
	
	logoAmount: { type: '1f', value: fkModes[ currentMode ].g },
	logoSize: { type: '1f', value: 0.25 },
	addLogoPre: { type: '1f', value: 1.0 },
	addLogoPost: { type: '1f', value: 0.0 },
	reset: { type: '1f', value: 0.0 }
};

// Uniforms for the screen shader
var screenUniforms = {
	tSource: { type: 't', value: 0 },
	tLogo: { type: 't', value: 1 },
	screenX: { type: '1f', value: screenWidth },
	screenY: { type: '1f', value: screenHeight },
};

var lastTime = 0;
var useSecondBuffer = false;

var logoTex, eventTex, logoFullTex;
var eventCanvas, eventContext;
var domCanvas;
var logoImage = new Image();
var logoImageFull = new Image();
var mouseDown = false;
var mousePos = { x: 0, y: 0 };

document.addEventListener( 'DOMContentLoaded', () => {

	(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})();

	window.addEventListener( 'resize', () => { onResize(); } );

	domCanvas = document.getElementById( 'canvas' );

	domCanvas.width = window.innerWidth;
	domCanvas.height = window.innerHeight;
	
	domCanvas.addEventListener( 'mousedown', event => {
		mouseDown = true;
		mousePos.x = event.clientX;
		mousePos.y = event.clientY;
	});

	domCanvas.addEventListener( 'mouseup', event => {
		mouseDown = false;
	});

	domCanvas.addEventListener( 'mousemove', event => {
		mousePos.x = event.clientX;
		mousePos.y = event.clientY;

		reactionUniforms.mx.value = mousePos.x / screenWidth;
		reactionUniforms.my.value = mousePos.y / screenHeight;
		console.log( reactionUniforms.mx.value);
	});

	gl = domCanvas.getContext( 'webgl', { preserveDrawingBuffer: true } );

	// Enable floating point textures
	gl.getExtension( 'OES_texture_float' );
	gl.getExtension( 'OES_texture_float_linear' );

	// Create shader programs
	progReaction = GLUtils.createAndLinkProgram( gl, RDShader.vertexShader, RDShader.fragmentShader );
	progScreen = GLUtils.createAndLinkProgram( gl, ScreenShader.vertexShader, ScreenShader.fragmentShader );

	// Prepare the rendering surface
	GLUtils.prepareSurface( gl, progScreen, 'aPos', 'aTexCoord' );

	// Create framebuffer textures and initialize them with empty pixels
	var glPixels;
	glPixels = new Float32Array( GLUtils.getEmptyPixelArray( sizeX, sizeY ) );
	fbo1 = gl.createFramebuffer();
	tex1 = GLUtils.createAndBindTexture( gl, glPixels, sizeX, sizeY, fbo1, { 
		formatType: gl.FLOAT 
	});

	glPixels = new Float32Array( GLUtils.getEmptyPixelArray( sizeX, sizeY ) );
	fbo2 = gl.createFramebuffer();
	tex2 = GLUtils.createAndBindTexture( gl, glPixels, sizeX, sizeY, fbo2, { 
		formatType: gl.FLOAT 
	});

	// Create canvas for sending event information to the GPU
	eventCanvas = document.createElement( 'canvas' );
	eventCanvas.width = sizeX;
	eventCanvas.height = sizeY;
	eventContext = eventCanvas.getContext( '2d' );
	eventContext.fillStyle = 'rgba(0,0,0,1)';
	eventContext.fillRect( 0, 0, sizeX, sizeY );

	// for ( let i = 0; i < 20; i++ ) {
	// 	eventContext.save();
	// 	eventContext.scale( sizeX / screenWidth, sizeY / screenHeight );
	// 	eventContext.fillStyle = '#FFF';

	// 	eventContext.beginPath();
	// 	eventContext.arc( Math.random() * screenWidth, Math.random() * screenHeight, 30, 0, Math.PI * 2, true);
	// 	eventContext.fill();

	// 	eventContext.restore();
	// }

	eventTex = GLUtils.createTextureFromImage( gl, eventCanvas );

	// Load the logo image
	// logoImage.onload = onImageLoadComplete;
	logoImage.src = 'img/logo.png';

	logoImageFull.onload = onImageLoadComplete;
	logoImageFull.src = 'img/logo.png';
});

function onResize() {
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	domCanvas.width = screenWidth;
	domCanvas.height = screenHeight;
}

/**
 * Event listener for imageLoadComplete. Sets logo textures and starts the update loop.
 */
function onImageLoadComplete() {
	logoTex = GLUtils.createTextureFromImage( gl, logoImage );
	logoFullTex = GLUtils.createTextureFromImage( gl, logoImageFull );
	lastTime = new Date().getTime();
	window.requestAnimationFrame( update );
}

/**
 * Updates the state of the reaction and renders it to the screen
 */
function update( time ) {

	// // Apply changes to feed value
	// if ( !almostEqual( reactionUniforms.feed.value, fkModes[ currentMode ].f) && feedChange !== 0 ) {
	// 	reactionUniforms.feed.value += feedChange * changeLimit;
	// } else {
	// 	feedChange = 0;
	// }

	// // Apply changes to kill value
	// if ( !almostEqual( reactionUniforms.kill.value, fkModes[ currentMode ].k ) && killChange !== 0 ) {
	// 	reactionUniforms.kill.value += killChange * changeLimit;
	// } else {
	// 	killChange = 0;
	// }

	// // Apply changes to logo amount value
	// if ( !almostEqual(reactionUniforms.logoAmount.value, fkModes[ currentMode ].g) && logoChange !== 0 ) {
	// 	reactionUniforms.logoAmount.value += logoChange * ( changeLimit * 10000 );
	// } else {
	// 	logoChange = 0;
	// }

	// // If the idle timer is up, trigger the feed and kill values to shift, and restart the timer
	// if ( !idleTimer.hasStarted() && 
	// 		feedChange == 0 && 
	// 		killChange == 0 && 
	// 		logoChange == 0 && 
	// 		atInitialState ) {
	// 	idleTimer.start(function() {
	// 		var df = fkModes[currentMode].f,
	// 				dk = fkModes[currentMode].k,
	// 				dg = fkModes[currentMode].g;

	// 		currentMode = (currentMode + 1) % fkModes.length;

	// 		df -= fkModes[currentMode].f;
	// 		dk -= fkModes[currentMode].k;
	// 		dg -= fkModes[currentMode].g;

	// 		feedChange = Math.sign(df) * -1;
	// 		killChange = Math.sign(dk) * -1;
	// 		logoChange = Math.sign(dg) * -1;

	// 	}, fkModes[currentMode].idle);
	// }

	// Calculate delta time
	var dt = ( time - lastTime ) / 2;
	if ( dt > 0.8 || dt <= 0 ) {
		dt = 0.8;
	}
	lastTime = dt;

	// Update uniforms
	reactionUniforms.delta.value = dt;
	reactionUniforms.time.value = time;
	reactionUniforms.screenX.value = screenWidth;
	reactionUniforms.screenY.value = screenHeight;

	screenUniforms.screenX.value = screenWidth;
	screenUniforms.screenY.value = screenHeight;

	// Fade out the event canvas contents
	console.log( time );
	if ( time > 6000 ) {
		eventContext.fillStyle = 'rgba( 0, 0, 0, 0.56 )';
		eventContext.fillRect( 0, 0, sizeX, sizeY );
	}

	if ( mouseDown ) {
		eventContext.save();
		eventContext.scale( sizeX / screenWidth, sizeY / screenHeight );
		eventContext.fillStyle = '#FFF';

		eventContext.beginPath();
		eventContext.arc(mousePos.x, mousePos.y, 30, 0, Math.PI * 2, true);
		eventContext.fill();

		eventContext.restore();
	}

	// Update image textures
	GLUtils.updateImageTexture( gl, eventTex, eventCanvas );

	gl.viewport( 0, 0, sizeX, sizeY );

	// Evaluate the reaction shaders multiple times. The number of iterations determines the speed
	// of the reaction.
	for ( var i = 0; i < 4; i++ ) {	

		// Set reaction shader unitofmrs
		gl.useProgram( progReaction );
		GLUtils.setUniforms( gl, progReaction, reactionUniforms );

		// Bind logo brush texture
		gl.activeTexture( gl.TEXTURE1 );
		gl.bindTexture( gl.TEXTURE_2D, logoTex );

		// Bind button texture
		gl.activeTexture( gl.TEXTURE2 );
		gl.bindTexture( gl.TEXTURE_2D, eventTex );

		// Bind source double-buffered texture
		if ( useSecondBuffer ) {
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, tex2 );
			gl.bindFramebuffer( gl.FRAMEBUFFER, fbo1 );
		} else {
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, tex1 );
			gl.bindFramebuffer( gl.FRAMEBUFFER, fbo2 );
		}

		// Draw full-screen quad to the bound framebuffer
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
		gl.flush();

		// Swap buffers
		useSecondBuffer = !useSecondBuffer;
	}

	// Set viewport and screen shader uniforms
	gl.viewport( 0, 0, screenWidth, screenHeight );
	gl.useProgram( progScreen );
	GLUtils.setUniforms( gl, progScreen, screenUniforms );

	// Bind the currently active buffer to the TEXTURE0 slot
	if ( useSecondBuffer ) {
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, tex2 );
	} else {
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, tex1 );
	}

	// Draw full-screen quad to the screen
	gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	gl.flush();

	window.requestAnimationFrame( update );
}