import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorB, baseColorC, baseDarkColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import FooterComponents from '../components/Footer';
import i18n from '../assets/language/i18n';
import Toast from 'react-native-simple-toast';
import { SliderBox } from 'react-native-image-slider-box';
import { assets } from '../react-native.config';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';
// import { BottomSheetAndroid } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionPresets';
// import { position } from 'native-base/lib/typescript/theme/styled-system';



const HomeScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = Dimensions.get('window');

    const [homeMenu, setHomeMenu] = React.useState([]);
    const [profileData, setProfileData] = React.useState("");
    const [points, setPoints] = React.useState("");
    const [count, setCount] = React.useState("");
    const [banner, setBanner] = React.useState([]);
    const [categories, setCategories] = React.useState([]);


    const [userType, setUserType] = React.useState("");
    const [cartcount, setCartCount] = React.useState("");
    const [customerCareNumber, setCustomerCareNumber] = React.useState("");
    const [unreadCount, setUnreadCount] = React.useState("");

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
                        setCartCount(responseJson.data.cart_count)

                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);

                    });
            }
        });
    }

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                setUserType(JSON.parse(decryptData).user_type);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("lang_code", currentLanguage);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("programId", JSON.parse(decryptData).program_id);
                apiClient
                    .post(`${BASE_URL}/get-dashboard`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Dashboard:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Events.publish('mainMenu', responseJson.data.menu);
                            setHomeMenu(responseJson.data.home_menu);
                            setCustomerCareNumber(responseJson.data.helpdesk_number);
                            setCount(responseJson.data.eligable_count);
                            setUnreadCount(responseJson.data.unread_notification_count);
                            console.log("Unread_count Home:", responseJson.data.unread_notification_count);
                            const imageUrls = responseJson.data.banners.map(banner => banner.image);
                            setBanner(imageUrls);
                            setCategories(responseJson.data.categories);
                            setBanner(responseJson.data.banners);
                            getProfileData();
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
                        //console.log("Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const getProfileData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("for_dealer", "");
                apiClient
                    .post(`${BASE_URL}/view-profile`, formdata, {
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
                        //console.log("profile:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Events.publish('profileData', responseJson.data);
                            setProfileData(responseJson.data.profile);
                            setPoints(responseJson.data.available_point);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const openDialer = (number) => {

        Toast.show(number);


        const url = `tel:${number}`;
        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Toast.show(t("Dialer Not Available!"));

            }
        }).catch((err) => console.error('An error Occured', err))


    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="light-content" backgroundColor={baseColor} />
            <VStack flex={1} backgroundColor={lightColor}>
                <LinearGradient
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    colors={[baseColor, rareColor]}
                    style={{ padding: 15, position: 'relative' }}
                >
                    <HStack alignItems="center" justifyContent={'space-between'}>
                        <HStack space={4} alignItems="center" width={'60%'}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Icon name="menu" size={26} color={lightColor} />
                            </TouchableOpacity>
                            {/* <View style={[MainStyle.inputbox, { width: '100%' }]}>
                                <Input height={35} fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={text => setSearch(text)} placeholder={t('Search')} InputLeftElement={<Icon name="search-outline" size={18} color={darkColor} style={{ marginLeft: 10, textAlign: 'center' }} />} />
                            </View> */}
                        </HStack>
                        <HStack alignItems="center" space={3} paddingRight={1}>
                            {/* <TouchableOpacity onPress={() => navigation.navigate('Cart', { pageTitle: "My Cart" })}>
                                <Icon name="cart" size={22} color={lightColor} />
                                {cartcount > 0 && (
                                    <View style={{ position: 'absolute', backgroundColor: darkColor, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', top: -7, right: -7 }}>
                                        <Text style={{ color: lightColor, lineHeight: 14, fontSize: 12, fontWeight: 'bold' }}>{cartcount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity> */}
                            {/* <TouchableOpacity onPress={() => navigation.navigate('Notification', { pageTitle: "Notification" })}>
                                <Icon name="notifications" size={22} color={lightColor} />
                                <View style={{ position: 'absolute', backgroundColor: warningColor, borderRadius: 10, width: 15, height: 15, justifyContent: 'center', alignItems: 'center', top: -5, right: -5 }}>
                                    <Text style={{ color: darkColor, fontSize: 10, lineHeight: 12, fontWeight: 'bold' }}>0</Text>
                                </View>
                            </TouchableOpacity> */}
                        </HStack>
                    </HStack>
                </LinearGradient>

                <ScrollView>
                    <SliderBox
                        images={[require('../assets/images/watchOffer.png')]}
                        sliderBoxHeight={190}
                        dotColor="red"
                        inactiveDotColor="#90A4AE"
                        autoplay
                        circleLoop
                        resizeMethod={'resize'}
                        resizeMode={'cover'}
                        dotStyle={{
                            display: 'none'
                        }}
                        ImageComponentStyle={{ width: '100%', marginHorizontal: 0, left: 0, alignSelf: 'center' }}
                    />
                    <Stack paddingX={5}>
                        <VStack style={{ position: 'relative', top: -20, width: '100%', borderRadius: 22, borderColor: '#dddddd', borderWidth: 1 }} backgroundColor={lightColor}>
                            <HStack space={4} paddingY={2} paddingX={5} alignItems="center">
                                <Avatar borderColor={lightGrey} resizeMode="contain" borderWidth="2" size="70" source={profileData.profile_image == "" ? require('../assets/images/avatar.png') : { uri: profileData.profile_image }}></Avatar>
                                <VStack justifyContent="center" width={'70%'}>
                                    <Text color="#111111" fontSize="15" fontFamily={fontBold} textTransform={'capitalize'}>{profileData.name}</Text>
                                    <HStack space={2} alignItems="center">
                                        <Text color={baseColor} fontSize="xs" fontFamily={fontSemiBold}>{t("Member ID")}:</Text>
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontBold}>{profileData.userCode}</Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        <Stack style={{ marginTop: 5 }}>
                            <ScrollView automaticallyAdjustKeyboardInsets={true} horizontal showsHorizontalScrollIndicator={false}>
                                {banner.map((item, index) =>
                                    <TouchableOpacity key={index}>
                                        <Image source={{ uri: item.image }} style={{ width: 250, height: 150, marginRight: 20, resizeMode: 'cover', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: greyColor, backgroundColor: lightGrey }} />
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </Stack>
                        <LinearGradient
                            colors={[baseDarkColor, '#C5AAF8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                marginTop: 20,
                                flexDirection: 'row',
                                paddingVertical: 20,
                                paddingHorizontal: 20,
                                borderRadius: 20,
                                overflow: 'hidden',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                position: 'relative'
                            }}>
                            <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                            <Text fontFamily={fontBold} style={{ color: 'white', fontSize: 18 }}>{points} {t("points")}</Text>
                            <TouchableOpacity style={{ backgroundColor: 'white', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10, overflow: 'hidden' }} onPress={() => navigation.navigate('Performance', {pageTitle: t('My Performance')})}>
                                <Text fontFamily={fontBold} style={{ color: baseDarkColor, fontSize: 13 }}>{t("View Performance")}</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Stack>
                    <VStack space={5} marginTop={10}>
                        <HStack paddingX={8} justifyContent={'space-between'} alignItems={'center'}>
                            <Text color={darkColor} fontSize="md" fontFamily={fontBold}>{t("Rewards Category")}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("RewardsCategory", { pageTitle: t("Rewards Category") })} style={{ backgroundColor: baseColor, paddingVertical: 6, paddingHorizontal: 20, borderRadius: 30, overflow: 'hidden' }}>
                                <Text fontFamily={fontBold} style={{ color: lightColor, fontSize: 13 }}>{t("View All")}</Text>
                            </TouchableOpacity>
                        </HStack>
                        <HStack backgroundColor={"#DCE8FF"} padding={5} justifyContent={'space-between'}>
                            {categories.slice(0, 4).map((item, index) =>
                                <TouchableOpacity key={index} onPress={() => navigation.navigate("Rewards", { cateId: item.categoryId, cateName: item.categoryName })} style={{ width: 90 }}>
                                    <VStack justifyContent="center" alignItems="center">
                                        <Stack justifyContent="center" alignItems="center" style={{ backgroundColor: baseColor, borderRadius: 70, overflow: 'hidden', width: 70, height: 70, position: 'relative', zIndex: 9, paddingHorizontal: 5, marginBottom: 5 }}>
                                            <Image source={{ uri: item.categoryImage }} style={{ width: 70, height: 70, resizeMode: 'cover' }} />
                                        </Stack>
                                        <VStack justifyContent="center" alignItems="center">
                                            <Text color="#111111" fontSize="12" textAlign="center" fontWeight="bold">{item.categoryName}</Text>
                                        </VStack>
                                    </VStack>
                                </TouchableOpacity>
                            )}
                        </HStack>
                    </VStack>
                </ScrollView>

                <FooterComponents navigation={navigation} component={"Home"} />
            </VStack>
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

export default HomeScreen;