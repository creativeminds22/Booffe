import React from 'react';
import { StyleSheet, View, Text, FlatList} from 'react-native';
import FeaturedItemVendor from '../FeaturedItemVendor';
import { connect } from 'react-redux';
import DiamondIcon from '../../assets/images/Diamond';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

class FeaturedVendors extends React.Component {
	
	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;
		const vendorsID = this.props.appData.featured_vendors.filter(elem => vendors[elem] != undefined);
		const vendor = vendors[item];
		
		return (
			<FeaturedItemVendor key={item} itemWidth={260} fullWidth={vendorsID.length > 1 ? false : true} vendor_id={item} vendor={vendor} navigation={this.props.navigation} />
		);
	}

    render () {
		const vendors = this.props.appData.vendors;
		const ActiveVendorType = this.props.selectedVendorType;
		const vendorsID = this.props.appData.featured_vendors.filter(elem => vendors[elem] != undefined);

		if (vendorsID.length == 0) {
			return false;
		}
		
        return (
			<View style={styles.wrapper}>
				<View style={styles.titleWrapper}>
					<DiamondIcon height={24} width={24} />
					<Text style={styles.title}>{i18n.t('FEATUREDVENDORS')}</Text>
				</View>
				<FlatList
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					removeClippedSubviews={true}
					data={vendorsID}
					renderItem={this._renderItem}
					keyExtractor = { (item, index) => index.toString() }
					/>
			</View>
        );
    }
}
const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		paddingBottom: 16,
		marginTop: 16,
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	titleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		marginLeft: 16,
	},
	title: {
		marginLeft: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	}
});

const mapStateToProps = state => {
	return {
		selectedVendorType: state.selectedVendorType,
		appData: state.appData,
	};
};

export default connect(mapStateToProps)(FeaturedVendors);