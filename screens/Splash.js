import React, {useEffect} from 'react';
import { Alert, BackHandler, Image, ImageBackground, StatusBar, StyleSheet } from 'react-native';
import { Button, NativeBaseProvider, Stack, Text, View, VStack } from 'native-base';
import {dangerColor, lightColor, MainStyle} from '../assets/MainStyle';
import {useTranslation} from 'react-i18next';

const SplashScreen = ({navigation}) => {
  const {t} = useTranslation();

  useEffect(() => {
    setTimeout(function () {
      navigation.replace('Login');
    }, 2800);
  }, []);

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" backgroundColor={lightColor} />
      <ImageBackground
        source={require('../assets/images/splash.gif')}
        imageStyle={{
          resizeMode: 'cover',
          position: 'absolute',
          bottom: 0,
          top: 0,
          opacity: 1,
        }}
        style={styles.bgimage}
      />
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  bgimage: {flex: 1, justifyContent: 'center'},
});

export default SplashScreen;
