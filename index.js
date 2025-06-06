// /**
//  * @format
//  */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);
import { AppRegistry, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import PushNotification from "react-native-push-notification";
import App from "./App";
import { name as appName } from "./app.json";

// Configure Push Notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log(" Notification Received:", notification);
  },
  requestPermissions: Platform.OS === "ios",
});

// Handle Background Notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Notification Received:', remoteMessage);

  // Show Notification (with fixed title)
  PushNotification.localNotification({
    channelId: "15",  // This channel ID already exists
    title: "Notification",
    message: remoteMessage.notification.body,
    playSound: true,
    soundName: "default",
    vibrate: true,
  });
});

AppRegistry.registerComponent(appName, () => App);
