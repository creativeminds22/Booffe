import React from 'react';
import { connect } from 'react-redux';
import { Animated, Text, ScrollView, Dimensions, StatusBar, Platform, StyleSheet, Button, Alert, View, TouchableOpacity, PanResponder } from 'react-native';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, GOOGLEAPIKEY, STATUSBARCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, HOMEHEADINGCOLOR, HOMEHEADINGTEXTCOLOR } from '../config';
import { Coupons } from '../components/home/Coupons';
import { RecommendedVendors } from '../components/home/RecommendedVendors';
import { VendorsTags } from '../components/home/VendorsTags';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { VendorsList } from '../components/home/VendorsList';
import { SpecialProducts } from '../components/home/SpecialProducts';
import { isPointInPolygon } from 'geolib'
import FeaturedVendors from '../components/home/FeaturedVendors';
import OrderThankYou from '../components/OrderThankYou';
import GeneralFilters from '../components/GeneralFilters';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SvgCompass from '../assets/images/Compass';
import IosStatusBar from '../components/IosStatusBar';
import i18n from '../i18n/config';
import ContentLoader from '../components/ContentLoader';

let noResultsMsg;

const { width: viewportWidth } = Dimensions.get('window');

class Home extends React.Component {
	scroll = new Animated.Value(0);
	
	state = {
		headerY: Animated.multiply(Animated.diffClamp(this.scroll, 0, 56 + getStatusBarHeight()), -1),
		headerElevation: 0,
		showSelectedVendorType: false,
		showDarkBg: new Animated.Value(0),
		animatePickerWrapper: new Animated.Value(viewportWidth),
		showOptionsModal: false,
	}
	
	componentDidMount = () => {
		if (this.props.updateData) {
			this._loadApp();
		}
	}
	
	componentDidUpdate = (prevProps, prevState) => {
		if (this.props.updateData) {
			this._loadApp();
		}
		if (this.props.navigation.getParam('openViewOptions') == true && !this.state.showOptionsModal) {
			this.setState({showOptionsModal: true}, () => {this.props.navigation.setParams({openViewOptions: false})});
		}
	}

	_scrollListener = (e) => {
		const scrollPosition = e.nativeEvent.contentOffset.y;
		if (scrollPosition > 56 && this.state.headerElevation == 0) {
			this.setState({headerElevation: 5, showSelectedVendorType: true});
		} else if (scrollPosition < 56 && this.state.headerElevation > 0) {
			this.setState({headerElevation: 0, showSelectedVendorType: false});
		}
	}
	
	_openOptionsModal = () => {
		this.setState({showOptionsModal: true});
	}
	
	_closeOptionsModal = () => {
		this.setState({showOptionsModal: false});
	}
	
	_pageHeader = () => {
		const headerShadow = this.state.headerElevation > 0 ? {...Platform.select({ios: { shadowColor: 'black', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.25,shadowRadius: 3.84},android: {elevation: 5}})} : null;

		return (
			<Animated.View style={[styles.headerWrapper, headerShadow, {
				transform: [{
					translateY: this.state.headerY
				}]
			}]}>
				<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
				{this.state.showSelectedVendorType ? (
				<View style={styles.headerLeft}>
					<Text style={styles.headerWrapperTitle}>{this.props.selectedVendorType}</Text>
				</View>
				) : null}
				<View style={styles.headerRight}>
					<TouchableOpacity onPress={this._openOptionsModal}>
						<Feather name='sliders' style={[styles.headerIcon, styles.headerIconRight]}/>
					</TouchableOpacity>
				</View>
			</Animated.View>
		)
	}

	_renderTitle = () => {
	
		return (
			<View style={styles.headerTitleWrapper}>
				<Text style={styles.headerTitle} numberOfLines={3}>{this.props.appTitle}</Text>
			</View>
		);
	}
	
	_loadApp = async () => {
		const orderType = this.props.orderType;
		
		noResultsMsg = i18n.t('HOME_NoVendorsFound');
		
		if (orderType == 'delivery' && !this.props.userLocationSet) {
			return false;
		}

		const userlocalitylatlngraw = orderType != 'delivery' && this.props.userLocalityCoords ? this.props.userLocalityCoords.split(',') : null;
		const userlatlngraw = orderType == 'delivery' && this.props.userLocationCoords ? this.props.userLocationCoords.split(',') : null;
		const userlatlng = userlatlngraw ? {latitude: userlatlngraw[0], longitude: userlatlngraw[1]} : null;
		const currentVendorsType = this.props.selectedVendorType;
		const currentUser = this.props.currentUser;
		const userLocality = orderType != 'delivery' ?  this.props.userLocality : '';
		let vendorTags = [];
		let deliveryVendors = [];

		/*Call delivery data*/
		Norsani.get('loadappdata', 'norsani', {vendortype: currentVendorsType, ordertype: orderType, customer: Object.keys(currentUser).length > 0 ? currentUser.user.email : null, locality: userLocality}).then((data) => {
			let readable_data = JSON.parse(data);
			if (readable_data && Object.keys(readable_data.vendors).length > 0) {
				noResultsMsg = orderType == 'delivery' ? i18n.t('HOME_LocationNotFound') : noResultsMsg;
				Promise.all(Object.keys(readable_data.vendors).map(async(key, index) => {
					let polygon = [];
					const vendor_obj = readable_data.vendors[key];
					const vendor_delivery_zone = vendor_obj.delivery_zone;
					const vendor_geo_address = vendor_obj.address_geo.split(',');
					vendor_delivery_zone.map((elem) => elem[0] != '' && elem[1] != '' ? polygon.push({latitude: elem[0], longitude: elem[1]}) : null);
					
					if (orderType == 'delivery' && userlatlngraw && isPointInPolygon(userlatlng, polygon)) {
						
						deliveryVendors.push(parseInt(key));
					
						/*Get the distance and duration*/
						await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+userlatlngraw[0]+','+userlatlngraw[1]+'&destinations='+vendor_geo_address[0]+','+vendor_geo_address[1]+'&key='+GOOGLEAPIKEY)
						.then((response) => response.json())
						.then((responseJson) => {
							if (responseJson.rows[0].elements.length > 0) {
								readable_data.vendors[key].distance = responseJson.rows[0].elements[0].distance.value;
								readable_data.vendors[key].duration = responseJson.rows[0].elements[0].duration.value;
							}
						})
						.catch((error) => {
							console.error(error);
						});
					
						/*Get the tags*/
						vendor_obj.vendorclass.map(elem => {vendorTags.push(elem)});
						
					} else if (orderType != 'delivery' && userlocalitylatlngraw) {
						/*Get the distance and duration*/
						await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+userlocalitylatlngraw[0]+','+userlocalitylatlngraw[1]+'&destinations='+vendor_geo_address[0]+','+vendor_geo_address[1]+'&key='+GOOGLEAPIKEY)
						.then((response) => response.json())
						.then((responseJson) => {
							if (responseJson.rows[0].elements.length > 0) {
								readable_data.vendors[key].distance = responseJson.rows[0].elements[0].distance.value;
							}
						})
						.catch((error) => {
							console.error(error);
						});						
					} else if (orderType == 'delivery') {
						delete readable_data.vendors[key];
					}
				})
				).then(() => {
					if (orderType == 'delivery') {
						const distinctVendorTags = [... new Set(vendorTags)];
						Promise.all(readable_data.vendors_tags = readable_data.vendors_tags.filter((elem, index) => distinctVendorTags.includes(elem.name))
						).then(() => {this.props.updateAppData(readable_data, deliveryVendors)})
					} else {
						this.props.updateAppData(readable_data, deliveryVendors);
					}
				});
			} else {
				this.props.updateAppData(readable_data, deliveryVendors);
			}
		}).catch(error => error.message ? Alert.alert(null,i18n.t('ConnectError')) : console.log(error));
	}
  
    render () {
		const appLoaded = this.props.appData;
		const currentVendorsType = this.props.selectedVendorType;
		const orderType = this.props.orderType;
		const nothingFoundMsg = noResultsMsg ? noResultsMsg : this.props.noResultsMsg

		if (this.props.navigation.getParam('openOrderCompleteModal') == true || this.state.showOptionsModal) {
			Animated.timing(this.state.showDarkBg, {toValue: .6, duration: 500, useNativeDriver: true,}).start();
		}
		
		if (orderType == 'delivery' && !this.props.userLocationSet) {
			return (
			<View style={styles.container}>
				{this._pageHeader()}
				<View style={styles.innerContainer}>
					<ScrollView
						contentContainerStyle={styles.mainScrollView}
					>
						{this._renderTitle()}
						<SvgCompass style={styles.noLocationIcon} width={80} height={80}/>
						<Text style={styles.noResultsText}>{i18n.t('HOME_AddLocationFirst')}</Text>
						<TouchableOpacity onPress={() => {this.props.navigation.navigate('MapModal')}} >
							<Text style={styles.addLocationBtn}><Feather style={styles.addLocationIcon} name='map-pin' />  {i18n.t('HOME_AddLocation')}</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
				
				{this.state.showOptionsModal? (
					<Animated.View style={{
						backgroundColor: '#000',
						opacity: this.state.showDarkBg,
						position: 'absolute',
						left: -2,
						top: -2,
						zIndex: 50,
						height: '105%',
						width: '105%',
					}} collapsable={false}/>
				) : null}
				<GeneralFilters show={this.state.showOptionsModal} navigation={this.props.navigation} hide={this._closeOptionsModal}/>
				<IosStatusBar/>
			</View>
			);
		}
		if (appLoaded.vendors && Object.keys(appLoaded.vendors).length > 0 && !this.props.updateData) {
			return (
			<View style={[styles.container, {
				backgroundColor: '#fff',
			}]}>
				{this._pageHeader()}
				<Animated.ScrollView
					ref={(c) => {this.scrollView = c}}
					scrollEventThrottle={1}
					bounces={false}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.mainScrollView}
					onScroll={Animated.event(
						[{nativeEvent: {contentOffset: {y: this.scroll}}}],
						{useNativeDriver: true, listener: this._scrollListener},
					)}
					overScrollMode="never"
				>
					{this._renderTitle()}
					<View style={styles.topSpace} collapsable={false} />
					<Coupons navigation={this.props.navigation} appData={appLoaded} />
					<RecommendedVendors navigation={this.props.navigation} appData={appLoaded} />
					<FeaturedVendors navigation={this.props.navigation} />
					<FeaturedProducts navigation={this.props.navigation} appData={appLoaded} />
					<VendorsTags navigation={this.props.navigation} tagsData={appLoaded.vendors_tags} />
					<SpecialProducts navigation={this.props.navigation} appData={appLoaded} />
					<VendorsList navigation={this.props.navigation} appData={appLoaded} activeVendorType={currentVendorsType}/>
				</Animated.ScrollView>
				
				<OrderThankYou navigation={this.props.navigation} show={this.props.navigation.getParam('openOrderCompleteModal')}/>
				{this.props.navigation.getParam('openOrderCompleteModal') == true || this.state.showOptionsModal? (
					<Animated.View style={{
						backgroundColor: '#000',
						opacity: this.state.showDarkBg,
						position: 'absolute',
						left: -2,
						top: -2,
						zIndex: 50,
						height: '105%',
						width: '105%',
					}} collapsable={false}/>
				) : null}
				<GeneralFilters show={this.state.showOptionsModal} navigation={this.props.navigation} hide={this._closeOptionsModal}/>
				<IosStatusBar/>
			</View>
			);
		} else {
			if (nothingFoundMsg && !this.props.updateData) {
				return (
				<View style={styles.container}>
					{this._pageHeader()}
					<View style={styles.innerContainer}>
						<ScrollView
							contentContainerStyle={styles.mainScrollView}
						>
							{this._renderTitle()}
							<Text style={styles.noResultsIconWrapper}><Feather name='info' style={styles.noResultsIcon}/></Text>
							<Text style={styles.noResultsText}>{nothingFoundMsg}</Text>
						</ScrollView>
					</View>
					
					{this.state.showOptionsModal? (
						<Animated.View style={{
							backgroundColor: '#000',
							opacity: this.state.showDarkBg,
							position: 'absolute',
							left: -2,
							top: -2,
							zIndex: 50,
							height: '105%',
							width: '105%',
						}} collapsable={false}/>
					) : null}
					<GeneralFilters show={this.state.showOptionsModal} navigation={this.props.navigation} hide={this._closeOptionsModal}/>
					<IosStatusBar/>
				</View>
				);
			} else {
				return (
				<View style={[styles.container, {
					backgroundColor: '#fff',
				}]}>
					{this._pageHeader()}
					<View style={styles.innerContainer}>
						<ScrollView
							contentContainerStyle={styles.mainScrollView}
						>
							{this._renderTitle()}
							<View style={styles.topSpace} collapsable={false} />
							<ContentLoader/>
						</ScrollView>
					</View>
					
					{this.state.showOptionsModal? (
						<Animated.View style={{
							backgroundColor: '#000',
							opacity: this.state.showDarkBg,
							position: 'absolute',
							left: -2,
							top: -2,
							zIndex: 50,
							height: '105%',
							width: '105%',
						}} collapsable={false}/>
					) : null}
					<GeneralFilters show={this.state.showOptionsModal} navigation={this.props.navigation} hide={this._closeOptionsModal}/>
					<IosStatusBar/>
				</View>
				);
			}
		}
    }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		backgroundColor: '#eeeeee',
	},
	innerContainer: {
		flex: 1,
	},
	noResultsIconWrapper: {
		textAlign: 'center',
		paddingTop: 36,
	},
	noResultsIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	noLocationIcon: {
		alignSelf: 'center',
		marginTop: 32,
	},
	noResultsText: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 24,
		color: '#1e1e1e',
		padding: 16,
		textAlign: 'center',
	},
	addLocationBtn: {
		borderRadius: 7,
		paddingLeft: 16,
		paddingRight: 16,
		height: 36,
		paddingTop: 8,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'center',
		alignSelf: 'center',
		overflow: 'hidden',
	},
	mainScrollView: {
		paddingTop: 56 + getStatusBarHeight(),
	},
	loadingContainer: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 100,
	},
	topSpace: {
		position: 'absolute',
		height: 132,
		width: '100%',
		top: 170 + getStatusBarHeight(),
		backgroundColor: '#eeeeee',
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
		overflow: 'hidden',
	},
	headerWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56 + getStatusBarHeight(),
		backgroundColor: '#eeeeee',
		paddingTop: getStatusBarHeight(),
		paddingLeft: 16,
		paddingRight: 16,
		width: "100%",
		position: "absolute",
		zIndex: 10,
	},
	headerLeft: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerWrapperTitle: {
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	headerIconStart: {		
		marginRight: 32,
	},
	headerIconLeft: {
		marginRight: 24,	
	},
	headerIcon: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	headerIconRight: {
		color: STATUSBARCOLOR,
	},
	headerRight: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
	},
	headerTitleWrapper: {
		backgroundColor: HOMEHEADINGCOLOR,
		width: '100%',
	},
	headerTitle: {
		fontSize: 32,
		fontFamily: 'Rubik-Bold',
		marginLeft: 16,
		marginRight: 16,
		height: 114,
		color: HOMEHEADINGTEXTCOLOR,
	},
});

const mapStateToProps = state => {
	return {
		appTitle: state.appTitle,
		selectedVendorType: state.selectedVendorType,
		localityOptions: state.localityOptions,
		currentUser: state.currentUser,
		appData: state.appData,
		userLocationSet: state.userLocationSet,
		userLocationCoords: state.userLocationCoords,
		userLocalityCoords: state.userLocalityCoords,
		orderType: state.orderType,
		userLocality: state.userLocality,
		updateData: state.updateData,
		noResultsMsg: state.noResultsMsg,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		updateAppData: (data, delivery_vendors) => dispatch({type: 'UPDATEAPPDATA', appdata: data, deliveryvendors: delivery_vendors}),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);