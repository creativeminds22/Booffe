import React from 'react';
import { Animated, Modal, StyleSheet, Dimensions, ScrollView, View, TouchableHighlight, KeyboardAvoidingView, TimePickerAndroid, Picker, Platform, DatePickerIOS, Text, Alert, TextInput, Image } from 'react-native';
import { connect } from 'react-redux';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR } from '../config';
import { Loading } from '../components/Loading';
import Feather from 'react-native-vector-icons/Feather';
import Login from '../components/Login';
import { NavigationEvents } from 'react-navigation';
import PageHeader from '../components/PageHeader';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n, { rtl } from '../i18n/config';

let billingFormData = {};
let deliveryNote = null;
let paypalToken = null;

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

class CheckoutScreen extends React.Component {
	state = {
		checkoutOption: null,
		billingForm: {},
		checkoutComplete: false,
		pageLoaded: false,
		payWith: null,
		isProcessingCheckout: false,
		ordersPrepareTime: [],
		modalVisible: false,
		modalData: null,
		showDarkBg: new Animated.Value(0),
		iosPaymentMethodsModal: true,
		preparedOrdersData: [],
	}
	
	componentDidUpdate = (prevProps, prevState) => {
		if (this.state.payWith != null && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length == 0) {
			/*This is the first step when creating the order*/
			this._prepareOrders();
		}
		
		if (this.state.payWith == 'COD' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
			/*Process Cash on Delivery payment*/
			this._payCOD();
		}
	};
	
	_loadPage = () => {
		let cart_data = this.props.cartItemsData;

		/*Add to cart*/
		Norsani.post('getcheckoutform', 'norsani', {cartData: cart_data, coupons: this.props.coupons, orderType: this.props.orderType}).then((data) => {
			
			const returned_data = JSON.parse(data);
			
			if (returned_data.messages.length > 0) {
				Alert.alert('Checkout Errors', returned_data.messages.join(', '));
			}
			
			/*Save Braintree token if any*/
			if (returned_data.braintree_token) {
				paypalToken = returned_data.braintree_token;
			}
			
			/*Save coupons*/
			let validCoupons = [];
			if (returned_data.totals.coupons.length > 0) {
				returned_data.totals.coupons.map((elem, index) => {
					validCoupons.push(elem.code);
				});
			}
			
			/*save added data*/
			for (const [key, val] of Object.entries(cart_data)) {
				let cartdata = [];
			
				if (returned_data.added_data[key] == undefined) {
					delete cart_data[key];
					continue;
				}

				const vendor_items = returned_data.added_data[key].items;
				vendor_items.map(elem => {
					const founded_item_data = cart_data[key].items.find(cartItem => {
					
						if (cartItem.productID == elem.product_id && cartItem.variationID == elem.variation_id) {
							if (elem.variation_id > 0 && Object.keys(cartItem.variations).length > 0) {
								return Object.values(cartItem.variations).every(option => Object.values(elem.variation).includes(option));
							} else {
								return true;
							}
						}
						return false;
					});
					if (founded_item_data) {
						founded_item_data.data = elem.data;
						founded_item_data.qty = elem.quantity;
						founded_item_data.specialNotes = elem.item_comments ? elem.item_comments : null;
						founded_item_data.promotions = elem.applied_promotions ? elem.applied_promotions : [];
						founded_item_data.total = elem.line_total;
						founded_item_data.realPrice = elem.price;

						cartdata.push(founded_item_data);
					}	
				});
				cart_data[key].items = cartdata;
			}
			
			this.setState({billingForm: returned_data.billing_form}, () => this.props.saveCheckoutData(returned_data.totals, cart_data, returned_data.checkout_data, validCoupons));
		}).catch((error) => console.log(error))
	};
	
	_openModal = (modalState, data) => {
		if (modalState) {
			Animated.timing(this.state.showDarkBg, {toValue: .6, duration: 500, useNativeDriver: true,}).start();
		}
		this.setState({modalVisible: modalState, modalData: data});
	};
	
	_orderScheduleModal = (modalData) => {
		if (!modalData) {
			return false;
		}
		
		const vendorID = modalData.vendor;
		
		let order_date_values = timeData = [];
		const checkout_data = this.props.checkoutData.find(elem => elem.vendor_id == vendorID);
		const order_time_data = checkout_data.timing_options ? checkout_data.timing_options : null;
		if (order_time_data) {
			timeData = order_time_data.minimum_time.split(':');
			const {year, month, day} = new Date();
			const minIOSDate = new Date(year, month, day, timeData[0], timeData[1]);
			for (const [dateval, datelabel] of Object.entries(order_time_data.dates)) {
				order_date_values.push(<Picker.Item key={dateval} label={datelabel} value={dateval} />);
			}
		}
		const vendorOptions = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);

		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					this._openModal(!this.state.modalVisible, null)
				}} >
				<View style={styles.modalBodyWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this._openModal(!this.state.modalVisible, null)}}>
						<View style={styles.separator}/>
					</TouchableHighlight>
					<View style={styles.modalBody}>
						
						<Text style={styles.modalTitleText}>{i18n.t('CHECKOUT_SchedulePreparation')}</Text>
						
						<View style={styles.modalOptionsWrapper}>
							{Platform.OS === 'android' ? (
							<TouchableHighlight underlayColor='transparent' onPress={async () => {
								timeData = vendorOptions && vendorOptions.time ? vendorOptions.time.split(':') : timeData;
								try {
									const {action, hour, minute} = await TimePickerAndroid.open({
										hour: parseInt(timeData[0]),
										minute: parseInt(timeData[1]),
										is24Hour: false,
									});
									if (action !== TimePickerAndroid.dismissedAction) {
										const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
										let newVendorsOrdersTime = [];
										if (getVendorData) {
											const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
											getVendorData.time = hour+':'+minute;
											newVendorsOrdersTime = [...oldData, getVendorData];
										} else {
											newVendorsOrdersTime = [{vendor_id: vendorID, time: hour+':'+minute, date: Object.values(order_time_data.dates)[0]}];
										}
										this.setState({ordersPrepareTime: newVendorsOrdersTime});
									}
								} catch ({code, message}) {
									Alert.alert(null,i18n.t('CHECKOUT_CannotOpenTimePicker'));
								}
							}} >
								<View style={styles.modalSingleOption}>
									<Text><Feather name='watch' style={styles.modalOptionIcon}/></Text>
									<View style={styles.modalOptionValueWrapper}>
										{vendorOptions && vendorOptions.time ? (
											<Text style={styles.modalOptionValue}>{vendorOptions.time}</Text>
										) : (
											<Text style={styles.modalOptionValue}>{order_time_data.minimum_time}</Text>
										)}
										<Text style={styles.modalOptionBtn}>{i18n.t('CHECKOUT_Change')}</Text>
									</View>
								</View>
							</TouchableHighlight>
							) : (
							<View style={styles.modalSingleOption}>
								<Text><Feather name='watch' style={styles.modalOptionIcon}/></Text>
								<DatePickerIOS
									style={styles.modalOptionPicker}
									date={vendorOptions ? vendorOptions.time : minIOSDate}
									onDateChange={(newDate) => {
										const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
										let newVendorsOrdersTime = [];
										if (getVendorData) {
											const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
											getVendorData.time = newDate.getHours()+':'+newDate.getMinutes();
											newVendorsOrdersTime = [...oldData, getVendorData];
										} else {
											newVendorsOrdersTime = [{vendor_id: vendorID, time: newDate.getHours()+':'+newDate.getMinutes(), date: Object.values(order_time_data.dates)[0]}];
										}
										this.setState({ordersPrepareTime: newVendorsOrdersTime});
									}
									}
									mode='time'
									minimumDate={minIOSDate}
								/>
							</View>
							
							)}
							<View style={styles.modalSingleOption} >
								<Text><Feather name='calendar' style={styles.modalOptionIcon}/></Text>
								<Picker
									style={styles.modalOptionPicker}
									selectedValue={vendorOptions ? vendorOptions.date : null}
									onValueChange={(itemValue, itemIndex) => {
										const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
										let newVendorsOrdersTime = [];
										if (getVendorData) {
											const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
											getVendorData.date = itemValue;
											newVendorsOrdersTime = [...oldData, getVendorData];
										} else {
											newVendorsOrdersTime = [{vendor_id: vendorID, date: itemValue, time: order_time_data.minimum_time}];
										}
										this.setState({ordersPrepareTime: newVendorsOrdersTime});
									}}>
									{order_date_values}
								</Picker>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		)
	}
	
	_itemscontent = () => {
		const cart_data = [];
		if (this.props.checkoutData.length == 0) {
			return false;
		}
		
		for (const [key, val] of Object.entries(this.props.cartItemsData)) {
			let vendorSubTotal = 0;
			val.items.map((item, index) => {
				vendorSubTotal = item.total > 0 ? vendorSubTotal + (item.total) : vendorSubTotal + item.price;
			});
			const vendorData = this.props.appData.vendors[key];
			const checkout_data = this.props.checkoutData.find(elem => elem.vendor_id == key);
			const order_time_data = checkout_data.timing_options ? checkout_data.timing_options : null;
			const vendorOptions = this.state.ordersPrepareTime.find(elem => elem.vendor_id == key);
			
			cart_data.push(
			<View key={key} style={styles.singleVendor}>
				<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('Vendor', {vendorid: key})}}>
					<View style={styles.vendorNameWrapper}>
						{vendorData.logo ? (
							<Image style={styles.vendorLogo} source={{ uri: vendorData.logo }}/>
						) : null}
						<View style={styles.vendorAddressWrapper}>
							<Text style={styles.vendorName}>{vendorData.name}</Text>
							<Text style={styles.vendorAddress} numberOfLines={1}>{vendorData.address}</Text>
						</View>
					</View>
				</TouchableHighlight>
				<View style={styles.itemsTotalWrapper}>
					<Text style={styles.itemsTotalTitle} >{val.items.length} {val.items.length > 1 ? <Text>{i18n.t('CHECKOUT_Items')}</Text> : <Text>{i18n.t('CHECKOUT_Item')}</Text>}</Text>
					
					<View style={styles.itemsTotalValueWrapper}>
						<Text style={styles.itemsTotalValue} >{APPCURRENCY}{i18n.toNumber(vendorSubTotal, {precision: 3, strip_insignificant_zeros: true})}</Text>
						{parseFloat(checkout_data.total_delivery) > 0 ? (
						<Text style={styles.itemsTotalSubValue}>+ {APPCURRENCY}{i18n.toNumber(parseFloat(checkout_data.total_delivery), {precision: 3, strip_insignificant_zeros: true})} {i18n.t('CHECKOUT_DeliveryFee')}</Text>
						) : null}
						{checkout_data.total_delivery != 'N/A' && parseFloat(checkout_data.total_delivery) == 0 || checkout_data.total_delivery != 'N/A' && !parseFloat(checkout_data.total_delivery) ? (
						<Text style={styles.itemsTotalSubValue}>{checkout_data.total_delivery}</Text>
						) : null}

					</View>

				</View>
				
				{order_time_data ? (
				<View style={styles.orderPrepareDateWrapper} >
					<View style={styles.orderPrepareTitleWrapper}>
						{checkout_data.timing_options.time_instructions.length > 0 ? (
						<TouchableHighlight underlayColor='transparent' onPress={() => {Alert.alert(null,String(checkout_data.timing_options.time_instructions))}}>
							<Text style={styles.orderPrepareTitle}>{i18n.t('CHECKOUT_PrepareAt')} <Feather style={styles.orderPrepareDateValueIcon} name='info'/></Text>
						</TouchableHighlight>
						) : (
							<Text style={styles.orderPrepareTitle}>{i18n.t('CHECKOUT_PrepareAt')}</Text>
						)}
					</View>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this._openModal(!this.state.modalVisible, {vendor: key})}}>
						<View style={styles.orderPrepareDate}>
							<Text><Feather style={styles.orderPrepareDateValueIcon} name='edit'/></Text>
							<Text style={styles.orderPrepareDateValue}>{vendorOptions ? vendorOptions.time : order_time_data.minimum_time}, {vendorOptions ? vendorOptions.date : Object.values(order_time_data.dates)[0]}</Text>
						</View>
					</TouchableHighlight>
				</View>
				) : null}
			</View>
			)
		}
		return cart_data;
	};
	
	_payCOD = () => {
		
		/*Since this is a cash on delivery payment and no online payment needs handling, we directly process with creating the order.*/
		this._createOrders();
	};
	
	_prepareOrders = async () => {
		const user_location = this.props.orderType == 'delivery' ? this.props.userLocation : null;
		const user_location_geo = this.props.orderType == 'delivery' ? this.props.userLocationCoords : null;
		const cart_data = this.props.cartItemsData;
		const billingFormFields = this.state.billingForm;
		let ordersCreated = [];
		
		/*First vaidate the billing form*/
		for (const [key, val] of Object.entries(billingFormFields)) {
			if (!billingFormData[key]) {
				Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_MissingRequiredField',{field: val.label}));
				this.setState({isProcessingCheckout: false});
				return false;
			}
		}
		/*Check if user has provided a valid email address*/
		const emailCheckEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!emailCheckEx.test(billingFormData.billing_email)) {
			Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_EnterValidEmail'));
			this.setState({isProcessingCheckout: false});
			return false;
		}
		
		/*Billing form is ok, lets process*/
		Promise.all([
		await Norsani.post('verifycheckout', 'norsani', {cartData: cart_data, orderType: this.props.orderType, ordertimings: this.state.ordersPrepareTime, coupons: this.props.coupons, billingForm: billingFormData, paymentMethod: 'cod', customerNote: deliveryNote, userLocation: user_location, userLocationGeo: user_location_geo}).then(async (data) => {
			const returned_data = JSON.parse(data);
			
			if (returned_data.messages && returned_data.messages.length > 0) {
				Alert.alert(i18n.t('CHECKOUT_CheckoutNotDone'), returned_data.messages.join(', '));
				return false;
			}
			
			/*Check if login is required for checkout first create an account for the user*/
			if (this.props.checkoutData.login_required) {
				
				var customerInfo = {
					email: billingFormData.billing_email,
					first_name: billingFormData.billing_first_name,
					last_name: billingFormData.billing_last_name,
				};

				await Norsani.post('customers', 'wc', customerInfo).then(async (data) => {
					/*Create order*/
					await Norsani.post('orders/batch', 'wc', returned_data).then((data) => {
						if (data.create && data.create.length > 0){
							/*Order was created*/
							ordersCreated = data.create.map(singleOrder => ({id: singleOrder.id, status: 'processing', set_paid: true}));
						}
					}).catch(error => {Alert.alert(i18n.t('Error'),i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error)});
				}).catch(error => {Alert.alert(i18n.t('Error'),i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error)});
			
			} else {
			
				/*Create order*/
				await Norsani.post('orders/batch', 'wc', returned_data).then((data) => {
					if (data.create && data.create.length > 0) {
						/*Order was created*/
						ordersCreated = data.create.map(singleOrder => ({id: singleOrder.id, status: 'processing', set_paid: true}));
					}
				}).catch(error => {Alert.alert(i18n.t('Error'),i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error)});
			}
			
		}).catch(error => {Alert.alert(i18n.t('Error'),i18n.t('CouldNotConnectToServer')); console.log(error)})
		
		]).then(() => {
			
			if (ordersCreated.length > 0) {

				this.setState({preparedOrdersData: ordersCreated});
			
			} else {
				
				this.setState({payWith: null, isProcessingCheckout: false});
			}
		});
	};
	
	_createOrders = () => {
		
		if (this.state.preparedOrdersData.length == 0) {
			return false;
		}
		
		/*This is the final step of checkout process*/
		Norsani.post('orders/batch', 'wc', {update: this.state.preparedOrdersData}).then((data) => {
			if (data.update && data.update.length > 0) {
				this.setState({checkoutComplete: true, isProcessingCheckout: false}, () => {
					this.props.saveCart();
					setTimeout(() => {this.props.navigation.navigate('Main', {openOrderCompleteModal: true})}, 500);
				});
			}
		}).catch(error => {Alert.alert(i18n.t('Error'),i18n.t('CHECKOUT_OrderNotCompleted')); console.log(error)});
		
	}
	
	_renderPaymentMethod = () => {
		const selectedPaymentMethod = this.state.checkoutOption;
		switch (selectedPaymentMethod) {
			case 'cod':
			return (
				<TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({payWith: 'COD', isProcessingCheckout: true});}}>
					<Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>
				</TouchableHighlight>
			);
		}
	};
	
	_renderPaymentsOptions = () => {
		let options = [];
		
		options.push(<Picker.Item key={0} label={i18n.t("CHECKOUT_SelectPaymentMethod")} value={null} />);
		
		//if (this.props.orderType == 'delivery') {
			options.push(<Picker.Item key={1} label={i18n.t("CHECKOUT_CashOnDelivery")} value="cod" />);		
		//}
		
		return (
			<Picker
				style={styles.paymentMethodsPicker}
				selectedValue={this.state.checkoutOption}
				onValueChange={(itemValue, itemIndex) => {
					this.setState({checkoutOption: itemValue});
				}}>
				{options}
			</Picker>
		)
	};
	
	_outputTotals = (totals) => {
		if (Object.keys(totals).length > 0) {
			const coupons = totals.coupons.map((elem, index) => (
				<View key={index} style={styles.checkoutTotalItem}>
					<Text style={styles.checkoutTotalItemTitle}>{elem.name}</Text>
					<Text style={styles.checkoutTotalItemValue}>{APPCURRENCY}{i18n.toNumber(elem.amount, {precision: 3, strip_insignificant_zeros: true})}</Text>
				</View>
				));
			const fees = totals.fees.map((elem, index) => <View style={styles.checkoutTotalItem} key={index}><Text style={styles.checkoutTotalItemTitle}>{elem.name}</Text><Text style={styles.checkoutTotalItemValue}>{APPCURRENCY}{i18n.toNumber(elem.fee, {precision: 3, strip_insignificant_zeros: true})}</Text></View>);
			const taxes = totals.taxes.map((elem, index) => <View style={styles.checkoutTotalItem} key={index}><Text style={styles.checkoutTotalItemTitle}>{elem.name}</Text><Text style={styles.checkoutTotalItemValue}>{APPCURRENCY}{i18n.toNumber(elem.amount, {precision: 3, strip_insignificant_zeros: true})}</Text></View>);
			return (
				<View style={styles.checkoutTotalWrapper}>
					<View style={styles.checkoutTotalItem}>
						<Text style={styles.checkoutTotalItemTitle}>{i18n.t('CART_SubTotal')}</Text>
						<View style={styles.checkoutTotalItemValueWrapper}>
							<Text style={styles.checkoutTotalItemValue}>{APPCURRENCY}{i18n.toNumber(totals.sub_total, {precision: 3, strip_insignificant_zeros: true})}</Text>
							{totals.sub_total_info ? (
								<Text style={styles.checkoutTotalItemValueInfo}>{totals.sub_total_info}</Text>
							) : null}
						</View>
					</View>
					{coupons}
					{fees}
					{taxes}
					<View style={styles.checkoutTotalItem}>
						<Text style={styles.checkoutTotalItemTitle}>{i18n.t('CART_Total')}</Text>
						<View style={styles.checkoutTotalItemValueWrapper}>
							<Text style={styles.checkoutTotalItemValue}>{APPCURRENCY}{i18n.toNumber(totals.total, {precision: 3, strip_insignificant_zeros: true})}</Text>
							{totals.total_info ? (
								<Text style={styles.checkoutTotalItemValueInfo}>{totals.total_info}</Text>
							) : null}
						</View>
					</View>
				</View>
			)
		}
	};
	
	_billingForm = () => {
		const billingform = this.state.billingForm;
		let billingformOutput = [];
		
		if (Object.keys(billingform).length == 0) {
			return false;
		}
		
		for (const [key, val] of Object.entries(billingform)) {
			let keyboardtype = 'default';
			let textcontenttype = 'none';
			let defaultvalue = null;
			const userdata = this.props.currentUser;
			const loggedinwith = this.props.loggedInWith;
			
			if (key == 'billing_email') {
				keyboardtype = 'email-address';
				textcontenttype = 'emailAddress';
			} else if (key == 'billing_phone') {
				keyboardtype = 'phone-pad';
				textcontenttype = 'telephoneNumber';
			}

			if (Object.keys(userdata).length > 0) {
				if (loggedinwith == 'google') {
					const username = userdata.user.name.split(' ');
					
					if (key == 'billing_email') {
						defaultvalue = userdata.user.email ? userdata.user.email : null;
						billingFormData.billing_email = userdata.user.email ? userdata.user.email : null;
					} else if(key == 'billing_first_name' && userdata.user.name && userdata.user.name != 'null') {
						defaultvalue = username[0];
						billingFormData.billing_first_name = username[0];
					} else if(key == 'billing_last_name' && userdata.user.name && userdata.user.name != 'null' && username.length > 1) {
						defaultvalue = username[1];
						billingFormData.billing_last_name = username[1];
					}
				}
			}
			
			{loggedinwith && key == 'billing_email' ? null : (
			billingformOutput.push((
				<View key={key} style={styles.formGroup}>
					<TextInput underlineColorAndroid='transparent' placeholder={val.label} style={styles.formInput} keyboardType={keyboardtype} textContentType={textcontenttype} defaultValue={defaultvalue} onEndEditing={(e) => {e.nativeEvent.text.length > 0 ? billingFormData[key] = e.nativeEvent.text : billingFormData[key] = null}} />
				</View>
			))
			)}
		}
		return billingformOutput;
	};
	
	render() {

		if (Object.keys(this.state.billingForm).length == 0 || this.props.updateCheckout) {
			this._loadPage();
			return (
				<View style={styles.container}>
					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />
					<Loading />
				</View>
			)
		} else if (this.props.checkoutData.login_required && !this.props.loggedInWith) {
			return (
				<View style={styles.container}>
					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />
					<Login/>
				</View>
			)
		} else {
			return (
				<View style={styles.container}>
				
					{this._orderScheduleModal(this.state.modalData)}
					
					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />

					<ScrollView>
						
						<KeyboardAvoidingView behavior="padding" enabled>
						
							<View style={styles.billingFormWrapper}>
								<Text style={styles.billingFormTitle}>{i18n.t('CHECKOUT_BillingDetails')}</Text>
								{this._billingForm()}
							</View>

							{this._itemscontent()}
							
							{this.props.orderType == 'delivery' ? (
								<View style={styles.deliveryNotesWrapper}>
									<Text style={styles.deliveryNotesTitle}>{i18n.t('CHECKOUT_OrderDeliveryInfo', {info: this.props.userLocation})}</Text>
									<TextInput style={styles.deliveryNotesInput} numberOfLines={2} placeholder={i18n.t('CHECKOUT_SpecialNotesForDelivery')} onEndEditing={(e) => {deliveryNote = e.nativeEvent.text}} />
								</View>
							) : null}
						</KeyboardAvoidingView>
						
						{this._outputTotals(this.props.totals)}
						
						<View style={styles.paymentMethodsWrapper}>
							<View style={styles.paymentMethodsPickerWrapper}>
								<Text style={styles.paymentMethodsTitle}>{i18n.t('CHECKOUT_PaymentMethod')}</Text>
								
								{Platform.OS === "ios" ? (
									<TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({iosPaymentMethodsModal: true})}}>
										{this.state.checkoutOption ? (
										<Text style={styles.iosPickerBtn}>{this.state.checkoutOption}</Text>
										) : (
										<Text style={styles.iosPickerBtn}>{i18n.t('CHECKOUT_SelectPaymentMethod')}</Text>
										)}
									</TouchableHighlight>
								) : this._renderPaymentsOptions()}
								
							</View>
							{this._renderPaymentMethod()}
						</View>
					</ScrollView>
					
					{this.state.modalVisible ? (
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
				
					{this.state.isProcessingCheckout ? <Loading /> : null}
					
					{Platform.OS === "ios" && this.state.iosPaymentMethodsModal ? (
					<Modal visible={true} transparent={true}>
						<View style={styles.iosPaymentSelectModal}>
							<View style={styles.iosPaymentSelectModalInner}>
								{this._renderPaymentsOptions()}
								<View style={styles.dismissModalBtn}>
									<TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({iosPaymentMethodsModal: false})}}>
										<Text style={styles.iosModalDoneText}>{i18n.t('CHECKOUT_Done')}</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					</Modal>
					) : null}
				</View>
			)
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: Platform.OS === "ios" ? getStatusBarHeight() : 0,
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
	modalTitleText: {
		height: 56,
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 20,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	modalOptionsWrapper: {
		flex: 1,
		paddingBottom: 16,
	},
	modalSingleOption: {
		paddingTop: 16,
		paddingLeft: 16,
		paddingRight: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	modalOptionIcon: {
		fontSize: 16,
		color: '#1e1e1e',
	},
	modalOptionValueWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 36,
	},
	modalOptionValue: {
		fontSize: 16,
		color: '#1e1e1e',
		marginLeft: 16,
		fontFamily: APPFONTMEDIUM,
	},
	modalOptionBtn: {
		flex: 1,
		textAlign: 'right',
		fontSize: 14,
		color: SECONDARYBUTTONSCOLOR,
		fontFamily: APPFONTMEDIUM,
		textTransform: 'uppercase',
	},
	modalOptionPicker: {
		width: '90%',
		padding: 0,
		marginLeft: 8,
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	billingFormTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
	},
	formGroup: {
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
	},
	formInput: {
		height: 56,
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 7,
		backgroundColor: '#f1f1f1',
		width: '100%',
		overflow: 'hidden',
		textAlign: 'left',
	},
	deliveryNotesWrapper: {
		margin: 16,
	},
	deliveryNotesTitle: {
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 14,
		marginBottom: 12,
	},
	deliveryNotesInput: {
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#f1f1f1',
		height: 80,
	},
	singleVendor: {
		marginLeft: 16,
		marginTop: 16,
		paddingRight: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	vendorNameWrapper: {
		marginTop: 16,
		marginRight: 16,
		marginBottom: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendorLogo: {
		height: 40,
		width: 40,
		marginRight: 12,
		borderRadius: 20,
		overflow: 'hidden',
	},
	vendorAddressWrapper: {
		flex: 1,
		overflow: 'hidden'
	},
	vendorName: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	vendorAddress: {
		color: '#666',
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	itemsTotalWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	itemsTotalTitle: {
		flex: 1,
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	itemsTotalValue: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'right',
	},
	itemsTotalSubValue: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 12,
		fontFamily: APPFONTREGULAR,
	},
	orderPrepareDateWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	orderPrepareTitleWrapper: {
		flex: 1,
	},
	orderPrepareTitle: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	orderPrepareDate: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	orderPrepareDateValue: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	orderPrepareDateValueIcon: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 16,
	},
	checkoutTotalWrapper: {
		marginLeft: 16,
		paddingRight: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	checkoutTotalItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 16,
	},
	checkoutTotalItemTitle: {
		flex: 2,		
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	checkoutTotalItemValue: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'right',
	},
	checkoutTotalItemValueInfo: {
		fontSize: 12,
		color: PRIMARYBUTTONCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	paymentMethodsWrapper: {
		paddingRight: 16,
		marginLeft: 16,
		marginTop: 16,
		paddingTop: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',	
	},
	paymentMethodsTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	paymentMethodsPicker: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		width: '100%',
		overflow: 'hidden',
    },
	createOrderBtn: {
		borderRadius: 10,
		paddingLeft: 16,
		paddingRight: 16,
		height: 40,
		paddingTop: 12,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		overflow: 'hidden',
		textTransform: 'capitalize',
	},
	iosPaymentSelectModal: {
		display: "flex",
		backgroundColor: "rgba(0, 0, 0, 0.35)",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%"
	},
	iosPaymentSelectModalInner: {
		backgroundColor: "#fff",
		width: "80%",
		borderRadius: 7,
		overflow: 'hidden',
	},
	iosModalDoneText: {
		marginTop: 16,
		fontSize: 16,
		padding: 16,
		width: '100%',
		textAlign: 'center',
		textTransform: 'uppercase',
		color: SECONDARYBUTTONSCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	iosPickerBtn: {
		fontSize: 14,
		textTransform: 'uppercase',
		fontFamily: APPFONTMEDIUM,
		color: SECONDARYBUTTONSCOLOR,
		paddingBottom: 16,
	}
});

const mapStateToProps = state => {
	return {
		checkoutData: state.checkoutData,
		cartItemsData: state.cartItemsData,
		totals: state.cartTotals,
		coupons: state.coupons,
		currentUser: state.currentUser,
		loggedInWith: state.loggedInWith,
		appData: state.appData,
		userLocation: state.userLocation,
		userLocationCoords: state.userLocationCoords,
		updateCheckout: state.updateCheckout,
		orderType: state.orderType,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveCheckoutData: (totals, cart_data, checkout_data, coupons_data) => dispatch({type: 'CHECKOUTDATA', total: totals, cartitemsdata: cart_data, checkoutdata: checkout_data, coupons: coupons_data}),
		saveCart: () => dispatch({type: 'SAVECART',  coupons: []})
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen);