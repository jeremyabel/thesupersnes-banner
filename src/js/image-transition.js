import { EventEmitter } from 'eventemitter3';

/**
 * ImageTransition
 * 
 * Static class which provides control functions for running the background image transition effect.
 */
class StaticImageTransition extends EventEmitter {

	constructor() {
		super();
		this.resetTransition();
	}

	playTransition() {
		this.isPlayingTransition = true;
		this.transitionProgress = 0;
	}

	/**
	 * Advance the transition effect's animation by a given delta time value.
	 * When the elapsed time is 1, emit the "transition-complete" event.
	 */
	tick( dt ) {
		if ( this.isPlayingTransition ) {
			this.transitionProgress += dt;
		}

		if ( this.transitionProgress >= 1 ) {
			this.emit( 'transition-complete' );
			this.transitionProgress = 1;	
		}
	}

	resetTransition() {
		this.isPlayingTransition = false;
		this.transitionProgress = 0;
	}
}

export let ImageTransition = new StaticImageTransition();