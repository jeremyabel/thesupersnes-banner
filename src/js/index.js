import { Tile } from './tile';
import { ImageLoader } from './image-loader';
import { MathUtils } from './math-utils';
import { GLUtils } from './gl-utils';
import { IntroTransition } from './intro-transition';
import { ImageTransition } from './image-transition';
import { GetBaseURL } from './base-url';

const GlitchShader = require ( './shaders/glitch-shader' );

// Not used in development environment
// const fit = require( 'fit.js' ); 

// The GL context
var gl;

const screenWidth = 845;
const screenHeight = 380;

// Texture dimensions
const sizeX = 512;
const sizeY = 256;

// Settings for the glitch shader
var progGlitchShader;
var glitchShaderUniforms = {
	tRegularImageA: { type: 't', value: 1 },
	tRegularImageB: { type: 't', value: 2 },
	tGlitchedImageA: { type: 't', value: 3 },
	tGlitchedImageB: { type: 't', value: 4 },
	tMask: { type: 't', value: 5 },
	fTime: { type: '1f', value: 0 },
	glitchAmt: { type: '1f', value: 0 },
};

var lastTime = 0;

var eventTex;
var regularImageTexA, regularImageTexB;
var glitchedImageTexA, glitchedImageTexB;
var initialImage;
var eventCanvas, eventContext;
var domCanvas, domContext;

var lastTime = 0;

var mouseDown = false;
var mousePos = { x: 0, y: 0 };
var clickPos = { x: 0, y: 0 };
var mouseForce = 0;
var mouseForceFiltered = 0;
const forceAttenuate = 5;
var transformScale = 1;
var mouseTiles = [];
var transitionTiles = [];
var sleepTimer = 5;
var texturesReady = false;
var isShowingInitialImage = true;

document.addEventListener( 'DOMContentLoaded', () => {

	IntroTransition.init();

	// Set up canvas dimensions
	domCanvas = document.getElementById( 'banner-canvas' );
	domCanvas.width = screenWidth;
	domCanvas.height = screenHeight;

	domCanvas.addEventListener( 'mousedown', event => {
		mouseDown = true;
		switchImages();
		resetSleepTimer();
	});

	domCanvas.addEventListener( 'mousemove', event => {
		onPointerMove( event );
		resetSleepTimer();
	});

	document.addEventListener( 'mouseup', event => {
		mouseDown = false;
		resetSleepTimer();
	});

	// Pass mousedown events thru the title text block
	const titleTextBlock = document.getElementById( 'homepage-title' );
	titleTextBlock.addEventListener( 'mousedown', event => {
		mouseDown = true;
		switchImages();
		resetSleepTimer();
	});

	// Pass mousemove events thru the title text block
	titleTextBlock.addEventListener( 'mousemove', event => {
		onPointerMove( event );
		resetSleepTimer();
	});

	// Create canvas for sending cursor and click event information to the WebGL shader. 
	// If there is an HTML element for the event canvas, use that. Otherwise create a new one.
	// In the development environment, it is helpful to see the event canvas, but it can be 
	// removed in the production environment.
	eventCanvas = document.getElementById( 'event-canvas' ) || document.createElement( 'canvas' );
	eventCanvas.width = sizeX;
	eventCanvas.height = sizeY;

	// Initialize the event canvas with a solid black fill
	eventContext = eventCanvas.getContext( '2d' );
	eventContext.fillStyle = 'rgba(0,0,0,1)';
	eventContext.fillRect( 0, 0, sizeX, sizeY );

	gl = domCanvas.getContext( 'webgl' );

	// Prepare the glitch shader
	progGlitchShader = GLUtils.createAndLinkProgram( gl, GlitchShader.vertexShader, GlitchShader.fragmentShader );

	// Prepare the rendering surface
	GLUtils.prepareSurface( gl, progGlitchShader, 'aPos', 'aTexCoord' );

	// Create a GL texture using the eventCanvas
	eventTex = GLUtils.createTextureFromImage( gl, eventCanvas );

	// Load the game images, then play the intro transition and switch to the first game image.
	ImageLoader.on( 'complete', () => {
		IntroTransition.play( 0.05, 0.2 );
		setImagesToTextures();
		switchImages({ 
			x: 80, 
			y: 100
		});
	});

	ImageLoader.load();

	// Use the fit.js library to deal with resizing issues when the banner is inside the production wordpress
	// environment. This has been commented out here because it is not required in the development environment.
	//
	// const bannerContainer = document.getElementById( 'homepage-banner' );
	// const bannerParent = document.getElementById( 'homepage-banner-parent' );
	// fit( bannerContainer, bannerParent, { watch: true, vAlign: fit.TOP } );
	// fit( bannerContainer, bannerParent, { watch: true, vAlign: fit.TOP }, transform => {
	// 	transformScale = transform.scale;
	// 	bannerParent.style.height = screenHeight * transformScale + 'px';
	// });

	window.requestAnimationFrame( update );
});

function onPointerMove( event ) {
	// Get x and y coordinates from either a touch event or the mouse cursor
	var x = 'ontouchstart' in window ? event.touches[0].clientX : event.clientX;
	var y = 'ontouchstart' in window ? event.touches[0].clientY : event.clientY;

	// Transform to canvas space
	x -= domCanvas.getBoundingClientRect().left;
	y -= domCanvas.getBoundingClientRect().top;
	x *= sizeX / ( screenWidth * transformScale );
	y *= sizeY / ( screenHeight * transformScale );

	const dx = x - mousePos.x;
	const dy = y - mousePos.y;

	mousePos = { x: x, y: y };
	mouseForce += ( Math.sqrt( dx * dx + dy * dy ) - mouseForce ) / 4;

	// Get 3 random positions centered around the cursor's position
	const scatterPos1 = { x: mousePos.x + MathUtils.random( 0, dx ), y: mousePos.y + MathUtils.random( 0, dy ) };
	const scatterPos2 = { x: mousePos.x + MathUtils.random( 0, dx ), y: mousePos.y + MathUtils.random( 0, dy ) };
	const scatterPos3 = { x: mousePos.x + MathUtils.random( 0, dx ), y: mousePos.y + MathUtils.random( 0, dy ) };

	// Add 3 new tiles using the scattered positions. Tile size is larger with more mouse force
	mouseTiles.push( new Tile( scatterPos1, mouseForce / forceAttenuate ) );
	mouseTiles.push( new Tile( scatterPos2, mouseForce / forceAttenuate ) );
	mouseTiles.push( new Tile( scatterPos3, mouseForce / forceAttenuate ) );
}

function switchImages( manualClickPos ) {
	if ( !ImageTransition.isPlayingTransition ) {
		ImageTransition.playTransition();

		if ( manualClickPos !== undefined ) {
			clickPos = { x: manualClickPos.x, y: manualClickPos.y };
		} else {
			clickPos = { x: mousePos.x, y: mousePos.y };	
		}
		
		// Clear transition tiles pool
		transitionTiles = [];
		
		// Wait for the transition to finish before switching to the next image
		ImageTransition.once( 'transition-complete', () => {

			// Delay to prevent mouse mashery 
			setTimeout( () => {

				// The initial image is not part of the set of game images, so remove it
				// if it is being shown. Otherwise, increment the image index normally.
				if ( isShowingInitialImage ) {
					ImageLoader.gameImages.shift();
					isShowingInitialImage = false;
				} else {
					ImageLoader.incrementImageIndex();	
				}
				
				ImageTransition.resetTransition();
				setImagesToTextures();
			}, 1);
		});
	}
}

function setImagesToTextures() {
	const imageInfoA = ImageLoader.getCurrentImageInfo();
	const imageInfoB = ImageLoader.getNextImageInfo();

	// Create GL textures if they haven't been created yet
	if ( !texturesReady ) {
		regularImageTexA = GLUtils.createTextureFromImage( gl, imageInfoA.regularImage );
		regularImageTexB = GLUtils.createTextureFromImage( gl, imageInfoB.regularImage );
		glitchedImageTexA = GLUtils.createTextureFromImage( gl, imageInfoA.glitchedImage );
		glitchedImageTexB = GLUtils.createTextureFromImage( gl, imageInfoB.glitchedImage );
		texturesReady = true;
	}

	GLUtils.updateImageTexture( gl, regularImageTexA, imageInfoA.regularImage );
	GLUtils.updateImageTexture( gl, regularImageTexB, imageInfoB.regularImage );
	GLUtils.updateImageTexture( gl, glitchedImageTexA, imageInfoA.glitchedImage );
	GLUtils.updateImageTexture( gl, glitchedImageTexB, imageInfoB.glitchedImage );

	resetSleepTimer();
}

function resetSleepTimer() {
	sleepTimer = 5;
}

/**
 * Update the state of the banner and render it to the screen
 */
function update( time ) {

	// Calculate delta time
	var dt = ( time - lastTime ) / 20;
	lastTime = time;
	const dtSlow = dt / 50;

	sleepTimer = Math.max( 0, sleepTimer - dtSlow );

	mouseForceFiltered += (mouseForce - mouseForceFiltered) / (5 / dt);

	////////////////////////////////////////////////////////////////
	// Cursor Brush Rect FX
	////////////////////////////////////////////////////////////////

	// Set up composition mode and clear the screen
	eventContext.globalCompositeOperation = 'source-over';
	eventContext.fillStyle = 'rgba(0,0,0,1)';
	eventContext.fillRect( 0, 0, sizeX, sizeY );

	// Red is used for masking the glitched and non-glitched images in the shader
	eventContext.fillStyle = '#F00';

	// Update mouse tiles
	mouseTiles.filter( tile => { return !tile.killMe; } ).forEach( tile => {
		tile.tick( dtSlow );
		var rect = tile.getRect();
		eventContext.fillRect( rect.x, rect.y, rect.w, rect.h );
	});

	////////////////////////////////////////////////////////////////
	// Image Transition Rect FX
	////////////////////////////////////////////////////////////////

	if ( ImageTransition.isPlayingTransition ) {

		// Green is used to for masking between Image A and Image B in the shader
		eventContext.fillStyle = '#0F0';

		// Preserve red channel mouse trails by adding green rather than overwriting
		eventContext.globalCompositeOperation = 'lighten';

		const nTilesToAdd = Math.floor( ImageTransition.transitionProgress * screenWidth / 10 );

		// Spawn tiles in a circle radiating outwards from the click origin
		for ( var i = 0; i < nTilesToAdd; i++ ) {
			const t = i * ( ( 2 * Math.PI ) / nTilesToAdd );
			const r = ImageTransition.transitionProgress * screenWidth;
			const x = clickPos.x + ( Math.sin( t ) * r );
			const y = clickPos.y + ( Math.cos( t ) * r );
			const newTile = new Tile( { x: x, y: y }, 5 );
			newTile.speed = 1.2;

			// These tiles should not transition out
			newTile.playClear = false;
			
			transitionTiles.push( newTile );
		}

		// Update transition tiles
		transitionTiles.forEach( tile => {
			tile.tick( dtSlow );
			const rect = tile.getRect();
			eventContext.fillRect( rect.x, rect.y, rect.w, rect.h );
		});
	}

	////////////////////////////////////////////////////////////////
	// WebGL Rendering
	////////////////////////////////////////////////////////////////
	
	if ( texturesReady && sleepTimer > 0 ) {

		// Update the event texture
		GLUtils.updateImageTexture( gl, eventTex, eventCanvas );

		// Increment shader time value
		glitchShaderUniforms.fTime.value = time / 1000;

		// More mouse force = more glitchy
		glitchShaderUniforms.glitchAmt.value = mouseForceFiltered / 40;

		gl.viewport( 0, 0, screenWidth, screenHeight );

		// Set screen shader uniforms
		gl.useProgram( progGlitchShader );
		GLUtils.setUniforms( gl, progGlitchShader, glitchShaderUniforms );

		// Bind regular A texture
		gl.activeTexture( gl.TEXTURE1 );
		gl.bindTexture( gl.TEXTURE_2D, regularImageTexA );

		// Bind regular B texture
		gl.activeTexture( gl.TEXTURE2 );
		gl.bindTexture( gl.TEXTURE_2D, regularImageTexB );

		// Bind glitched A texture
		gl.activeTexture( gl.TEXTURE3 );
		gl.bindTexture( gl.TEXTURE_2D, glitchedImageTexA );

		// Bind glitched B texture
		gl.activeTexture( gl.TEXTURE4 );
		gl.bindTexture( gl.TEXTURE_2D, glitchedImageTexB );

		// Bind mask texture
		gl.activeTexture( gl.TEXTURE5 );
		gl.bindTexture( gl.TEXTURE_2D, eventTex );

		// Draw quad to the screen
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
		gl.flush();
	}

	mouseForce = 0;

	// Update transition animations
	ImageTransition.tick( dt / 70 );
	IntroTransition.tick( dt / 50 );

	window.requestAnimationFrame( update );
}