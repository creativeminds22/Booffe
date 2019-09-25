import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import ShoppingBasketIcon from '../assets/images/ShoppingBasket';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR } from '../config';
import i18n, { rtl } from '../i18n/config';

class CartBar extends React.Component {

	render() {
		if (parseFloat(this.props.total) > 0) {
			return (
				<View style={styles.cartBarContainer}>
					<ShoppingBasketIcon style={styles.basket} />
					<Text style={styles.cartTotal}>{APPCURRENCY}{i18n.toNumber(this.props.total, {precision: 3, strip_insignificant_zeros: true})}</Text>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('QuickCart')}}>
						<Text style={styles.openCartBtn} ><Feather name='maximize-2' style={styles.zoomIn} /></Text>
					</TouchableHighlight>
				</View>
			);
		} else {
			return false;
		}
	}
}
const styles = StyleSheet.create({
	cartBarContainer: {
		...Platform.select({
			ios: {
				shadowColor: 'black',
				shadowOffset: { height: -3 },
				shadowOpacity: 0.1,
				shadowRadius: 3,
				paddingBottom: getStatusBarHeight(),
				height: 56 + getStatusBarHeight(),
			},
			android: {
				elevation: 20,
				height: 56,
			},
		}),
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: PRIMARYBUTTONCOLOR,
		paddingLeft: 16,
	},
	basket: {
		width: 24,
		paddingTop: 4,
		height: 24,
		marginRight: 32,
	},
	cartTotal: {
		flex: 2,
		paddingTop: 4,
		fontSize: 24,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontFamily: APPFONTMEDIUM,
		marginRight: 16,
	},
	openCartBtn: {
		width: 56,
		height: 24,
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
		textAlign: 'right',
	},
	zoomIn: {
		fontSize: 24,
		color: PRIMARYBUTTONTEXTCOLOR,
	},
});

const mapStateToProps = state => {
	return {
		total: state.cartTotals.total,
	};
};

export default connect(mapStateToProps)(CartBar);