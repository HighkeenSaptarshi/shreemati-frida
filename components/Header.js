import { Box, HStack, Image, Stack, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { baseColor, baseColorB, baseColorC, baseDarkColor, baseLightColor, darkColor, fontSemiBold, lightColor, MainStyle, rareColor, warningColor } from '../assets/MainStyle';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secretKey } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';


const HeaderComponents = ({ navigation, component, cartcount, openDialer, unreadCount }) => {
  const { t } = useTranslation();

  const [userId, SetUserId] = React.useState('');
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(val => {
      if (val != null) {
        var CryptoJS = require('crypto-js');
        const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(
          CryptoJS.enc.Utf8,
        );
        SetUserId(JSON.parse(decryptData).userCode);
        // SetNotificationCount(unreadCount);
      }
    });
  }, []);

  return (
    <HStack backgroundColor={baseLightColor} zIndex={999} alignItems="center" justifyContent="space-between" paddingX="5" paddingY="3">
      <HStack space={4} alignItems="center" justifyContent={'center'}>
        <HStack alignItems="center" justifyContent={'center'}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={24} color={darkColor} />
          </TouchableOpacity>
        </HStack>
        <Image source={require('../assets/images/SHREEMATI.png')} style={{ width: 90, height: 30, resizeMode: 'contain' }} />
      </HStack>
      <HStack space={2} alignItems="center">
        {(component == 'ProductDetails' || component == 'RewardsStore') && (
          <HStack alignItems="center" space={3} paddingRight={1}>
            {/* <TouchableOpacity onPress={() => navigation.navigate('Cart', { pageTitle: t("My Cart") })}>
              <Icon name="cart-outline" size={22} color={darkColor} />
              {cartcount > 0 && (
                <View style={{ position: 'absolute', backgroundColor: rareColor, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', top: -7, right: -7 }}>
                  <Text style={{ color: lightColor, lineHeight: 14, fontSize: 12, fontWeight: 'bold' }}>{cartcount}</Text>
                </View>
              )}
            </TouchableOpacity> */}
            {/* <TouchableOpacity onPress={() => navigation.navigate('Notification', { pageTitle: t("Notification") })}>
                <Icon name="notifications" size={22} color={rareColor} />
                <View style={{ position: 'absolute', backgroundColor: warningColor, borderRadius: 10, width: 15, height: 15, justifyContent: 'center', alignItems: 'center', top: -5, right: -5 }}>
                    <Text style={{ color: darkColor, fontSize: 10, lineHeight: 12, fontWeight: 'bold' }}>0</Text>
                </View>
            </TouchableOpacity> */}
          </HStack>
        )}
        <Image source={require('../assets/images/bannerBang.png')} style={{ width: 60, height: 30, resizeMode: 'contain' }} />
      </HStack>
    </HStack>
  );
};

export default HeaderComponents;
