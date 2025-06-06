import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, FlatList, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorB, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FooterComponents from '../components/Footer';
import RenderHTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import Entypo from 'react-native-vector-icons/Entypo';
import apiClient from '../api/apiClient';


const TrackOrderScreen = ({ navigation, route }) => {


    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [orderPlace, setOrderPlace] = React.useState("");
    const [orderPlaceDetails, setOrderPlaceDetails] = React.useState("");
    const [orderShip, setOrderShip] = React.useState("");
    const [orderShipDetails, setOrderShipDetails] = React.useState("");
    const [orderDelivered, setOrderDelivered] = React.useState("");
    const [orderDeliveredDetails, setOrderDeliveredDetails] = React.useState("");

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

                let formdata = new FormData();
                formdata.append("orderId", route.params.OrderID);
                formdata.append("orderItemId", route.params.OrderItemID);
                formdata.append("lang_code", currentLanguage);
                apiClient
                    .post(`${BASE_URL}/track-order`, formdata, {
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
                        console.log("Response Track:", responseJson.data);
                        if (responseJson.data.bstatus === 1) {
                            setOrderDelivered(responseJson.data.order_delivered);
                            setOrderDeliveredDetails(responseJson.data.order_delivered.details);
                            setOrderShip(responseJson.data.order_shipped);
                            setOrderShipDetails(responseJson.data.order_shipped.details);
                            setOrderPlace(responseJson.data.order_placed);
                            setOrderPlaceDetails(responseJson.data.order_placed.details);
                        } else {
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

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component={"Track Order"} navigation={navigation} />
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
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{t("Track Order")}</Text>
                            <Image source={require('../assets/images/TrackImg.png')} style={{ width: '100%', height: 250, resizeMode: 'cover' }} />
                            <Stack>
                                <View style={styles.stepContainer}>
                                    <View style={styles.leftSection}>
                                        <View style={[styles.verticalLine, { backgroundColor: orderShipDetails != "" ? '#03A36F' : "#999999" }]} />
                                        <View style={[styles.iconCircle, { backgroundColor: '#03A36F', borderColor: '#03A36F' }]}>
                                            <Entypo name="check" size={16} color="#fff" />
                                        </View>
                                    </View>
                                    <View style={styles.rightSection}>
                                        <Text style={styles.title}>{orderPlace.name}</Text>
                                        <Text>{t("Your order has been placed. Order Id:")}  <Text style={[styles.dateText, { fontWeight: 'bold', fontSize: 14 }]}>{orderPlaceDetails.order_id}</Text></Text>
                                        <Text style={styles.dateText}>{orderPlaceDetails.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.stepContainer}>
                                    <View style={styles.leftSection}>
                                        <View style={[styles.verticalLine, { backgroundColor: orderDeliveredDetails != "" ? '#03A36F' : "#999999" }]} />
                                        <View style={[styles.iconCircle, { backgroundColor: orderShipDetails != "" ? '#03A36F' : "#ffffff", borderColor: orderShipDetails != "" ? '#03A36F' : "#999999" }]}>
                                            <Entypo name="check" size={16} color={orderShipDetails != "" ? "#ffffff" : "#cccccc"} />
                                        </View>
                                    </View>
                                    <View style={styles.rightSection}>
                                        <Text style={styles.title}>{orderShip.name}</Text>
                                        {orderShipDetails != "" && (
                                            <Stack>
                                                <Text>{t("Your order has been shipped. Tracking ID:")}  <Text style={[styles.dateText, { fontWeight: 'bold', fontSize: 14 }]}>{orderShipDetails.tracking_id}</Text></Text>
                                                <Text fontWeight={'bold'}>{orderShipDetails.courier_name}</Text>
                                                <Text style={styles.dateText}>{orderShipDetails.date}</Text>
                                            </Stack>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.stepContainer}>
                                    <View style={styles.leftSection}>
                                        <View style={[styles.iconCircle, { backgroundColor: orderDeliveredDetails != "" ? '#03A36F' : "#ffffff", borderColor: orderDeliveredDetails != "" ? '#03A36F' : "#999999" }]}>
                                            <Entypo name="check" size={16} color={orderDeliveredDetails != "" ? "#ffffff" : "#cccccc"} />
                                        </View>
                                    </View>
                                    <View style={styles.rightSection}>
                                        <Text style={styles.title}>{orderDelivered.name}</Text>
                                        {orderDeliveredDetails != "" && (
                                            <Stack>
                                                <Text>{t("Your order has been delivered.")}</Text>
                                                <Text fontWeight={'bold'}>{orderDeliveredDetails.courier_name}</Text>
                                                <Text style={styles.dateText}>{orderDeliveredDetails.date}</Text>
                                            </Stack>
                                        )}
                                    </View>
                                </View>
                            </Stack>
                            <Button padding={3} marginTop={50} size="sm" style={{ backgroundColor: rareColor, width: '100%', borderRadius: 30, overflow: 'hidden', bottom: 60 }} onPress={() => navigation.goBack()}>
                                <Text color="#ffffff" fontSize="md" fontFamily={fontBold}>{t("Okay")}</Text>
                            </Button>
                            {/* <View style={styles.container}>
                                <FlatList
                                    data={steps}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => {
                                        const isLast = index === steps.length - 1;
                                        const nextStepCompleted = !isLast && steps[index + 1].isCompleted;
                                        return (
                                            <View style={styles.stepContainer}>
                                                <View style={styles.leftSection}>
                                                {!isLast && (
                                                <View
                                                style={[
                                                styles.verticalLine,
                                                {
                                                backgroundColor: nextStepCompleted
                                                ? '#03A36F'
                                                : '#999',
                                                },
                                                ]}/>
                                                 )}
                                                    <View
                                                        style={[
                                                            styles.iconCircle,
                                                            item.isCompleted
                                                                ? { backgroundColor: '#03A36F', borderColor: '#03A36F' }
                                                                : { backgroundColor: '#fff', borderColor: '#ccc' },
                                                        ]}
                                                    >
                                                        {item.isCompleted && (
                                                            <Entypo name="check" size={16} color="#fff" />
                                                        )}
                                                    </View>
                                                 </View>
                                                <View style={styles.rightSection}>
                                                    <Text style={styles.title}>{item.title}</Text>
                                                    <Text style={styles.statusText}>{item.status}
                                                    <Text style={{ fontWeight: 'bold' }}>
                                                    {item.title === 'Shipped' ? item.TrackId : item.OrderId}
                                                    <Text style={styles.dateText}>{item.date}</Text>
                                                    </Text>
                                                 {item.title === 'Shipped' && (
                                                    <>
                                                    <Text style={styles.statusText}>{item.ShipAddress}</Text>
                                                    <Text style={styles.dateText}>{item.ShipDate}</Text>
                                                    </>
                                                    )}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                            </View>
                            <Button padding={3} size="sm" style={{ backgroundColor: rareColor, width: '100%', borderRadius: 30, overflow: 'hidden', bottom: 60 }} onPress={() => onContinue()}>
                                <Text color="#ffffff" fontSize="md" fontFamily={fontBold}>{t("Okay")}</Text>
                            </Button> */}
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
    container: {
        padding: 16,
        backgroundColor: lightColor,
        flex: 1,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        position: 'relative',
    },
    leftSection: {
        width: 30,
        alignItems: 'center',
        position: 'relative',
    },
    verticalLine: {
        position: 'absolute',
        top: 24,
        bottom: -32,
        width: 2,
        zIndex: 0,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        zIndex: 1,
    },
    rightSection: {
        flex: 1,
        paddingLeft: 8,
    },
    title: {
        color: darkColor,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusText: {
        color: darkColor,
        fontSize: 14,
        lineHeight: 20,
    },
    dateText: {
        color: '#B980F0',
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
});

export default TrackOrderScreen;