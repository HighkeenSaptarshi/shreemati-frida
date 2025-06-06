import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose, Toast } from 'native-base';
import React, { useEffect, useCallback } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';
const ProductDetailsScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [cartcount, setCartCount] = React.useState("");
    const [step1, setStep1] = React.useState(true);
    const [step2, setStep2] = React.useState(false);

    const [mypropsdata, setMypropsData] = React.useState(route.params);



    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            cartCount();
        });
        return unsubscribe;
    }, []);

    const cartCount = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                apiClient
                    .post(`${BASE_URL}/cart/count`, "", {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("cartCount:", responseJson.data);
                        setCartCount(responseJson.data.cart_count);
                        setLoading(false);
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);

                    });
            }
        });
    }

    const AddToCard = (type) => {
        //setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                const formdata = new FormData();
                formdata.append("prod_id", route.params.productID);
                formdata.append("price_in_points", route.params.pricePoint);
                formdata.append("prod_name", route.params.productname);
                formdata.append("quantity", 1);
                apiClient
                    .post(`${BASE_URL}/cart/add`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        Toast.show({ description: t(responseJson.data.message) });
                        if (responseJson.data.bstatus == 1) {
                            cartCount();
                            if (type == "Redeem") {
                                navigation.navigate("Cart", { pageTitle: "My Cart" });
                            }
                        } else {
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);

                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };


    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="ProductDetails" navigation={navigation} cartcount={cartcount} />
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
                        <VStack padding={5} space={3}>
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{route.params.productname}</Text>
                            <Image source={{ uri: mypropsdata.productimage }} style={{ width: '100%', height: 230, borderColor: greyColor, borderWidth: 1, borderRadius: 5, overflow: 'hidden' }} resizeMode="contain" />
                            <Text fontWeight="bold" fontSize='sm' color={darkGrey}>{route.params.productname}</Text>
                            <HStack justifyContent="space-between" marginY={3}>
                                <Text fontWeight="bold" fontSize='lg' color={darkColor}>{mypropsdata.pricePoint ? mypropsdata.pricePoint : ""} {t("Points")}</Text>
                                <HStack justifyContent="space-between" space={2} paddingX={4} paddingY={1} borderColor={lightGrey} borderWidth={1} borderRadius={4}>
                                    <Text fontSize='xs' color={darkGrey}>{t("Available Points")}:</Text>
                                    <Text fontWeight="bold" fontSize='xs' color={darkColor}>{mypropsdata.availablepoint ? mypropsdata.availablepoint : ""}</Text>
                                </HStack>
                            </HStack>
                            <Stack marginY={1}>
                                <Pressable onPress={() => setStep1(!step1)}>
                                    <LinearGradient
                                        colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ paddingVertical: 10, paddingHorizontal: 15, position: 'relative', borderRadius: 8, overflow: 'hidden' }}
                                    >
                                        <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Description")}</Text>
                                            <Icon name={step1 ? "chevron-down" : "chevron-up"} size={22} color={lightColor} />
                                        </HStack>
                                    </LinearGradient>
                                </Pressable>
                                {step1 && (
                                    <Stack paddingX={3}>
                                        {route.params.detaildata ? (
                                            <RenderHtml
                                                contentWidth={400}
                                                source={{ html: route.params.detaildata ? route.params.detaildata : "" }}
                                                tagsStyles={{
                                                    body: { color: 'black' }, // Applies the color black to all text in the body tag
                                                }}
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </Stack>
                                )}
                            </Stack>
                            <Stack marginY={1}>
                                <Pressable onPress={() => setStep2(!step2)}>
                                    <LinearGradient
                                        colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ paddingVertical: 10, paddingHorizontal: 15, position: 'relative', borderRadius: 8, overflow: 'hidden' }}
                                    >
                                        <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Specification")}</Text>
                                            <Icon name={step2 ? "chevron-down" : "chevron-up"} size={22} color={lightColor} />
                                        </HStack>
                                    </LinearGradient>
                                </Pressable>
                                {step2 && (
                                    <Stack padding={3}>
                                        <View>
                                            {Object.entries(mypropsdata.productParams).map(([key, value], index) => (
                                                <Text key={index}>
                                                    {key}: {value}
                                                </Text>
                                            ))}
                                        </View>
                                    </Stack>
                                )}
                            </Stack>
                            {/* <VStack marginTop={6} space={2}>
                                <Button style={MainStyle.solidbtn} onPress={() => AddToCard("Add")}>
                                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Add to Cart")}</Text>
                                </Button>
                                <Button style={[MainStyle.outlinebtn, { backgroundColor: '#ffffff' }]} onPress={() => AddToCard("Redeem")}>
                                    <Text color={rareColor} fontFamily={fontSemiBold} fontSize="sm">{t("Redeem Now")}</Text>
                                </Button>
                            </VStack> */}
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

export default ProductDetailsScreen;