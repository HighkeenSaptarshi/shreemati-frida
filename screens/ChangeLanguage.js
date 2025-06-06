import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, BASE_URL, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import i18n from '../assets/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const ChangeLanguageScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const [pageData, setPageData] = React.useState("");

    const [currentLanguage, setLanguage] = React.useState('Eng');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    setLanguage(val);
                    i18n
                        .changeLanguage(val)
                        .then(() => console.log(val))
                        .catch(err => console.log(err));
                }
            });
        });
        return unsubscribe;
    }, []);

    const onChangeLanguage = () => {

        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                // setUserType(JSON.parse(decryptData).user_type);

                let formdata = new FormData();
                formdata.append("language_code", currentLanguage);
                apiClient
                    .post(`${BASE_URL}/change-language`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        //console.log("language:", responseJson);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            navigation.goBack();
                        } else {
                            setLoading(false);
                            //Toast.show(responseJson.message, Toast.LONG);
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            }
        });
    }

    const onSaveLang = () => {
        AsyncStorage.setItem('language', currentLanguage);
        i18n.changeLanguage(currentLanguage)
            .then(() => setLoading(true), onChangeLanguage())
            .catch(err => console.log(err));
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component={route.params.pageTitle} navigation={navigation} />
            <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                colors={[baseColor, rareColor]}
                flex={1}
                style={{ padding: 15, position: 'relative' }}
            >
                <Image source={require('../assets/images/Vectorshape.png')} style={{ width: width, resizeMode: 'cover', position: 'absolute', top: 0, left: 0 }} />
                <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                <Image source={require('../assets/images/mehndi.png')} style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', resizeMode: 'contain' }} />
                <VStack flex={1} backgroundColor={lightColor} borderRadius={20} overflow={'hidden'}>
                    <ScrollView automaticallyAdjustKeyboardInsets={true}>
                        <VStack padding={5} space={5}>
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{route.params.pageTitle}</Text>
                            <View>
                                <Text style={MainStyle.lable} fontSize="xs">{t("Language")} <Text color={dangerColor}>*</Text></Text>
                                <View style={MainStyle.inputbox}>
                                    <Select variant="unstyled" size="md" height={43}
                                        selectedValue={currentLanguage}
                                        onValueChange={value => setLanguage(value)}
                                        style={{ paddingLeft: 15 }}
                                        fontFamily={fontRegular}
                                        dropdownCloseIcon={<Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />}
                                        dropdownOpenIcon={<Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />}
                                        _selectedItem={{
                                            backgroundColor: greyColor,
                                            endIcon: <Icon name="checkmark-circle" size={20} color={successColor} style={{ right: 0, position: 'absolute' }} />
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
                            <Button style={MainStyle.solidbtn} marginTop={10} onPress={() => onSaveLang()}>
                                <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Save")}</Text>
                            </Button>
                        </VStack>
                    </ScrollView>
                </VStack>
            </LinearGradient>
            {loading && (
                <View style={MainStyle.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={warningColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
});

export default ChangeLanguageScreen;