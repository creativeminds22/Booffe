import { Platform } from 'react-native';

export const WEBSITEURL = 'https://www.booffe.com';
export const GOOGLEAPIKEY = Platform.OS === 'ios' ? 'AIzaSyBXuaLm8gTNmaaM03nxfyzfTCJq0-cbSEQ' : 'AIzaSyD_jztW86xPILOoqukh-ryM7O4Ax2ALB5A'; /* You should also specify the Android Key in android/app/src/main/AndroidManifest.xml*/
export const WOOCUSTOMERKEY = 'ck_5bb9f8ee8548930ee5e6bdbe5f5dc5668fa4030e'; /* Your WooCommerce consumer key. You can get it from yourwebsite.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys */
export const WOOCUSTOMERSECRET = 'cs_50a274fcb8703e9d6a9d84fc0977c342bd0be9ad'; /* Your WooCommerce consumer secret. You can get it from yourwebsite.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys */
export const APPCOUNTRY = 'bj';
export const APPCURRENCY = 'CFA';
export const APPDEFAULTMAPSCOORD = '9.307700,2.315800'; /* This will go to New York City */

export const SEARCHRESULTSSORTINGOPTIONS = {
	popularity: 'Populaire',
	toprated: 'Mieux noté',
	distance: 'Distance'
};

/*Colors*/
export const STATUSBARCOLOR = '#3fa613'; /* You also need to add this color value to /android/app/src/main/res/values/colors.xml */
export const LOADINGSCREENCOLOR = '#eeeeee'; /* This color is not used in the JS it only should be added to /android/app/src/main/res/values/colors.xml and also changing it accordingly in LaunchScreen.xib for IOS with xcode */
export const HOMEHEADINGCOLOR = '#eeeeee';
export const HOMEHEADINGTEXTCOLOR = '#1e1e1e';
export const BOTTOMTABSCOLOR = '#ffffff';
export const BOTTOMTABSICONSCOLOR = 'rgba(0,0,0,0.7)';
export const BOTTOMTABSACTIVECOLOR = '#3fa613';
export const MODALBODYCOLOR = '#f4f9f4';
export const SECONDARYBUTTONSCOLOR = '#dd3333';
export const SECONDARYBUTTONSTEXTCOLOR = '#ffffff';
export const PRIMARYBUTTONCOLOR = '#3fa613';
export const PRIMARYBUTTONTEXTCOLOR = '#ffffff';

/*
 * Fonts
 * 
 * Available fonts:
 * Rubik
 * 
*/
export const APPFONTMEDIUM = 'Rubik-Medium';
export const APPFONTREGULAR = 'Rubik-Regular';
export const APPFONTBOLD = 'Rubik-Bold';
