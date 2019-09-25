import React from 'react';
import { Text, View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import DeliveryIcon from '../assets/images/Delivery';
import DistanceIcon from '../assets/images/Distance';
import Feather from 'react-native-vector-icons/Feather';
import VendorRating from './VendorRating';
import i18n, { rtl } from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../config';
import { connect } from 'react-redux';

class FeaturedItemVendor extends React.Component {
	render() {
		const vendor = this.props.vendor;
		const vendor_id = this.props.vendor_id;
		const layoutStyle = this.props.layoutStyle;
		const divider = this.props.distanceDivider;
		const distanceUnit = this.props.distanceUnitShortName;
		
		return (
			<TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('Vendor', {vendorid: vendor_id})}}>
				<View style={[layoutStyle != 'simple' ? styles.wrapper : styles.wrapperSimple, this.props.fullWidth == true ? styles.wrapperFullWidth : styles.wrapperNormalWidth, {width: this.props.itemWidth}]}>
					{layoutStyle == 'simple' ? (
					<Image resizeMode='cover' style={styles.vendorCoverSimple} source={vendor.cover ? {uri: vendor.cover} : require('../assets/images/placeholder.png')} />
					) : null}
					
					{layoutStyle != 'simple' ? (
					<View>
						<Image resizeMode='cover' style={styles.vendorCover} source={vendor.cover ? {uri: vendor.cover} : require('../assets/images/placeholder.png')} />
						{vendor.rating > 0 ? (
						<VendorRating style={styles.vendorRating} rating={vendor.rating} />
						) : null}
					</View>
					) : (
					<View style={styles.wrapperLeft}>
						<Image resizeMode='cover' style={styles.vendorLogoSimple} source={ vendor.logo ? {uri: vendor.logo} : require('../assets/images/placeholder.png')} />
					</View>
					)}
					
					{layoutStyle == 'simple' && vendor.rating > 0 ? (
						<VendorRating style={styles.vendorRatingSimple} rating={vendor.rating} />
					) : null}
					<View style={layoutStyle != 'simple' ? styles.vendorDetailsWrapper : styles.vendorDetailsWrapperSimple}>
						{layoutStyle != 'simple' ? <Image resizeMode='cover' style={styles.vendorLogo} source={ vendor.logo ? {uri: vendor.logo} : require('../assets/images/placeholder.png')} /> : null}
						<View style={layoutStyle != 'simple' ? styles.vendorDetails : styles.vendorDetailsSimple}>
							<Text style={layoutStyle != 'simple' ? styles.vendorName : styles.vendorNameSimple} numberOfLines={1}>{vendor.name}</Text>
							<View style={styles.tagsWrapper}>
								<Feather name='tag' style={layoutStyle != 'simple' ? styles.icon : styles.iconSimple} />
								<Text style={layoutStyle != 'simple' ? styles.vendorTags : styles.vendorTagsSimple} numberOfLines={1}>{vendor.vendorclass.join(', ')}</Text>
							</View>
							{!vendor.distance && vendor.distance !== 0 || vendor.distance > 0 && parseInt(vendor.distance)/divider > 60 ? (
							<View style={styles.tagsWrapper}>
								<Feather name='map-pin' style={layoutStyle != 'simple' ? styles.icon : styles.iconSimple} />
								<Text style={layoutStyle != 'simple' ? styles.vendorAddress : styles.vendorAddressSimple} numberOfLines={1}>{vendor.address}</Text>
							</View>
							) : null}
							<View style={styles.distanceMainWrapper}>
								{vendor.duration && Math.round(vendor.duration/60) < 60 || vendor.duration === 0 ? (
									<View style={styles.distanceWrapper}>
										<DeliveryIcon height={12} width={12}/>
										{vendor.custom_delivery_duration ? (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{vendor.custom_delivery_duration}</Text>										
										) : vendor.duration === 0 ? (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{i18n.t('FEATUREDVENDOR_FewMinutes')}</Text>
										) : (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{Math.round(vendor.duration/60)} - {Math.round(vendor.duration/60)+10} {i18n.t('FEATUREDVENDOR_Min')}</Text>
										)}
									</View>
								) : null}
								{vendor.distance && parseInt(vendor.distance)/divider < 60 || vendor.distance === 0 ? (
									<View style={styles.distanceWrapper}>
										<DistanceIcon height={12} width={12}/>
										{parseInt(vendor.distance)/divider > 1 ? (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{Math.round(vendor.distance/divider)} {distanceUnit}</Text>
										) : vendor.distance === 0 ? (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{i18n.t('FEATUREDVENDOR_FewMetersAway')}</Text>
										) : (
										<Text style={layoutStyle != 'simple' ? styles.distance : styles.distanceSimple}>{vendor.distance} {i18n.t('FEATUREDVENDOR_Meters')}</Text>
										)}
									</View>
								) : null}
							</View>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
const styles = StyleSheet.create({
	wrapper: {
		overflow: 'hidden',
		position: 'relative',
	},
	wrapperSimple: {
		borderRadius: 7,
		overflow: 'hidden',
		position: 'relative',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#000',
		marginBottom: 6,
	},
	wrapperFullWidth: {
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
	},
	wrapperNormalWidth: {
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
	},
	wrapperLeft: {
		width: '30%',
		height: 120,
	},
	vendorCover: {
		height: 120,
		borderRadius: 7,
		overflow: 'hidden',
		width: '100%',
	},
	vendorCoverSimple: {
		height: 120,
		width: '100%',
		position: 'absolute',
		opacity: .7,
		top: 0,
		left: 0,
	},
	vendorRating: {
		position: 'absolute',
		right: 0,
		top: 16,
	},
	vendorRatingSimple: {
		position: 'absolute',
		right: 0,
		top: 16,
	},
	vendorDetailsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		paddingTop: 16,
	},
	vendorDetailsWrapperSimple: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	vendorLogo: {
		height: 40,
		width: 40,
		marginRight: 16,
		borderRadius: 20,
		overflow: 'hidden',
	},
	vendorLogoSimple: {
		height: 40,
		width: 40,
		borderRadius: 20,
		overflow: 'hidden',
		position: 'absolute',
		left: '50%',
		marginLeft: -20,
		top: 40
	},
	vendorDetails: {
		marginRight: 16,
		flex: 1,
	},
	vendorDetailsSimple: {
		marginRight: 16,
		flex: 1,
	},
	vendorName: {
		color: '#1e1e1e',
		fontSize: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	vendorNameSimple: {
		color: '#fff',
		fontSize: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	tagsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendorTags: {
		fontSize: 14,
		color: '#666',
		fontFamily: APPFONTREGULAR,
		marginTop: 4,
		marginBottom: 1.5,
	},
	vendorTagsSimple: {
		fontSize: 14,
		color: '#fff',
		fontFamily: APPFONTREGULAR,
		marginTop: 4,
		marginBottom: 1.5,
	},
	vendorAddress : {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#666',
	},
	vendorAddressSimple : {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#fff',
	},
	distanceMainWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	distanceWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	distance: {
		color: '#666',
		fontSize: 14,
		marginLeft: 6,
		fontFamily: APPFONTREGULAR,
		marginRight: 8,
	},
	distanceSimple: {
		color: '#fff',
		fontFamily: APPFONTREGULAR,
		fontSize: 13,
		marginLeft: 6,
		marginRight: 8,
	},
	icon: {
		fontSize: 12,
		marginRight: 8,
	},
	iconSimple: {
		color: '#fff',
		fontSize: 12,
		marginRight: 8,
	}
});

const mapStateToProps = state => {
	return {
		distanceDivider: state.distanceDivider,
		distanceUnitShortName: state.distanceUnitShortName,
	};
};

export default connect(mapStateToProps)(FeaturedItemVendor);