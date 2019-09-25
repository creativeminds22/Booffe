import React from 'react';
import { Animated, Modal, Text, Dimensions, StyleSheet, View, TouchableHighlight } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR, SECONDARYBUTTONSCOLOR, MODALBODYCOLOR } from '../config';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

export default class OrderThankYou extends React.Component {
	
	render() {
		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={this.props.show == true}
				onRequestClose={() => {
					this.props.navigation.setParams({ openOrderCompleteModal: false });
				}}
			>
				<View style={styles.modalBodyWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.setParams({ openOrderCompleteModal: false })}}>
						<View style={styles.separator}/>
					</TouchableHighlight>
					<View style={styles.modalBody}>
						<Text style={styles.titleIconWrapper}><Feather name='shopping-bag' style={styles.titleIcon}/></Text>
						<Text style={styles.title}>{i18n.t('ORDERTHANKYOU_OrderReceived')}</Text>
						<Text style={styles.subTitle}>{i18n.t('ORDERTHANKYOU_MSG')}</Text>
					</View>
				</View>
			</Modal>
		);
	}
}
const styles = StyleSheet.create({
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	separator: {
		height: modal_height(60),
	},
	modalBody: {
		flex: 1,
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	titleIconWrapper: {
		paddingTop: 16,
		textAlign: 'center',
	},
	titleIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	title: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 24,
		color: SECONDARYBUTTONSCOLOR,
		padding: 16,
		textAlign: 'center',
	},
	subTitle: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
		color: '#1e1e1e',
		textAlign: 'center',
	}
});
