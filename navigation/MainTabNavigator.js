import React from 'react';
import { createBottomTabNavigator} from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack'

import SearchScreen from '../screens/SearchScreen';
import VendorScreen from '../screens/VendorScreen';
import VendorSearchScreen from '../screens/VendorSearchScreen';
import UserProfile from '../screens/UserProfile';
import OrdersScreen from '../screens/OrdersScreen';
import OrderScreen from '../screens/OrderScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import Home from '../screens/Home';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProductModalScreen from '../screens/ProductModalScreen';
import MapScreen from '../screens/MapScreen';
import VendorTagScreen from '../screens/VendorTagScreen';
import BottomNavigation from '../components/BottomNavigation';

const CartStack = createStackNavigator({
	Cart: CartScreen,
	CheckoutTab: CheckoutScreen,
	},
	{
		headerMode: 'none'
	}
);
const UserStack = createStackNavigator({
	User: UserProfile,
	Favorites: FavoritesScreen,
	Orders: OrdersScreen,
	Order: OrderScreen,
	},
	{
		headerMode: 'none'
	}
);

const SearchStack = createStackNavigator({
	Search: SearchScreen,
	VendorTag: VendorTagScreen,
	},
	{
		headerMode: 'none'
	}
);

const MainTabs = createBottomTabNavigator({
	Main: Home,
	SearchStack,
	CartStack,
	UserStack,
	},
	{
		tabBarComponent: props => <BottomNavigation {...props}/>,
		resetOnBlur: true,
	}
);

export default createStackNavigator({
	Main: MainTabs,
	ProductModal: ProductModalScreen,
	MapModal: MapScreen,
	Vendor: VendorScreen,
	VendorSearch: VendorSearchScreen,
	QuickCart: CartScreen,
	},
	{
		mode: 'card',
		headerMode: 'none',
	}
);