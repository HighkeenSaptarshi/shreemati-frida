import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Keyboard, Pressable, ScrollView, StatusBar, StyleSheet, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import CheckBox from 'react-native-check-box';
import CryptoJS from 'crypto-js';
import FooterComponents from '../components/Footer';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const AddressScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = Dimensions.get('window');

    const myroutdata = route.navigate
    // const { cardidd } = route.params || {};
    const { cardidd = 'No card ID provided' } = route.params || {};

    const [pageData, setPageData] = React.useState("");

    const [popAddress, setPopAddress] = React.useState(false);
    const [isChecked, setIsChecked] = React.useState("");
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

    // const [pincode, setPincode] = React.useState('');
    const [cartcount, setCartCount] = React.useState("");
    const [userType, setUserType] = React.useState("");

    const [peraddress, setPerAddress] = React.useState("");
    const [workingaddress, setWorkingAddress] = React.useState("");
    const [altaddress, setAltAddress] = React.useState([]);


    const [addressId, setAddressId] = React.useState("");

    const [alladdressdata, setAlladdressdata] = React.useState("");
    const [cartid, setCartId] = React.useState(route.params.cardid);
    const [tableName, setTableName] = React.useState("");

    const [address, setAddress] = React.useState(route.params.name);

    const [successOrder, setSuccessOrder] = React.useState(false);


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    setLanguage(val);
                    i18n
                        .changeLanguage(val)
                        .then(() => console.log(val))
                        .catch(err => console.log(err));
                }
            });
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {

                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                setUserType(JSON.parse(decryptData).user_type);

                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                apiClient
                    .post(`${BASE_URL}/order/all-address`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Address:", responseJson.data.address_list.alternate_addresses.details);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAlladdressdata(responseJson.data);
                            setPerAddress(responseJson.data.address_list.permanent_address.details[0]);
                            setWorkingAddress(responseJson.data.address_list.working_address.details[0]);
                            setAltAddress(responseJson.data.address_list.alternate_addresses.details);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Address Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }


    const handleCheckboxClick = async (addressid) => {
        try {
            // Assuming setAddressId is a function that might involve an async operation
            await setAddressId(addressid);

            // Add any other asynchronous logic here if needed
            console.log(`Address ID ${addressid} has been processed.`);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const onPlaceOrder = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                // setUserType(JSON.parse(decryptData).user_type);

                let formdata = new FormData();
                formdata.append("cartId", route.params.cartId);
                formdata.append("address_id", addressId);
                formdata.append("table_name", tableName);
                apiClient
                    .post(`${BASE_URL}/order/place`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("place:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setSuccessOrder(true);
                            getAllData();
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

    const onContinue = () => {
        setSuccessOrder(false);
        navigation.navigate('Home');
    }


    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="Address" navigation={navigation} />
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
                        <VStack padding={5} space={7}>
                            {alladdressdata != "" && (
                                <Stack space={3}>
                                    <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{alladdressdata.address_list.permanent_address.heading}</Text>
                                    <HStack space={2} backgroundColor={"#FBF9FE"} borderColor={"#eeeeee"} borderWidth={1} padding={3} borderRadius={6} overflow={'hidden'} justifyContent={'space-between'}>
                                        <VStack space={1} width={'85%'}>
                                            <Text fontSize='sm' color={darkColor} fontFamily={fontBold}>{peraddress.fname} {peraddress.lname}</Text>
                                            <Text fontSize='xs' color={darkColor} fontFamily={fontRegular}>{peraddress.line1}</Text>
                                            {peraddress.line2 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{peraddress.line2}</Text>)}
                                            {peraddress.line3 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{peraddress.line3}</Text>)}
                                            <Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{peraddress.state}, {peraddress.city}, {peraddress.post_code}</Text>
                                        </VStack>
                                        <CheckBox
                                            isChecked={isChecked === "permanentAddress"}
                                            onClick={() => {
                                                setIsChecked("permanentAddress");
                                                setTableName("dcm_addresses");
                                                handleCheckboxClick(peraddress.address_id);

                                            }}
                                            checkBoxColor={baseDarkColor}
                                        />
                                    </HStack>
                                </Stack>
                            )}
                            {/* {alladdressdata != "" && (
                                <Stack space={3}>
                                    <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{alladdressdata.address_list.working_address.heading}</Text>
                                    <HStack space={2} backgroundColor={"#FBF9FE"} borderColor={"#eeeeee"} borderWidth={1} padding={3} borderRadius={6} overflow={'hidden'} justifyContent={'space-between'}>
                                        <VStack space={1} width={'85%'}>
                                            <Text fontSize='sm' color={darkColor} fontFamily={fontBold}>{workingaddress.fname} {workingaddress.lname}</Text>
                                            <Text fontSize='xs' color={darkColor} fontFamily={fontRegular}>{workingaddress.line1}</Text>
                                            {workingaddress.line2 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{workingaddress.line2}</Text>)}
                                            {workingaddress.line3 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{workingaddress.line3}</Text>)}
                                            <Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{workingaddress.state}, {workingaddress.city}, {workingaddress.post_code}</Text>
                                        </VStack>
                                        <CheckBox
                                            isChecked={isChecked === "wokingAddress"}
                                            onClick={() => {
                                                setIsChecked("wokingAddress");
                                                handleCheckboxClick(workingaddress.address_id);

                                            }}
                                            checkBoxColor={baseDarkColor}
                                        />
                                    </HStack>
                                </Stack>
                            )} */}
                            {alladdressdata != "" && alladdressdata.address_list.alternate_addresses.details != "" && (
                                <Stack space={3}>
                                    <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{alladdressdata.address_list.alternate_addresses.heading}</Text>
                                    {altaddress.map((item, index) =>
                                        <HStack key={index} space={2} backgroundColor={"#FBF9FE"} borderColor={"#eeeeee"} borderWidth={1} padding={3} borderRadius={6} overflow={'hidden'} justifyContent={'space-between'}>
                                            <VStack space={1} width={'85%'}>
                                                <Text fontSize='xs' color={darkColor} fontFamily={fontRegular}>{item.line1}</Text>
                                                {item.line2 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{item.line2}</Text>)}
                                                {item.line3 != "" && (<Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{item.line3}</Text>)}
                                                <Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{item.state}, {item.city}, {item.post_code}</Text>
                                            </VStack>
                                            <CheckBox
                                                isChecked={isChecked === "altAddress" + index}
                                                onClick={() => {
                                                    setIsChecked("altAddress" + index);
                                                    setTableName("dcm_contact_shipping_address");
                                                    handleCheckboxClick(item.address_id);

                                                }}
                                                checkBoxColor={baseDarkColor}
                                            />
                                        </HStack>
                                    )}
                                </Stack>
                            )}
                        </VStack>
                    </ScrollView>
                    <Stack backgroundColor={lightColor} width={'100%'} alignSelf="center" padding={5}>
                        <VStack marginTop={6} space={2}>
                            <Button style={[MainStyle.outlinebtn, { backgroundColor: '#ffffff' }]} onPress={() => navigation.navigate('AddAddress')}>
                                <Text color={rareColor} fontFamily={fontSemiBold} fontSize="sm">{t("Add New Address")}</Text>
                            </Button>
                            {isChecked != "" && (
                                <Button style={MainStyle.solidbtn} onPress={() => onPlaceOrder()}>
                                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Place Order")}</Text>
                                </Button>
                            )}
                        </VStack>
                    </Stack>
                </VStack>
            </LinearGradient>
            {successOrder && (
                <View style={MainStyle.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', "#ffffff"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="10" paddingY="10" alignItems="center" justifyContent="center">
                            <Image
                                source={require('../assets/images/check-green.gif')} // Replace with your local image path
                                style={{ width: 100, height: 100 }} // Example size for the image
                            />
                            <Text mt={8} fontSize="xl" fontWeight="bold" color="#111111">{t("Thank You")}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your order has been Placed Successfully")}.</Text>
                            <Button size="sm" style={{ backgroundColor: rareColor, width: 220, borderRadius: 30, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {loading && (
                <View style={MainStyle.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={warningColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    text: {
        // marginTop: 20,
        fontSize: 16,

    },
    checkcontainer: {
        flexDirection: 'row', // Arrange children horizontally
        justifyContent: 'flex-start', // Align children to the start horizontally
        alignItems: 'center', // Center children vertically
        //   backgroundColor: 'red',
        height: ('18%'),
        marginTop: ("2%")

    }
});

export default AddressScreen;