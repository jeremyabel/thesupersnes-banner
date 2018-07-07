/**
 * IntroTransition
 *
 * Static class which provides functionality for playing the text portion of the intro transition.
 * The animation consists of random shuffling letters which resolve to the original text 
 * in the header's HTML tags.
 */

const chars = 'ABCDEFGHIGJLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const symbols = '!#?;÷$¢×≠@+';

class StaticIntroTransition {

	constructor() {
		this.firstLineAnimChars = [];
		this.secondLineAnimChars = [];
		this.isPlaying = false;
	}

	init() {
		this.firstLineEl = document.getElementById( 'header-first-line' );
		this.secondLineEl = document.getElementById( 'header-second-line' );
		
		this.firstLineText = this.firstLineEl.innerHTML;
		this.secondLineText = this.secondLineEl.innerHTML;
	}

	play( delay, duration ) {
		const firstLineDelay = 0.4;
		const secondLineDelay = 0.4;

		setTimeout( () => {
			this.firstLineEl.classList.add( 'intro-show' );
		}, firstLineDelay * 1000 );

		setTimeout( () => {
			this.secondLineEl.classList.add( 'intro-show' );
		}, ( firstLineDelay + secondLineDelay ) * 1000 );
		
		// Convert first and second line strings to arrays
		const firstLineChars = this.firstLineText.split( '' );
		const secondLineChars = this.secondLineText.split( '' );

		// Create SingleCharacters for each letter in the first line
		// and begin playback after firstLineDelay.
		firstLineChars.forEach( ( char, i ) => {
			const animChar = new SingleCharacter( char );
			this.firstLineAnimChars.push( animChar );
			animChar.play( i * delay + firstLineDelay, duration );
		});

		// Create SingleCharacters for each letter in the second line
		// and begin playback after firstLineDelay + secondLineDelay.
		secondLineChars.forEach( ( char, i ) => {
			const animChar = new SingleCharacter( char );
			this.secondLineAnimChars.push( animChar );
			animChar.play( i * delay + firstLineDelay + secondLineDelay, duration );
		});

		this.isPlaying = true;
	}

	tick( dt ) {
		if ( !this.isPlaying ) return;

		// Tick characters
		this.firstLineAnimChars.forEach( char => char.tick( dt ) );
		this.secondLineAnimChars.forEach( char => char.tick( dt ) );

		// Concat line arrays into strings
		this.firstLineEl.innerHTML = this.firstLineAnimChars.map( char => char.currentChar ).reduce( (acc, cur) => acc + cur ); 
		this.secondLineEl.innerHTML = this.secondLineAnimChars.map( char => char.currentChar ).reduce( (acc, cur) => acc + cur );

		// Get arrays of still-active characters in each line
		const activeInFirstLine = this.firstLineAnimChars.filter( char => char.isActive );
		const activeInSecondLine = this.secondLineAnimChars.filter( char => char.isActive );

		// If there are no active characters left, the transition is complete
		if ( activeInFirstLine.length + activeInSecondLine.length === 0 ) {
			this.isPlaying = false;
		}
	}
}

/**
 * SingleCharacter
 * 
 * Class which represents a single character in the header text. 
 * Contains functions for updating the per-character animation.
 */
class SingleCharacter {

	constructor( char ) {
		this.finalChar = char;
		this.currentChar = '';
		this.isPlaying = false;
		this.isActive = false;
		this.duration = 0;
		this.switchTimer = 0;
		this.switchFrequency = 0.04;
	}

	play( delay, duration ) {
		this.duration = duration;
		this.isActive = true;
		this.time = 0;

		// Begin playing after the given delay
		setTimeout( () => {
			this.isPlaying = true;
		}, delay * 1000);
	}

	tick( dt ) {
		if ( !this.isPlaying ) return;

		this.time += dt;
		this.switchTimer += dt;

		// Display a new random character at a constant frequency during the transition
		if ( this.switchTimer > this.switchFrequency ) {
			this.switchTimer = 0;
			this.currentChar = getRandomChar();
		}

		// Resolve to final character once the transition duration is reached
		if ( this.time > this.duration ) {
			this.isPlaying = false;
			this.isActive = false;
			this.currentChar = this.finalChar;
		}
	}
}

/**
 * Returns a random character from a selection of character arrays.
 * Which array is picked is determined randomly from a few different
 * arrays with weighted probabilities.
 */
function getRandomChar() {
	var rand = Math.random();
	if ( rand < 0.2 ) return randomCharInArray( chars );
	if ( rand < 0.5 ) return randomCharInArray( nums );
	return randomCharInArray( symbols );
}

function randomCharInArray( array ) {
	return array[ Math.floor( Math.random() * array.length ) ];
}

export let IntroTransition = new StaticIntroTransition();