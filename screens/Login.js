import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import LinearGradient from 'react-native-linear-gradient';
import { Alert, Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Image, Keyboard, Linking, Pressable, Dimensions, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, hashKey, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor } from '../assets/MainStyle';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';
import Events from '../auth_provider/Events';
import messaging from '@react-native-firebase/messaging';
import CRC32 from 'crc-32';
import apiClient from '../api/apiClient';
import i18n from '../assets/language/i18n';
import { ImageBackground } from 'react-native';

const LoginScreen = ({ navigation, route }) => {

  const { width, height } = useWindowDimensions();

  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [currentLanguage, setLanguage] = React.useState('Eng');
  const [forOTP, setForOTP] = React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [otpValue, setOtpValue] = React.useState('');

  const [isAccept, setIsAccept] = React.useState(false);

  const [versionFound, setVersionFound] = React.useState(false);
  const [storeUrl, setStoreUrl] = React.useState('');

  const [foundEmulator, setFoundEmulator] = React.useState(false);
  const [deviceToken, setDeviceToken] = React.useState('');
  const regexNum = /^[6-9]\d{9}$/;

  useEffect(() => {
    const getToken = async () => {
      const token = await messaging().getToken();
      setDeviceToken(token);
    };
    getToken();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      let formdata = new FormData();
      formdata.append('lang_code', currentLanguage);
      formdata.append('app_ver', `${APP_VERSION}`);
      formdata.append('os_type', `${OS_TYPE}`);
      apiClient
        .post(`${BASE_URL}/app-version-check`, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
            accesstoken: `${AccessToken}`,
          },
        })
        .then(response => {
          return response;
        })
        .then(responseJson => {
          setLoading(false);
          if (responseJson.data.bstatus == 1) {

            //console.log('verssion Check:', responseJson);
            if (responseJson.data.version_details.update_available == 0) {
              AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                  navigation.replace('Home');
                }
              });
            } else {
              setLoading(false);
              AsyncStorage.clear();
              setStoreUrl(responseJson.data.version_details.store_url);
              setVersionFound(true);
            }
          }
        })
        .catch(error => {
          //console.log('INSIDE CATCH', error);
          setLoading(false);
          if (error.toString().includes('Network request failed')) {
            Alert.alert(
              'Secure connection error or network issue! Please try again later.',
            );
          } else {
            //console.log('Error:', error);
            navigation.replace('Splash');
            BackHandler.exitApp();
          }
        });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      AsyncStorage.getItem('language').then(val => {
        console.log("language: ", val);
        if (val != null) {
          setLanguage(val);
          i18n
            .changeLanguage(val)
            .then(() => console.log(val))
            .catch(err => console.log(err));
        } else {
          onSaveLang(currentLanguage);
        }
      });
    });
    return unsubscribe;
  }, []);

  const onSaveLang = (val) => {
    setLanguage(val);
    AsyncStorage.setItem('language', val);
    i18n
      .changeLanguage(val)
      .then(() => setLoading(true))
      .catch(err => console.log(err));
    setTimeout(function () {
      setLoading(false);
    }, 500);
  };

  const onContinueForVerssion = () => {
    Linking.openURL(storeUrl);
  };

  const onGoBack = () => {
    setForOTP(false);
    setMobileNumber("");
    setIsAccept(false);
  }

  const sendOtp = () => {
    Keyboard.dismiss();
    if (mobileNumber.trim() == '') {
      Toast.show(t('Please enter Mobile Number'), Toast.LONG);
    } else if (mobileNumber.length < 10) {
      Toast.show(t('Please enter 10 digit for Phone Number'), Toast.LONG);
    } else if (mobileNumber != '' && !regexNum.test(mobileNumber)) {
      Toast.show(t('Mobile Number accept Only Number / Mobile No. not Valid'), Toast.LONG);
    } else if (!isAccept) {
      Toast.show(t('Please Accept Terms & Conditions & Privacy Policies'), Toast.LONG);
    } else {
      setLoading(true);
      let formdata = new FormData();
      formdata.append('mobileNumber', mobileNumber);
      formdata.append('lang_code', currentLanguage);
      formdata.append('userType', "Dealerspouse");
      apiClient
        .post(`${BASE_URL}/login/get-otp`, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
            accesstoken: `${AccessToken}`,
          },
        }).then(response => {
          console.log('RESSS: ', response);
          return response;
        })
        .then(responseJson => {
          setLoading(false);
          console.log('responseJson: ', responseJson.data);
          Toast.show(responseJson.data.message, Toast.LONG);
          if (responseJson.data.bstatus == 1) {
            setForOTP(true);
          }
        })
        .catch(error => {
          //console.log('error', error);
          Toast.show(t("Secure connection error or network issue! Please try again later."), Toast.LONG);
        });
    }
  };

  const onVerify = () => {
    Keyboard.dismiss();
    if (otpValue == '') {
      Toast.show(t('Please enter OTP Number'), Toast.LONG);
    } else {
      setLoading(true);
      let formdata = new FormData();
      formdata.append('mobileNumber', mobileNumber);
      formdata.append('otp', otpValue);
      formdata.append('os_type', `${OS_TYPE}`);
      formdata.append('os_version', `${APP_VERSION}`);
      formdata.append('lang_code', currentLanguage);
      formdata.append('device_token', deviceToken);
      apiClient
        .post(`${BASE_URL}/login/verify-otp`, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
            accesstoken: `${AccessToken}`,
          },
        })
        .then(response => {
          console.log('RESSS:: ', response);
          return response;
        })
        .then(responseJson => {
          console.log('responseJson:: ', responseJson);
          var serverHash = responseJson.headers['x-hash-value'];
          const checksum = CRC32.str(hashKey);
          const finalChecksum = (checksum >>> 0).toString(16).padStart(8, '0');
          if (serverHash === finalChecksum) {
            if (responseJson.data.bstatus == 1) {
              Toast.show(responseJson.data.message, Toast.LONG);
              setForOTP(false);
              getUserData(responseJson.data.token);
              Events.publish('token', responseJson.data.token);
              setMobileNumber('');
            } else {
              Toast.show(responseJson.data.message, Toast.LONG);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          setLoading(false);
          //console.log('login Error:', error);
          navigation.replace('Splash');
          BackHandler.exitApp();
        });
    }
  };

  const getUserData = (token) => {
    apiClient
      .post(`${BASE_URL}/get-user-after-login-info`, "", {
        headers: {
          'Content-Type': 'multipart/form-data',
          accesstoken: `${AccessToken}`,
          Useraccesstoken: token
        },
      })
      .then(response => {
        console.log('RESSS:: ', response);
        return response;
      })
      .then(responseJson => {
        console.log('get-user:: ', responseJson);
        setLoading(false);
        if (responseJson.data.bstatus === 1) {
          if (responseJson.data.registration_completed == 1) {
            var CryptoJS = require('crypto-js');
            var encryptedData = CryptoJS.AES.encrypt(
              JSON.stringify(responseJson.data),
              secretKey,
            ).toString();
            AsyncStorage.setItem('userToken', encryptedData);
            navigation.replace('Home');
          } else {
            var CryptoJS = require('crypto-js');
            var encryptedData = CryptoJS.AES.encrypt(
              JSON.stringify(responseJson.data),
              secretKey,
            ).toString();
            navigation.replace('Registration', { registerUserToken: encryptedData });
          }
        } else {
          Toast.show(responseJson.data.message, Toast.LONG);
        }
      })
      .catch(error => {
        setLoading(false);
        console.log('get-user Error:', error);
      });
  };

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="light-content" backgroundColor={rareColor} />
      <LinearGradient
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        colors={[baseColor, rareColor]}
        flex={1}
        style={{ padding: 10, position: 'relative' }}
      >
        <Image source={require('../assets/images/header-round.png')} style={{ width: 140, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: 5 }} />
        <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
        {/* <Image source={require('../assets/images/mehndi.png')} style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', resizeMode: 'contain' }} /> */}

        <VStack flex={1} paddingX={3} justifyContent={'center'} alignItems={'center'}>
          {/* <VStack>
            <Text color={lightColor} fontFamily={fontBold} fontSize="28" letterSpacing={4} textAlign="center">SHREEMATI</Text>
            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="md" letterSpacing={2} textAlign="center">Silahkan masuk ke akun anda</Text>
          </VStack> */}
          <Image source={require('../assets/images/girls.png')} style={{ width: '100%', height: 310, resizeMode: 'contain', position: 'relative' }} />
          <Image source={require('../assets/images/Ellipse.png')} style={{ width: '100%', height: 38, resizeMode: 'cover', position: 'relative', marginTop: -40 }} />
          <VStack space={5} paddingX={5} marginTop={-1} paddingBottom={5} marginBottom={3} backgroundColor={baseLightColor} borderBottomRadius={20} width={'100%'}>
            <Image
              source={require('../assets/images/SHREEMATI.png')}
              style={{
                height: 70,
                width: 160,
                resizeMode: 'contain',
                alignSelf: 'center',
                marginTop: -8
              }}
            />
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
              <Text color={darkColor} fontFamily={fontBold} fontSize="lg">{t('Please Signin to your account')}</Text>
              <Stack space={3} marginTop={3}>
                <View>
                  <Text style={MainStyle.lable} fontSize="xs">{t('Language')} <Text color={dangerColor}>*</Text></Text>
                  <View style={MainStyle.inputbox}>
                    <Select variant="unstyled" size="md" height={43} selectedValue={currentLanguage} onValueChange={value => onSaveLang(value)} style={{ paddingLeft: 15 }} fontFamily={fontRegular}
                      dropdownCloseIcon={<Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />}
                      dropdownOpenIcon={<Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />}
                      _selectedItem={{
                        backgroundColor: greyColor,
                        endIcon: (<Icon name="checkmark-circle" size={20} color={successColor} style={{ right: 0, position: 'absolute' }} />
                        )
                      }}>
                      <Select.Item label="English" value="Eng" />
                      <Select.Item label="Hindi" value="Hn" />
                      <Select.Item label="Bengali" value="Bn" />
                      <Select.Item label="Telugu" value="Te" />
                      <Select.Item label="Tamil" value="Ta" />
                      <Select.Item label="Malayalam" value="Ml" />
                      <Select.Item label="Kannada" value="Kn" />
                    </Select>
                  </View>
                </View>
                <View>
                  <Text style={MainStyle.lable} fontSize="xs">{t('Mobile No')}. <Text color={dangerColor}>*</Text>
                  </Text>
                  <View style={MainStyle.inputbox}>
                    {!forOTP ? (
                      <Input height={43} fontFamily={fontRegular} size="md" variant="unstyled" keyboardType="number-pad" maxLength={10} onChangeText={text => setMobileNumber(text)} placeholder={t('Please Enter Mobile Number')} />
                    ) : (
                      <Input height={43} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" value={mobileNumber} readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                    )}
                  </View>
                </View>
                {forOTP && (
                  <View>
                    <Text style={MainStyle.lable} fontSize="xs">
                      {t('OTP')}{' '}
                      <Text color={darkGrey} fontSize="10">({t('To Verify Mobile No.')})</Text>{' '}
                      <Text color={dangerColor}>*</Text>
                    </Text>
                    <HStack justifyContent="space-between" alignItems="center">
                      <View style={MainStyle.inputbox} width={150}>
                        <Input height={43} value={otpValue} fontFamily={fontBold} size="xl" letterSpacing={5} variant="unstyled" keyboardType="number-pad" secureTextEntry={true} maxLength={6} onChangeText={text => setOtpValue(text)} />
                      </View>
                      <Button variant="unstyled" onPress={() => sendOtp()}>
                        <Text color={rareColor} fontFamily={fontBold} fontSize="sm">{t('Resend')}</Text>
                      </Button>
                    </HStack>
                  </View>
                )}
                {!forOTP && (
                  <Stack space={5} marginTop={3}>
                    <HStack space={1} alignItems="center" paddingRight={2}>
                      <CheckBox value={isAccept} onValueChange={() => setIsAccept(!isAccept)} tintColors={{ true: rareColor }} />
                      <TouchableOpacity onPress={() => navigation.navigate('TermsConditions', { pageTitle: "Terms & Conditions" })} style={{ width: '90%' }}>
                        <Text fontSize="xs" fontFamily={fontRegular} color={darkColor}>
                          {t('I accept the')}{' '}
                          <Text fontSize="xs" fontFamily={fontBold} style={{ textDecorationLine: 'underline' }}>
                            {t('Terms & Conditions & Privacy Policy')}
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    </HStack>

                    <Button style={MainStyle.solidbtn} onPress={() => sendOtp()}>
                      <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t('Get OTP')}</Text>
                    </Button>
                  </Stack>
                )}
                {forOTP && (
                  <Button marginTop={3} style={MainStyle.solidbtn} onPress={() => onVerify()}>
                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t('Verify OTP')}</Text>
                  </Button>
                )}
              </Stack>
            </ScrollView>
          </VStack>
          {forOTP && (
            <TouchableOpacity onPress={() => onGoBack()} style={{ width: '100%', marginVertical: 5 }}>
              <Text fontSize="sm" fontFamily={fontRegular} textAlign={'center'} color={lightColor}>
                {t('Not Now?')}{' '}
                <Text fontSize="sm" fontFamily={fontBold} color={lightColor} style={{ textDecorationLine: 'underline' }}>
                  {t('Go Back')}
                </Text>
              </Text>
            </TouchableOpacity>
          )}
          {/* <TouchableOpacity onPress={() => navigation.navigate('Registration')} style={{ width: '100%', marginVertical: 5 }}>
              <Text fontSize="sm" fontFamily={fontRegular} textAlign={'center'} color={lightColor}>
                {t('Don’t have an account?')}{' '}
                <Text fontSize="sm" fontFamily={fontBold} color={lightColor} style={{ textDecorationLine: 'underline' }}>
                  {t('Create Account')}
                </Text>
              </Text>
            </TouchableOpacity> */}
        </VStack>
      </LinearGradient>

      {versionFound && (
        <View style={MainStyle.spincontainer}>
          <Stack backgroundColor="#ffffff" style={{ width: '70%', borderRadius: 20, overflow: 'hidden' }}>
            <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
              <VStack marginBottom={5}>
                <Text color={baseDarkColor} fontWeight={'black'} fontSize="26" letterSpacing={4} textAlign="center">SHREEMATI</Text>
                <Text color={baseLightColor} fontWeight={"bold"} fontSize="sm" letterSpacing={1} textAlign="center">Silahkan masuk ke akun anda</Text>
              </VStack>
              <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t('Update Warning')}!</Text>
              <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t('App need Update to the Latest Version. Please click on Update Now button to Continue')}...</Text>
              <Button size="sm" style={{ backgroundColor: baseColorC, width: '100%', borderRadius: 30, overflow: 'hidden', height: 45, marginTop: 20 }} onPress={() => onContinueForVerssion()}><Text color="#ffffff" fontSize="sm" fontWeight="medium">{t('Update Now')}</Text></Button>
            </VStack>
          </Stack>
        </View>
      )}

      {loading && (
        <View style={MainStyle.spincontainer}>
          <ActivityIndicator animating={loading} size="large" color={baseLightColor} />
        </View>
      )}
    </NativeBaseProvider>
  );
};

/* const styles = StyleSheet.create({
}); */

export default LoginScreen;
