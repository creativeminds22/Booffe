import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import ListItemVendor from '../ListItemVendor';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

export class VendorsList extends React.Component {

	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;
		const vendor = vendors[item];

		return (
			<ListItemVendor vendor_id={item} vendor={vendor} navigation={this.props.navigation} />
		);
	}

	render () {
		const vendorIds = [];
		const vendors = this.props.appData.vendors;
		const activeVendorType = this.props.activeVendorType;

		for (const [key, vendor] of Object.entries(vendors)) {
			vendorIds.push(key);
		}

		if (vendorIds.length == 0) {
			return false;
		}
		
		return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{activeVendorType}</Text>
				<FlatList
					contentContainerStyle={styles.contentContainer}
					data={vendorIds}
					initialNumToRender={5}
					renderItem={this._renderItem}
					removeClippedSubviews={true}
					keyExtractor = { (item, index) => index.toString() }
					/>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	wrapper: {
		paddingBottom: 8,
		paddingTop: 8,
		backgroundColor: '#fff',
	},
	title: {
		marginTop: 8,
		marginLeft: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
		textAlign: 'left',
	}
});