/**
 * Tile
 *
 * Class which represents a single animated "tile", a rectangle used to create a pixely brush
 * effect with some nice scaling fade-in-out animation.
 */

import { EventEmitter } from 'eventemitter3';
import { MathUtils } from './math-utils';

const steps = 8;
const minBrushSize = 4;
const maxBrushSize = 10;

export class Tile extends EventEmitter {

	constructor( point, force ) {
		super();

		// The more mouse force, the larger the tile
		const brushSize = MathUtils.clamp( force + minBrushSize, minBrushSize, maxBrushSize );

		this.spawnPoint = point;
		this.initialWidth = MathUtils.random( 7, 15 ) * brushSize;
		this.initialHeight = MathUtils.random( 7, 15 ) * brushSize;
		this.width = this.initialWidth;
		this.height = 0;
		this.t = MathUtils.random( -0.5, 0 );
		this.pause = false;
		this.hasPaused = false;
		this.killMe = false;
		this.playClear = true;
		this.speed = 1.75;
	}

	tick( dt ) {
		if ( !this.pause ) {
			this.t = Math.min( 1, this.t + dt * this.speed );
		}

		// Update the tile scale animation if it's not paused
		if ( this.t > 0 && !this.pause ) {

			// The tile scale animation is just on the y-axis, and it is animated using a stepped
			// cosine wave for a glitchy effect. The wave animates the height of the tile from 
			// 0 to initialHeight and back to 0.
			const wave = ( Math.cos( Math.max( 0, this.t ) * 2 * Math.PI ) * -0.5 + 0.5 ) * steps;
			const steppedWave = Math.floor( wave ) / steps;
			this.height = steppedWave * this.initialHeight;

			// Once the wave animation reaches the middle of its cycle, pause for a bit before continuing 
			// the animation, which will scale the tile from initialHeight down to 0.
			if ( this.t >= 0.5 && !this.pause && !this.hasPaused ) {
				this.pause = true;
				
				setTimeout( () => {
					// Resume the animation only if the playClear flag is set. This flag is only cleared for the 
					// image transition tiles, which must stay on screen for the full duration of the transition 
					// animation.
					if ( this.playClear ) {
						this.pause = false;
						this.hasPaused = true;
					}
				}, 400);
			}

		} else if ( !this.pause ) {
			this.height = 0;
		}

		if ( this.t >= 1 ) {
			this.killMe = true;
		}
	}

	/**
	 * Returns the rectangle to be used for drawing this tile on the canvas.
	 */
	getRect() {
		return {
			x: this.spawnPoint.x - (this.width / 2),
			y: this.spawnPoint.y - (this.height / 2),
			w: this.width,
			h: this.height
		};
	}
}