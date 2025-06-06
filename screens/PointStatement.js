import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorB, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor, baseDarkColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FooterComponents from '../components/Footer';
import RenderHTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';


const PointStatementScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [pointDetails, setPointDetails] = React.useState("");

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
                formdata.append("lang_code", currentLanguage);
                apiClient
                    .post(`${BASE_URL}/my-point-details`, formdata, {
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
                        console.log("points:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setPointDetails(responseJson.data);
                        } else {
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("get-gallery Error:", error);
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
                            <LinearGradient
                                colors={[baseDarkColor, '#C5AAF8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    flexDirection: 'row',
                                    paddingVertical: 20,
                                    paddingHorizontal: 20,
                                    borderRadius: 15,
                                    overflow: 'visible',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    minHeight: 150,
                                    position: 'relative'
                                }}>
                                <Image source={require('../assets/images/header-round.png')} style={{ width: 100, height: 90, padding: 80, resizeMode: 'contain', position: 'absolute', bottom: 20, right: 20 }} />
                                <Image source={require('../assets/images/trophy1.png')} style={{ width: 100, height: 90, resizeMode: 'contain', position: 'absolute', bottom: 30, right: 30 }} />
                                <View style={{ flex: 1, paddingTop: 10 }}>
                                    <Text
                                        style={{ fontFamily: fontBold, color: 'white', fontSize: 24, lineHeight: 28, includeFontPadding: false, textAlignVertical: 'top', }}>
                                        {t("Special Offer")}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
                                        <Text style={{ fontFamily: fontBold, color: 'white', fontSize: 42, lineHeight: 46, includeFontPadding: false, textShadowColor: 'orange', textShadowOffset: { width: 3, height: 1 }, textShadowRadius: 1, }}>
                                            {pointDetails.available_points}
                                        </Text>
                                        <Text style={{ fontFamily: fontBold, color: 'white', fontSize: 20, lineHeight: 24, marginLeft: 6, includeFontPadding: false, textShadowColor: 'orange', textShadowOffset: { width: 3, height: 1 }, textShadowRadius: 1, }}>
                                            {t(" Points")}
                                        </Text>
                                    </View>
                                    <Text
                                        style={{ fontFamily: fontBold, color: 'white', fontSize: 14, lineHeight: 28, includeFontPadding: false, textAlignVertical: 'top', bottom: 10 }}>
                                        {pointDetails.available_points_text}
                                    </Text>
                                </View>
                            </LinearGradient>
                            <VStack space={5} marginY={7}>
                                <Pressable onPress={() => navigation.navigate("MyPoints", { filterType: "" })}>
                                    <HStack padding={5} justifyContent="space-between" alignItems="center" backgroundColor="#F8F4FF" position="relative" borderColor={baseColor} borderWidth={0.3} borderLeftWidth={8} borderRadius={12} overflow="hidden">
                                        <VStack>
                                            <Text color={darkColor} fontSize="lg" fontFamily={fontBold}>{pointDetails.redemable_points} {t("Points")}</Text>
                                            <Text color={darkGrey} fontSize="sm" fontFamily={fontSemiBold}>{pointDetails.redemable_points_text}</Text>
                                        </VStack>
                                        <View style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 50, width: 50, paddingHorizontal: 7, borderRadius: 10, overflow: 'hidden' }]} variant="unstyled">
                                            <Text color={lightColor} fontFamily={fontSemiBold} style={{ position: 'relative', top: 5, left: 5 }} lineHeight={38}><Icon style={{ fontSize: 25 }} name="arrow-forward-outline"></Icon></Text>
                                        </View>
                                    </HStack>
                                </Pressable>
                                <Pressable onPress={() => navigation.navigate("MyPoints", { filterType: "C" })}>
                                    <HStack padding={5} justifyContent="space-between" alignItems="center" backgroundColor="#F8F4FF" position="relative" borderColor={baseColor} borderWidth={0.3} borderLeftWidth={8} borderRadius={12} overflow="hidden">
                                        <VStack>
                                            <Text color={darkColor} fontSize="lg" fontFamily={fontBold}>{pointDetails.earned_points} {t("Points")}</Text>
                                            <Text color={darkGrey} fontSize="sm" fontFamily={fontSemiBold}>{pointDetails.earned_points_text}</Text>
                                        </VStack>
                                        <View style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 50, width: 50, paddingHorizontal: 7, borderRadius: 10, overflow: 'hidden' }]} variant="unstyled">
                                            <Text color={lightColor} fontFamily={fontSemiBold} style={{ position: 'relative', top: 5, left: 5 }} lineHeight={38}><Icon style={{ fontSize: 25 }} name="arrow-forward-outline"></Icon></Text>
                                        </View>
                                    </HStack>
                                </Pressable>
                                <Pressable onPress={() => navigation.navigate("MyPoints", { filterType: "D" })}>
                                    <HStack padding={5} justifyContent="space-between" alignItems="center" backgroundColor="#F8F4FF" position="relative" borderColor={baseColor} borderWidth={0.3} borderLeftWidth={8} borderRadius={12} overflow="hidden">
                                        <VStack>
                                            <Text color={darkColor} fontSize="lg" fontFamily={fontBold}>{pointDetails.spent_points} {t("Points")}</Text>
                                            <Text color={darkGrey} fontSize="sm" fontFamily={fontSemiBold}>{pointDetails.spent_points_text}</Text>
                                        </VStack>
                                        <View style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 50, width: 50, paddingHorizontal: 7, borderRadius: 10, overflow: 'hidden' }]} variant="unstyled">
                                            <Text color={lightColor} fontFamily={fontSemiBold} style={{ position: 'relative', top: 5, left: 5 }} lineHeight={38}><Icon style={{ fontSize: 25 }} name="arrow-forward-outline"></Icon></Text>
                                        </View>
                                    </HStack>
                                </Pressable>
                            </VStack>
                            {/* <Button padding={3} size="sm" style={{ backgroundColor: baseColor, width: '100%', borderRadius: 30, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="md" fontFamily={fontBold}>{t("Download Point Statement")}</Text>
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
});

export default PointStatementScreen;