/**
 * MathUtils
 *
 * Static class which provides miscellaneous math-related utility functions and constants.
 */

import { OptUtils } from './opt-utils';

class StaticMathUtils {

	/**
	 * Returns true if a given value is a number, otherwise false
	 */
	isNumeric( n ) {
		return !isNaN( parseFloat ( n ) ) && isFinite( n );
	}

	/**
	 * Returns a random float between min and max
	 */
	random( min, max ) {
		min = OptUtils.default( min, 0 );
		max = OptUtils.default( max, 1 );
		return Math.random() * ( max - min ) + min;
	}

	/**
	 * Returns a random integer between min inclusive and max exclusive
	 */
	randomInt( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) + min );
	}

	/**
	 * Returns a random item from a given array
	 */
	randomFromArray( array ){
		return array[ this.randomInt( 0, array.length - 1 ) ];
	}

	/**
	 * Returns ±1, randomly
	 */
	randomSign() {
		return Math.random() > 0.5 ? -1 : 1;
	}

	/**
	 * Returns a random THREE.Vector2 where each component is between min and max.
	 * A given axis string is used to specify which axis are randomized.
	 */
	randomVec2( min, max, axis ) {
		axis = OptUtils.default( axis, 'xy' );
		const x = axis.includes( 'x' ) ? this.random( min, max ) : 0;
		const y = axis.includes( 'y' ) ? this.random( min, max ) : 0;
		return new THREE.Vector2( x, y );
	}

	/**
	 * Returns a random THREE.Vector3 where each component is between min and max.
	 * A given axis string is used to specify which axis are randomized.
	 */
	randomVec3( min, max, axis ) {
		axis = OptUtils.default( axis, 'xyz' );
		const x = axis.includes( 'x' ) ? this.random( min, max ) : 0;
		const y = axis.includes( 'y' ) ? this.random( min, max ) : 0;
		const z = axis.includes( 'z' ) ? this.random( min, max ) : 0;
		return new THREE.Vector3( x, y, z );
	}

	/**
	 * Returns a random THREE.Vector3 between a given inner and outer radius, centered
	 * at a given position. Distribution will be weighted towards the center.
	 */
	randomVec3InRing( center, innerRadius, outerRadius ) {
		const r = innerRadius + Math.random() * ( outerRadius - innerRadius );
		const a = Math.random() * 2 * Math.PI;
		const x = center.x + Math.cos( a ) * r;
		const y = center.y;
		const z = center.z + Math.sin( a ) * r;
		return new THREE.Vector3( x, y, z );
	}

	/**
	 * Clamps a given value between min and max
	 */
	clamp( value, min, max ) {
		return Math.min( Math.max( value, min ), max );
	}

	/**
	 * Remaps a given value from one range to another
	 */
	remapRange( v, oldmin, oldmax, newmin, newmax ) {
		return ( ( ( v - oldmin ) * ( newmax - newmin ) ) / ( oldmax - oldmin ) ) + newmin;
	}

	/**
	 * Linearly interpolates from a to b using the given alpha t
	 */
	lerp( a, b, t ) {
		return a * ( 1 - t ) + b * t;
	}

	/**
	 * Returns the square of a given value
	 */
	square( a ) {
		return a * a;
	}

	/**
 	 * Calculates constant cubic easing towards a changing target value
 	 */
	smooth( current, target, velocity, dt, smoothTime, smoothMax ) {
		const t = 2 / smoothTime;
		const t2 = t * dt;
		const cubic = 1 / ( 1 + t2 + 0.5 * t2 * t2 + 0.25 * t2 * t2 * t2 );
		const limit = smoothMax * smoothTime;
		const delta = current - target;
		const error = MathUtils.clamp( delta, -limit, limit );
		const d = ( velocity + t * error ) * dt;

		return {
			velocity: ( velocity - t * d ) * cubic,
			value: ( current - error ) + ( d + error ) * cubic
		};
	}

	/**
	 * Returns a bouncy easing path from a given number from 0..1
	 * Number of bounces can be specified between 1 and 4, along with
	 * a given starting offset value.
	 *
	 * Based on Robert Penner's easing function of the same name.
	 */
	bounceEase( p, numBounces, offset ) {
		const a = -7.5625;
		const t = 2.75;
		const b = [ 1 / t, 2 / t, 2.5 / t, 1 ];

		offset = OptUtils.default( offset, 0 );

		p = Math.min( 1, ( ( p - offset ) / ( 1 - offset ) ) * b[ numBounces - 1 ] );

		// Calculate piecewise bouncy parabolic path
		if ( p < b[ 0 ] ) {
			return 1 + a * this.square( p );
		} else if ( p < b[ 1 ] ) {
			return 1 + a * this.square( p - ( 1.5 / t ) ) - 0.75;
		} else if ( p < b[ 2 ] ) {
			return 1 + a * this.square( p - ( 2.25 / t ) ) - 0.9375;
		} else {
			return 1 + a * this.square( p - ( 2.625 / t ) ) - 0.984375;
		}
	}

	/**
	 * Returns a rectified sinewave which can be shaped by a given exponent.
	 * Higher numbers give a more pointed shape.
	 */
	periodicLump( t, w ) {
		w = OptUtils.default( w, 1 );
		return Math.pow( Math.abs( Math.sin( Math.PI * t ) ), w ); 
	}
	
	/**
	 * Generates one-dimensional noise from a sum of sinewaves. Two random values are used for 
	 * variation. The numbers are arbitrary and simply mash a bunch of waves together into curvy 
	 * smooth noise which animates nicely. I think this was originally written by Steven Wittens
	 * in a Winamp AVS preset in 2004 or so.
	 */
	curveNoise( t, r1, r2 ) {
		var th = Math.sin(t) * Math.cos(t * 1.123 + r1) + Math.cos(t * 4.411 + r2) + t * 4 + Math.sin(t * 0.31);
		return ((Math.cos(t * 1.66) + Math.sin(t * 2.32 + r2) * Math.cos(t * 3.217 - r1)) - Math.cos(t * 9.167) * Math.cos(th)) / 2.8;
	}
}

export let MathUtils = new StaticMathUtils();