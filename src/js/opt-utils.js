/**
 * OptUtils
 *
 * Static class which provides utilities for dealing with function arguments.
 */

class StaticOptUtils {

	/**
	 * Returns a given option or a given default value if the option is not specified
	 */
	default( option, defaultValue ) {
		return option !== undefined ? option : defaultValue;
	}
}

export let OptUtils = new StaticOptUtils();