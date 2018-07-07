/**
 * Function which returns the base path location for the banner images, defined by the "baseurl" HTML attribute.
 */
export function GetBaseURL() {
	// The "baseurl" attribute prevents hardcoding the image path into javascript, since the image path
	// is different when developing locally versus when deployed in production. By defining it in an HTML
	// attribute, the correct path can be set differently depending on which page the banner is placed on.
	return document.getElementById( 'homepage-banner' ).getAttribute( 'baseurl' ) || '';
}