/**
 * ImageLoader
 *
 * Static class which provides functionality for loading the images required by the banner.
 */

import { EventEmitter } from 'eventemitter3';
import { GetBaseURL } from './base-url';

class GameImageInfo {
	constructor( name ) {
		this.name = name;
		this.regularLoaded = false;
		this.glitchedLoaded = false;
		this.regularImage = null;
		this.glitchedImage = null;
	}
}

class StaticImageLoader extends EventEmitter {

	constructor() {
		super();
		this.imageIndex = 0;
		this.gameImages = [ new GameImageInfo( 'initial' ) ];
		// 	name: initial,
		// 	regularLoaded: false,
		// 	glitchedLoaded: false,

		// }]
		this.baseURL = '';
	}

	load() {
		// Get games list from the "games" HTML attribute. This list is separated by commas and is transformed
		// into an array of objects which are used to track the state of each image pair (glitched and regular 
		// images).
		const gamesAttribute = document.getElementById( 'homepage-banner' ).getAttribute( 'games' );
		gamesAttribute.split( ', ' ).forEach( gameName => {
			this.gameImages.push( new GameImageInfo( gameName ) );
		});

		// Loop thru the list of game images and load them
		this.gameImages.forEach( imageInfo => {
			this.loadSingleImageOfType( imageInfo, 'regular' );
			this.loadSingleImageOfType( imageInfo, 'glitched' );
		});
	}

	/**
	 * Loads a single image from a given GameImageInfo object with a given type, either "regular" or "glitched".
	 */
	loadSingleImageOfType( imageInfo, type ) {
		const imageToLoad = imageInfo[ type + 'Image' ] = new Image();
		imageToLoad.setAttribute( 'name', imageInfo.name );
		imageToLoad.setAttribute( type, '' );

		imageToLoad.addEventListener( 'load', event => {
			// Firefox sets the parameters of the "load" event object a bit differently than other browsers, so 
			// pick whichever parameter actually exists.
			const eventTarget = event.target ? event.target : event.path[ 0 ];

			// Find the cooresponding GameImageInfo object using the loaded image's "name" attribute so that it can
			// be marked as loaded.
			const loadedImageInfo = this.gameImages.find( el => el.name === eventTarget.getAttribute( 'name' ));
			loadedImageInfo[ type + 'Loaded' ] = true;
			
			console.log( 'loaded ' + type + ' image: ' + loadedImageInfo.name );

			this.checkImageLoadComplete();
		});

		// Set image src attributes to start loading
		imageToLoad.src = GetBaseURL() + imageInfo.name + '-' + type + '.png';
	}

	/**
	 * Checks if there are no more images left to load. If all images are loaded, dispatch a "complete" event.
	 */
	checkImageLoadComplete() {
		// Get list of any remaining unloaded images
		var remainingImagesToLoad = this.gameImages.filter( imageInfo => {
			return !( imageInfo.regularLoaded && imageInfo.glitchedLoaded );
		});

		if ( remainingImagesToLoad.length === 0 ) {
			console.log('loading complete');
			this.emit( 'complete' );
		}
	}

	setImageIndex( newIndex ) {
		this.imageIndex = newIndex;
	}

	incrementImageIndex() {
		this.imageIndex = ( this.imageIndex + 1 ) % this.gameImages.length;
	}

	/**
	 * Returns the image info object at the current index.
	 */
	getCurrentImageInfo() {
		return this.gameImages[ this.imageIndex ];
	}

	/**
	 * Returns the image info object at the next index.
	 */
	getNextImageInfo() {
		var nextIndex = ( this.imageIndex + 1 ) % this.gameImages.length;
		return this.gameImages[ nextIndex ];
	}
}

export let ImageLoader = new StaticImageLoader();