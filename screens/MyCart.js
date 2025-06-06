import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, BASE_URL, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FooterComponents from '../components/Footer';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';


const MyCartScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = Dimensions.get('window');

    const [mycardData, setMycardData] = React.useState("");

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

                let formdata = new FormData();
                apiClient
                    .post(`${BASE_URL}/cart/my-cart`, "", {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Cart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setMycardData(responseJson.data);
                        } else {
                            setLoading(false);
                            setMycardData("");
                            //Toast.show(responseJson.message, Toast.LONG);
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Cart Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const updateQty = (qty, cartId, productId) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                let formdata = new FormData();
                formdata.append("product_id", productId);
                formdata.append("quantity", qty);
                formdata.append("cart_id", cartId);
                apiClient
                    .post(`${BASE_URL}/cart/update-quantity`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Update Cart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            getAllData();
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
                        //console.log("Update Cart Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const removeCart = (cardid, pruductid) => {
        Alert.alert(
            t("Warning"),
            t("Do you want to Remove Item from cart") + "?",
            [
                { text: t("Cancel"), onPress: () => { return null } },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                var CryptoJS = require("crypto-js");
                                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                                let formdata = new FormData();
                                formdata.append("cart_id", cardid);
                                formdata.append("product_id", pruductid);
                                apiClient
                                    .post(`${BASE_URL}/cart/remove`, formdata, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            accesstoken: `${AccessToken}`,
                                            Useraccesstoken: JSON.parse(decryptData).token
                                        },
                                    }).then(response => {
                                        return response;
                                    })
                                    .then(responseJson => {
                                        console.log("Remove Cart:", responseJson.data);
                                        if (responseJson.data.bstatus == 1) {
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
                                        //console.log("Remove Cart Error:", error);
                                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                                    });
                            } else {
                                setLoading(false);
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        });
                    }
                },
            ],
            { cancelable: false }
        )
    }


    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="cart" navigation={navigation} />
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
                        <VStack padding={5} space={2}>
                            <Text fontFamily={fontBold} marginBottom={3} color={darkColor} fontSize={'xl'}>{route.params.pageTitle}</Text>
                            {mycardData ? (
                                mycardData.row_items.map((item, index) => (
                                    <HStack key={index} space={3} backgroundColor={"#FBF9FE"} borderColor={"#eeeeee"} borderWidth={1} padding={4} borderRadius={6} overflow={'hidden'}>
                                        <Box style={[MainStyle.productimage, { width: '32%', height: 90, borderColor: greyColor, borderWidth: 1, backgroundColor: lightColor }]}>
                                            <Image source={{ uri: item.baseUrl + item.productImage[0].product_image }} style={{ width: '100%', height: 90 }} resizeMode="cover" />
                                        </Box>
                                        <VStack style={{ width: '65%' }} space={1}>
                                            <Text fontSize="xs" color={darkColor} fontFamily={fontRegular}>{item.productName}</Text>
                                            <Text fontFamily={fontBold} fontSize="sm" color={darkColor}>{item.pricePoints} {t("Points")}</Text>
                                            <HStack justifyContent={'space-between'} alignItems={'center'} marginTop={2}>
                                                <HStack alignItems="center" space={1} backgroundColor={lightColor} borderColor={greyColor} borderWidth={1}>
                                                    <TouchableOpacity style={{ padding: 5 }} onPress={() => updateQty(Number(item.quantity) - 1, item.cart_id, item.product_id)}>
                                                        <Icon name="remove-outline" size={20} color={darkColor} />
                                                    </TouchableOpacity>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: darkColor, padding: 5 }}>{item.quantity}</Text>
                                                    <TouchableOpacity style={{ padding: 5 }} onPress={() => updateQty(Number(item.quantity) + 1, item.cart_id, item.product_id)}>
                                                        <Icon name="add-outline" size={20} color={darkColor} />
                                                    </TouchableOpacity>
                                                </HStack>
                                                <Pressable onPress={() => removeCart(item.cart_id, item.product_id)}>
                                                    <Icon name="trash-outline" size={22} color={dangerColor} />
                                                </Pressable>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                ))
                            ) : (
                                <VStack space={5} flex={1} justifyContent={'center'} alignItems={'center'}>
                                    <Image source={require('../assets/images/nodata.jpeg')} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                                </VStack>
                            )}
                        </VStack>
                    </ScrollView>
                    <Stack backgroundColor={lightColor} width={'100%'} alignSelf="center" padding={5}>
                        {mycardData.bstatus == 1 && (
                            <Stack backgroundColor={"#FBF9FE"} borderColor={"#eeeeee"} borderWidth={1} padding={4} borderRadius={6} overflow={'hidden'} space={3}>
                                <Text fontFamily={fontSemiBold} fontSize='md' color={darkColor}>{t("Points Details")}</Text>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text fontFamily={fontRegular} fontSize='sm' color={darkGrey}>{t("Available Points")}</Text>
                                    <Text fontFamily={fontRegular} fontSize='sm' color={darkColor}>{mycardData != "" ? mycardData.available_point : ""} {t("Points")}</Text>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text fontFamily={fontRegular} fontSize='sm' color={darkGrey}>{t("Redeem Points")}</Text>
                                    <Text fontFamily={fontRegular} fontSize='sm' color={darkColor}>{mycardData != "" ? mycardData.control.grandtotal_in_point : ""} {t("Points")}</Text>
                                </HStack>
                            </Stack>
                        )}
                        {mycardData.bstatus == 1 && (
                            <VStack marginTop={6} space={2}>
                                <Button style={MainStyle.solidbtn} onPress={() => navigation.navigate('Address', { cartId: mycardData.control.cart_id })}>
                                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Proceed to Buy")}</Text>
                                </Button>
                            </VStack>
                        )}
                    </Stack>
                </VStack>
            </LinearGradient>
            <FooterComponents navigation={navigation} component={"Cart"} />
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

export default MyCartScreen;