import React from 'react';
import { Text, View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR } from '../config';
import Coupon from '../assets/images/Coupon';
import i18n, { rtl } from '../i18n/config';

class ListItemProduct extends React.Component {
	render() {
		const item = this.props.itemData;
		let regularPrice = i18n.toNumber(item.regular_price, {precision: 3, strip_insignificant_zeros: true});
		let price = i18n.toNumber(item.price, {precision: 3, strip_insignificant_zeros: true});
		
		if (item.is_variable) {
			const rawRegularPrice = item.regular_price.split('-');
			const rawPrice = item.price.split('-');
			
			if (rawRegularPrice.length > 1) {
				regularPrice = i18n.toNumber(rawRegularPrice[0], {precision: 3, strip_insignificant_zeros: true})+' - '+i18n.toNumber(rawRegularPrice[1], {precision: 3, strip_insignificant_zeros: true});
			} else {
				regularPrice = i18n.toNumber(rawRegularPrice[0], {precision: 3, strip_insignificant_zeros: true});
			}
			
			if (rawPrice.length > 1) {
				price = i18n.toNumber(rawPrice[0], {precision: 3, strip_insignificant_zeros: true})+' - '+i18n.toNumber(rawPrice[1], {precision: 3, strip_insignificant_zeros: true});
			} else {
				price = i18n.toNumber(rawPrice[0], {precision: 3, strip_insignificant_zeros: true});
			}
		}
		
		return (
			<TouchableHighlight underlayColor='transparent' onPress={() => this.props.navigation.navigate('ProductModal', {product: item})}>
				<View style={styles.singleProductRow}>
					{item.imagelink ? (
					<Image style={styles.itemImg} source={{ uri: item.imagelink }}/>
					) : null}
					<View style={styles.itemDetails}>
						<Text style={styles.title}>{item.title}</Text>
						<View style={styles.priceWrapper}>
							{item.on_sale ? (
								<Text style={styles.regularPriceText}>{APPCURRENCY}{regularPrice}</Text>
							) : null}
							<Text style={styles.priceText}>{APPCURRENCY}{price}</Text>
							{item.on_sale ? (
								<Text style={styles.sale}>{i18n.t('Sale')}</Text>
							) : null}
						</View>
						<Text style={styles.excerpt} numberOfLines={2} >{item.excerpt}</Text>
						{item.has_coupon ? (
						<View style={styles.hasCoupon}>
							<Coupon width={24} height={24} />
						</View>
						) : null}
					</View>
				</View>
			</TouchableHighlight>
		);
	}
}
const styles = StyleSheet.create({
	singleProductRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemImg: {
		height: 80,
		width: 80,
		marginLeft: 16,
		borderRadius: 7,
		overflow: 'hidden',
	},
	itemDetails: {
		flex: 2,
		padding: 16,
		position: 'relative',
	},
	title: {
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	priceWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	priceText: {
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	regularPriceText: {
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textDecorationLine: 'line-through',
		marginRight: rtl ? 0 : 4,
		marginLeft: rtl ? 4 : 0,
		textAlign: 'left',
	},
	sale: {
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		textTransform: 'uppercase',
		borderRadius: 4,
		overflow: 'hidden',
		padding: 4,
		marginLeft: 12,
		marginRight: 12,
		fontSize: 8,
		fontFamily: APPFONTMEDIUM,
	},
	excerpt: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		marginTop: 5,
		textAlign: 'left',
	},
	hasCoupon: {
		position: 'absolute',
		right: 16,
		top: 12,
	},
});

const mapStateToProps = state => {
	return {
	};
};

export default connect(mapStateToProps)(ListItemProduct);