/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Alert, AppState, AppStateStatus, BackHandler, LogBox, NativeModules, Platform, SafeAreaView } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee,{ AndroidImportance } from '@notifee/react-native';


import LoginScreen from './screens/Login';
import TermsConditionsScreen from './screens/TermsConditions';
import HomeScreen from './screens/Home';
import LeftMenuBarScreen from './screens/LeftMenuBar';
import RegistrationScreen from './screens/Registration';
import MyProfileScreen from './screens/MyProfile';
import ViewProfileScreen from './screens/ViewProfile';
import DealerInfoScreen from './screens/DealerInformation';
import AboutProgramScreen from './screens/AboutProgram';
import FAQScreen from './screens/FAQ';
import ContactUsScreen from './screens/Helpdesk';
import RewardsStoreScreen from './screens/RewardsStore';
import MyCartScreen from './screens/MyCart';
import AddressScreen from './screens/Address';
import ChangeLanguageScreen from './screens/ChangeLanguage';
import ProductDetailsScreen from './screens/ProductDetails';
import GalleryScreen from './screens/Gallery';
import GalleryDetailsScreen from './screens/GalleryDetails';
import RewardsCategoryScreen from './screens/RewardsCategory';
import AddAddressScreen from './screens/AddAddress';
import PerformanceScreen from './screens/Performance';
import ViewOrdersScreen from './screens/ViewOrder';
import MyPointsScreen from './screens/MyPoints';
import PointStatementScreen from './screens/PointStatement';
import TrackOrderScreen from './screens/TrackOrder';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const { SecurityServiceManager } = NativeModules;

const App = () => {

  const checkRootAndEmulator = async () => {
    try {
      let isRootedNative = await SecurityServiceManager.isDeviceRooted();
      let isEmulatorNative = await SecurityServiceManager.isEmulator();

      if (
        isRootedNative || isEmulatorNative
        //false
      ) {
        Alert.alert(
          'Security Alert',
          `The app cannot run on rooted devices or emulators.`,
          [{ text: 'OK', onPress: () => BackHandler.exitApp() }],
        );
        return;
      }
    } catch (error) {
      console.error('Error checking root or emulator status:', error);
    }
  };

  const createNotificationChannel = async () => {
    try {
      const channelId = await notifee.createChannel({
        id: "15",
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      if (channelId) {
        console.log("Notification Channel Created Successfully:", channelId);
      } else {
        console.log("Failed to Create Notification Channel");
      }
    } catch (error) {
      console.error("Error Creating Notification Channel:", error);
    }
  };

  const requestPermissionAndroid = async () => {

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      //Alert.alert('Permission Granted');
      getToken();
      createNotificationChannel();
    } else {
      //Alert.alert('Permission Denied');
    }

  };

  
  const getToken = async () => {
    const token = await messaging().getToken();
    console.log("Token", token);
  };

  useEffect(() => {
    requestPermissionAndroid();
  
    //  Handle foreground notifications
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.notification) {
        // Create a notification channel
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
  
        // Display the notification
        await notifee.displayNotification({
          title: remoteMessage.notification.title || 'Notification',
          body: remoteMessage.notification.body || '',
          android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
          },
        });
      }
    });
  
    // Handle notification click when app is in background
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.notification) {
        console.log(' Notification Clicked - Background');
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || ''
        );
      }
    });
  
    // Handle notification click when app was completely closed (killed)
    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.notification) {
        console.log(' Notification Clicked - Killed State');
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || ''
        );
      }
    });
  
  
    // Cleanup listeners to avoid memory leaks
    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  }, []);
  
  
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.notification) {
        Alert.alert('Notification!', remoteMessage.notification.body);
      }
    });

    return unsubscribe;
  }, []);



  useEffect(() => {
    checkRootAndEmulator();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkRootAndEmulator();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  });

  useEffect(() => {
    LogBox.ignoreLogs([
      'Animated: `useNativeDriver`',
      'Sending `onAnimatedValueUpdate` with no listeners registered.',
      'Please pass alt prop to Image component',
    ]);
  }, []);

  function MyStack() {
    return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen  name="TermsConditions" component={TermsConditionsScreen}/>
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OpenProfile" component={ViewProfileScreen} />
        <Stack.Screen name="DealerProfile" component={DealerInfoScreen} />
        <Stack.Screen name="AboutProgram" component={AboutProgramScreen} />
        <Stack.Screen name="Faq" component={FAQScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="RewardsCategory" component={RewardsCategoryScreen} />
        <Stack.Screen name="Rewards" component={RewardsStoreScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Cart" component={MyCartScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="GalleryDetails" component={GalleryDetailsScreen} />
        <Stack.Screen name="Performance" component={PerformanceScreen} />
        <Stack.Screen name="ViewOrder" component={ViewOrdersScreen} />
        <Stack.Screen name="PointStatement" component={PointStatementScreen} />
        <Stack.Screen name="MyPoints" component={MyPointsScreen} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Drawer.Navigator
          drawerContent={props => <LeftMenuBarScreen {...props} />}>
          <Drawer.Screen
            name="Welcome"
            options={{ headerShown: false, swipeEnabled: false }}
            component={MyStack}
          />
        </Drawer.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
