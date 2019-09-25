import React from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONTEXTCOLOR, PRIMARYBUTTONCOLOR } from '../config';
import i18n from '../i18n/config';

class VendorRating extends React.Component {
	
	state = {
		ratingColor: new Animated.Value(parseFloat(this.props.rating)),
	}
	
	render() {
		const rating = this.props.rating;
		
		if (rating < 2) {
			return false;
		}
		
		return (
			<View style={[this.props.style, styles.wrapper]} >
				<Animated.View style={[styles.ratingBackground, {
					opacity: this.state.ratingColor.interpolate({
						inputRange: [2, 5],
						outputRange: [.5, 1],
					})
				}]} />
				<Text style={styles.ratingText}>{i18n.toNumber(rating, {precision: 1})}</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	wrapper: {
		width: 40,
		height: 24,
		paddingTop: 3,
		borderTopLeftRadius: 3,
		borderBottomLeftRadius: 3,
		overflow: 'hidden',
		backgroundColor: '#fff',
	},
	ratingBackground: {
		position: 'absolute',
		left: 0,
		width: 40,
		height: 24,
		top: 0,
		backgroundColor: PRIMARYBUTTONCOLOR
	},
	ratingText: {
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 12,
		marginTop: 2,
		textAlign: 'center',
		fontFamily: APPFONTMEDIUM,
	},
});

export default VendorRating;