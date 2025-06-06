import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, BASE_URL, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/apiClient';

const AddAddressScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = Dimensions.get('window');

    const [address1, setAddress1] = React.useState("");
    const [address2, setAddress2] = React.useState("");
    const [address3, setAddress3] = React.useState("");

    const [city, setCity] = React.useState("");
    const [pincode, setPinCode] = React.useState("");
    const [addressdata, setAddressData] = React.useState("");
    const [profiledata, setProfileData] = React.useState("");
    const [altPincode, setAltPincode] = React.useState('');
    const [alldata, setAlldata] = React.useState('');
    const [cityid, setCityID] = React.useState('');
    const [stateId, setStateId] = React.useState('');


    const [cityname, setCityname] = React.useState('');


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //setLoading(true);
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    setLanguage(val);
                    i18n
                        .changeLanguage(val)
                        .then(() => console.log(val))
                        .catch(err => console.log(err));
                }
            });
            //getAllData();
        });
        return unsubscribe;
    }, []);

    const search = () => {
        const characterRegex = /^[a-zA-Z0-9\s]+$/; // Allows numbers, letters, and spaces
        const digitRegex = /^\d+$/; // Allows only digits

        if (address1 === "") {
            Toast.show(t("Please enter Address line 1"), Toast.LONG);
        } else if (!characterRegex.test(address1)) {
            Toast.show(t("Address line 1 should contain only letters, numbers, and spaces"), Toast.LONG);
        } else if (address2 !== "" && !characterRegex.test(address2)) {
            Toast.show(t("Address line 2 should contain only letters, numbers, and spaces or be empty"), Toast.LONG);
        } else if (address3 !== "" && !characterRegex.test(address3)) {
            Toast.show(t("Address line 3 should contain only letters, numbers, and spaces or be empty"), Toast.LONG);
        } else if (pincode === "") {
            Toast.show(t("Please enter pincode"), Toast.LONG);
        } else if (!digitRegex.test(pincode)) {
            Toast.show(t("Pincode should contain only digits"), Toast.LONG);
        } else {
            setLoading(true);
            searchFind();
        }
    };

    // Pincode  search
    const searchFind = () => {
        let formdata = new FormData();
        formdata.append("pinCode", pincode);
        formdata.append("lang_code", currentLanguage);
        apiClient
            .post(`${BASE_URL}/registration/get-location-by-pin-code`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`,
                },
            }).then(response => {
                return response;
            })
            .then(responseJson => {
                setLoading(false);
                console.log("Pincode: ", responseJson.data);
                if (responseJson.data.bstatus == 1) {
                    setAlldata(responseJson.data.details);
                    setCityID(responseJson.data.details[0].city_id);
                    setStateId(responseJson.data.details[0].state_id);
                    setCityname(responseJson.data.details[0].city_name);
                }
                else {
                    setAlldata("");
                    setCityname("");
                    Toast.show(responseJson.data.message);
                }

            })
            .catch((error) => {
                setLoading(false);
                //console.log("Pincode Error:", error);
                Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
            });
    }

    const onSubmit = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                let formdata = new FormData();
                formdata.append("add_address_line1", address1);
                formdata.append("add_address_line2", address2);
                formdata.append("add_address_line3", address3);
                formdata.append("add_state", stateId);
                formdata.append("add_city", cityid);
                formdata.append("add_pincode", pincode);
                apiClient
                    .post(`${BASE_URL}/order/add-ship-address`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Add Address:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            Toast.show(responseJson.data.message, Toast.LONG);
                            navigation.goBack();
                        } else {
                            setLoading(false);
                            Toast.show(responseJson.data.message, Toast.LONG);
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Add Address Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="AddAddress" navigation={navigation} />
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
                            <Text fontFamily={fontBold} marginBottom={3} color={darkColor} fontSize={'xl'}>{t('Add Address')}</Text>
                            <Stack space={3}>
                                <View>
                                    <Text style={MainStyle.lable} fontSize="xs">{t('Flat / House / Building No.')} <Text color={dangerColor}>*</Text></Text>
                                    <View style={MainStyle.inputbox}>
                                        <Input height={43} fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={(text) => setAddress1(text)} />
                                    </View>
                                </View>
                                <View>
                                    <Text style={MainStyle.lable} fontSize="xs">{t('Area, Street')} <Text color={dangerColor}>*</Text></Text>
                                    <View style={MainStyle.inputbox}>
                                        <Input height={43} fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={(text) => setAddress2(text)} />
                                    </View>
                                </View>
                                <View>
                                    <Text style={MainStyle.lable} fontSize="xs">{t('Landmark')}</Text>
                                    <View style={MainStyle.inputbox}>
                                        <Input height={43} fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={(text) => setAddress3(text)} />
                                    </View>
                                </View>
                                <View>
                                    <Text style={MainStyle.lable} fontSize="xs">{t('Pincode')} <Text color={dangerColor}>*</Text></Text>
                                    <View style={MainStyle.inputbox}>
                                        <Input height={43} fontFamily={fontRegular} size="md" variant="unstyled" keyboardType="number-pad" maxLength={6} onChangeText={(text) => setPinCode(text)}
                                            InputRightElement={
                                                <Button backgroundColor={darkColor} onPress={() => search()}>
                                                    <Icon name="search" size={22} color={lightColor} style={{ textAlign: 'center' }} />
                                                </Button>
                                            } />
                                    </View>
                                </View>
                                {alldata != "" && (
                                    <Stack space={3}>
                                        <View>
                                            <Text style={MainStyle.lable} fontSize="xs">{t('State')}. <Text color={dangerColor}>*</Text></Text>
                                            <View style={MainStyle.inputbox}>
                                                <Input height={43} value={alldata[0].city_name} fontFamily={fontRegular} size="md" variant="unstyled" readOnly />
                                            </View>
                                        </View>
                                        <View>
                                            <Text style={MainStyle.lable} fontSize="xs">{t("City")} <Text color={dangerColor}>*</Text></Text>
                                            <View style={MainStyle.inputbox}>
                                                <Input height={43} value={alldata[0].state_name} fontFamily={fontRegular} size="md" variant="unstyled" readOnly />
                                            </View>
                                        </View>
                                    </Stack>
                                )}

                                <Button disabled={alldata == ""} opacity={alldata == "" ? 0.5 : 1} marginTop={8} style={[MainStyle.solidbtn, { backgroundColor: rareColor }]} onPress={() => onSubmit()}>
                                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t('Submit')}</Text>
                                </Button>
                            </Stack>
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

/* const styles = StyleSheet.create({
}); */

export default AddAddressScreen;