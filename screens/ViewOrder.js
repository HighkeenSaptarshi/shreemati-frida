import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import moment from 'moment';
import apiClient from '../api/apiClient';

const ViewOrdersScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const [pageData, setPageData] = React.useState("");
    const [mycardData, setMycardData] = React.useState("");
    const [quantities, setQuantities] = React.useState("");
    const [forrelode, setForRelode] = React.useState("");
    const [alldata, setAlldata] = React.useState("");
    const [cartcount, setCartCount] = React.useState("");
    const [userType, setUserType] = React.useState("");
    const [moreData, setMoreData] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPage, setTotalPage] = React.useState(1);
    const [orderList, setOrderList] = React.useState([]);
    const [filterStatus, setFilterStatus] = React.useState("");
    const [id, setId] = React.useState("");

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
            if (val) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                setUserType(JSON.parse(decryptData).user_type);
                let formdata = new FormData();
                formdata.append("pageNumber", "1");
                apiClient
                    .post(`${BASE_URL}/order/history`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        setLoading(false);
                        console.log("Response History:", responseJson.data);
                        if (responseJson.data.bstatus === 1) {
                            const orders = Array.isArray(responseJson.data.order_list) ? responseJson.data.order_list : [];
                            setOrderList(orders);
                            setTotalPage(responseJson.data.total_pages || 1);
                            setCurrentPage(responseJson.data.page);
                        } else {
                            setOrderList([]);
                            setMoreData(false);
                            Toast.show(responseJson.data.message, Toast.LONG);

                            if (responseJson.data.msg_code === "msg_0046") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch(() => {
                        setLoading(false);
                        Toast.show("Sorry! Something went wrong. Maybe network request failed.");
                    });
            }
        });
    };

    const loadMore = () => {
        let nextPage = Number(currentPage) + 1;
        setLoading(true);

        AsyncStorage.getItem('userToken').then(val => {
            if (val) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                setUserType(JSON.parse(decryptData).user_type);
                let formdata = new FormData();
                formdata.append("pageNumber", nextPage);
                apiClient
                    .post(`${BASE_URL}/order/history`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        setLoading(false);
                        console.log("Response JSON loadMore:", responseJson.data);

                        if (responseJson.data.bstatus === 1) {
                            const orders = Array.isArray(responseJson.data.order_list) ? responseJson.data.order_list : [];

                            if (orders.length > 0) {
                                setOrderList(prevData => [...prevData, ...orders]); // Append new data
                                setCurrentPage(nextPage); // Update current page correctly
                                setTotalPage(responseJson.data.total_pages);
                            } else {
                                setMoreData(false);
                                Toast.show("No more orders.");

                                if (responseJson.data.msg_code === "msg_0046") {
                                    AsyncStorage.clear();
                                    navigation.replace('Intro');
                                }
                            }
                        } else {
                            setMoreData(false);
                            Toast.show("Failed to load more orders.");
                        }
                    })
                    .catch(() => {
                        setLoading(false);
                        Toast.show("Something went wrong.");
                    });
            }
        });
    };


    const orderCancel = (cardid, pruductid) => {
        Alert.alert(
            t("Are you sure?"),
            t("Do you want to Cancel this order?"),

            [
                {
                    text: t("No"),
                    style: "cancel",
                },
                {
                    text: t("Yes"),
                    onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val) {
                                var CryptoJS = require("crypto-js");
                                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                                let formdata = new FormData();
                                formdata.append("orderId", cardid);
                                formdata.append("itemId", pruductid);
                                formdata.append("status", "Cancelled");
                                apiClient
                                    .post(`${BASE_URL}/order/cancel`, formdata, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            accesstoken: `${AccessToken}`,
                                            Useraccesstoken: JSON.parse(decryptData).token
                                        },
                                    }).then(response => {
                                        return response;
                                    })
                                    .then(responseJson => {
                                        setLoading(false);
                                        console.log("Response Cancel:", responseJson.data);

                                        if (responseJson.data.bstatus === 1) {
                                            getAllData();
                                        } else {
                                            setLoading(false);
                                            Toast.show(responseJson.data.message, Toast.LONG);
                                            if (responseJson.data.msg_code === "msg_0046") {
                                                AsyncStorage.clear();
                                                navigation.replace('Login');
                                            }
                                        }
                                    })
                                    .catch(() => {
                                        setLoading(false);
                                        Toast.show("Sorry! Something went wrong. Maybe network request failed.");
                                    });
                            }
                        });
                    }
                },
            ],
            { cancelable: true }
        );
    }


    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="RewardsCategory" navigation={navigation} />
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
                            <VStack flexWrap="wrap" justifyContent="space-between" space={3}>
                                {orderList.length > 0 ?
                                    orderList.map((item, index) => (
                                        <VStack key={index} space={5} width={'100%'} padding={4} backgroundColor={"#FBF9FE"} borderColor={greyColor} borderWidth={1} borderRadius={10} overflow={"hidden"}>
                                            <Box style={{ backgroundColor: baseColor, padding: 3, borderRadius: 30, overflow: 'hidden', width: 200, alignSelf: 'flex-end' }}><Text fontSize="md" fontFamily={fontBold} color={lightColor} textAlign={'center'}>{t("Order ID")}: {item.orderId}</Text></Box>
                                            <HStack space={4}>
                                                <VStack space={2} width={'30%'} alignItems={'center'}>
                                                    <Box style={{ width: '100%', borderColor: greyColor, borderWidth: 1, height: 100, borderRadius: 6, overflow: 'hidden' }}>
                                                        {item?.BaseUrl && item?.product_image?.[2]?.product_image && (
                                                            <Image source={{ uri: item.BaseUrl + item.product_image[0].product_image }} style={{ width: '100%', height: 100, resizeMode: 'cover' }} />
                                                        )}
                                                    </Box>
                                                    {
                                                        item.status === "Order Placed" ? (
                                                            <HStack alignItems="center" space={1}>
                                                                <Text fontFamily={fontBold} fontSize="sm" color={baseColor}>
                                                                    {item.status}
                                                                </Text>

                                                            </HStack>
                                                        ) : item.status === "Cancelled" ? (
                                                            <HStack alignItems="center" space={1}>
                                                                <Text fontFamily={fontBold} fontSize="sm" color="#ff0000">
                                                                    {item.status}
                                                                </Text>

                                                            </HStack>
                                                        ) :
                                                            item.status === "Delivered" ? (
                                                                <HStack alignItems="center" space={1}>
                                                                    <Text fontFamily={fontBold} fontSize="sm" color="#00FF00">
                                                                        {item.status}
                                                                    </Text>

                                                                </HStack>
                                                            ) :

                                                                item.status === "Dispatched" ? (
                                                                    <HStack alignItems="center" space={1}>
                                                                        <Text fontFamily={fontBold} fontSize="sm" color="#008000">
                                                                            {item.status}
                                                                        </Text>
                                                                    </HStack>
                                                                ) :
                                                                    (
                                                                        <HStack alignItems="center" space={1}>
                                                                            <Text fontFamily={fontBold} fontSize="sm" color={"#ff0000"}>
                                                                                {item.status}
                                                                            </Text>
                                                                        </HStack>
                                                                    )
                                                    }
                                                </VStack>
                                                <VStack space={1} width={'60%'}>
                                                    <Text fontFamily={fontBold} fontSize="md" color={darkColor}>
                                                        {item.productName}
                                                    </Text>
                                                    <HStack alignContent={'center'}>
                                                        <Icon name="radio-button-on-outline" size={20} color={warningColor} />
                                                        <Text fontFamily={fontBold} color={darkGrey}>{t(" Order On")}: {moment(item.orderInDate).format('DD MMMM, YYYY')}</Text>
                                                    </HStack>
                                                    <HStack style={{ justifyContent: "space-between", alignContent: 'center', marginTop: 5 }}>
                                                        <Text fontWeight="bold" fontSize="sm" color={darkColor}>
                                                            {item.pricePoint} {t("Points")}
                                                        </Text>
                                                        <Text fontWeight="bold" fontSize="sm" color={darkColor}>
                                                            {item.quantity} {t("Qty")}
                                                        </Text>
                                                    </HStack>
                                                    {(item.status == 'Dispatched' || item.status == 'Delivered') && (
                                                        <Stack marginTop={2}>
                                                            <Text fontSize="xs" color={darkGrey}>
                                                                {t("Courier Name")}: {item.courierName}
                                                            </Text>
                                                            <Text fontSize="xs" color={darkGrey}>
                                                                {t("AWB No")}: {item.awbNo}
                                                            </Text>
                                                        </Stack>
                                                    )}
                                                    <HStack space={2}>
                                                        {item.status != "Cancelled" && (
                                                            <Button size="sm" style={{ backgroundColor: darkColor, width: 110, borderRadius: 6, overflow: 'hidden' }} onPress={() => navigation.navigate('TrackOrder', { OrderID: item.orderId, OrderItemID: item.orderItemId })} marginY={4}>
                                                                <Text color="#ffffff" fontSize="xs" fontFamily={fontBold}>{t("Track Order")}</Text>
                                                            </Button>
                                                        )}
                                                        {item.canCancel == 1 && (
                                                            <Button size="sm" variant={'unstyled'} style={{ borderColor: dangerColor, borderWidth: 2, width: 50, borderRadius: 6, overflow: 'hidden' }} onPress={() => orderCancel(item.orderId, item.orderItemId)} marginY={4}>
                                                                <Text color={dangerColor} fontSize="xs" fontFamily={fontBold}>X</Text>
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    ))
                                    :
                                    <VStack space={5} flex={1} justifyContent={'center'} alignItems={'center'}>
                                        <Image source={require('../assets/images/nodata.jpeg')} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                                    </VStack>
                                }
                                {currentPage < totalPage && (
                                    <HStack paddingY="3" paddingX="6" justifyContent="center">
                                        <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                            <Text color="#bbbbbb">{t("Load More")}</Text>
                                        </Button>
                                    </HStack>
                                )}

                            </VStack>
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

export default ViewOrdersScreen;