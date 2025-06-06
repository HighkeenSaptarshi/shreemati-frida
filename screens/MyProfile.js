import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, View } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorB, baseDarkColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FooterComponents from '../components/Footer';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';




const MyProfileScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const [loading, setLoading] = React.useState(false);

    const [profileData, setProfileData] = React.useState("");
    const [addressData, setAddressData] = React.useState("");
    const [workingAddressData, setWorkingAddressData] = React.useState("");

    const [profilePic, setProfilePic] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclose();

    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const today = new Date();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
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
                        console.log("profile:", JSON.stringify(responseJson.data));
                        if (responseJson.data.bstatus == 1) {
                            //Events.publish('profileData', responseJson.data.profile);
                            setProfileData(responseJson.data.profile);
                            setAddressData(responseJson.data.profile.address[0]);
                            if (responseJson.data.profile.working_address != null) {
                                setWorkingAddressData(responseJson.data.profile.working_address);
                            }
                        } else {
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
                navigation.replace('Intro');
            }
        });
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = date => {
        hideDatePicker();
        profileUpdate("", date);
    };

    const openProfilePicker = (type) => {
        onClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        profileUpdate(response.assets[0].base64, "");
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        profileUpdate(response.assets[0].base64, "");
                    }
                },
            )
        }
    }



    const profileUpdate = (imageVal, dateVal) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("profile_image", (imageVal != "" ? imageVal : ""));
                formdata.append("aniversery_date", (dateVal != "" ? moment(dateVal).format('YYYY-MM-DD') : ""));
                apiClient
                    .post(`${BASE_URL}/profile-update`, formdata, {
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
                        //console.log("Profile Update:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            getAllData();
                        } else {
                            Toast.show(responseJson.data.message, Toast.LONG);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            }
        })

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
                <Image source={require('../assets/images/Vectorshape.png')} style={{ width: width, resizeMode: 'cover', position: 'absolute', top: -50, left: 0 }} />
                <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                <Image source={require('../assets/images/mehndi.png')} style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', resizeMode: 'contain' }} />
                <VStack alignItems={'center'}>
                    <Box position="relative" style={{ marginTop: 20 }}>
                        <Avatar resizeMode="cover" size="110" source={profileData.profile_image == "" ? require('../assets/images/avatar.png') : { uri: profileData.profile_image }}></Avatar>
                        <Pressable onPress={onOpen} style={{ backgroundColor: darkColor, height: 35, width: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 30, position: 'absolute', bottom: -5, right: 0 }}>
                            <Icon name="camera-outline" size={20} color={lightColor} />
                        </Pressable>
                    </Box>
                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content>
                            <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                            <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                        </Actionsheet.Content>
                    </Actionsheet>
                    <VStack justifyContent="center" alignItems={'center'} marginY={18}>
                        <Text color={lightColor} fontSize="2xl" textTransform={'capitalize'} fontFamily={fontBold}>{profileData.name}</Text>
                        <HStack space={3} alignItems="center">
                            <Text color={lightColor} fontSize="md" fontFamily={fontBold}>{t("Member ID")}:</Text>
                            <Text color={lightColor} fontSize="md" fontFamily={fontBold}>{profileData.userCode}</Text>
                        </HStack>
                    </VStack>
                </VStack>
                <VStack flex={1} backgroundColor={lightColor} borderRadius={20} overflow={'hidden'}>
                    <ScrollView automaticallyAdjustKeyboardInsets={true}>
                        <VStack paddingX={5} space={5} paddingY={8}>
                            <Pressable style={{ marginVertical: 2 }} onPress={() => navigation.navigate('OpenProfile')}>
                                <LinearGradient
                                    colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                    <HStack justifyContent={'space-between'} alignItems={'center'}>
                                        <HStack space={3} alignItems={'center'}>
                                            <Icon name="person-outline" size={26} color={lightColor} />
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Personal Information")}</Text>
                                        </HStack>
                                        <Icon name="chevron-forward" size={22} color={lightColor} />
                                    </HStack>
                                </LinearGradient>
                            </Pressable>
                            <Pressable style={{ marginVertical: 2 }} onPress={() => navigation.navigate('DealerProfile')}>
                                <LinearGradient
                                    colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                    <HStack justifyContent={'space-between'} alignItems={'center'}>
                                        <HStack space={2} alignItems={'center'}>
                                            <Icon name="business-outline" size={26} color={lightColor} />
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Dealer Information")}</Text>
                                        </HStack>
                                        <Icon name="chevron-forward" size={22} color={lightColor} />
                                    </HStack>
                                </LinearGradient>
                            </Pressable>
                            {/* <Pressable style={{ marginVertical: 2 }} onPress={() => navigation.navigate('PointStatement', { pageTitle: t("Point Statement")})}>
                                <LinearGradient
                                    colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                    <HStack justifyContent={'space-between'} alignItems={'center'}>
                                        <HStack space={3} alignItems={'center'}>
                                            <Icon name="card-outline" size={26} color={lightColor} />
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Point Statement")}</Text>
                                        </HStack>
                                        <Icon name="chevron-forward" size={22} color={lightColor} />
                                    </HStack>
                                </LinearGradient>
                            </Pressable> */}
                            <Pressable style={{ marginVertical: 2 }} onPress={() => navigation.navigate('ChangeLanguage', { pageTitle: t("Change Language") })}>
                                <LinearGradient
                                    colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                    <HStack justifyContent={'space-between'} alignItems={'center'}>
                                        <HStack space={2} alignItems={'center'}>
                                            <Icon name="language-outline" size={26} color={lightColor} />
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("Change Language")}</Text>
                                        </HStack>
                                        <Icon name="chevron-forward" size={22} color={lightColor} />
                                    </HStack>
                                </LinearGradient>
                            </Pressable>
                            <Pressable style={{ marginVertical: 2 }} onPress={() => navigation.navigate('Performance', { pageTitle: t("My Performance") })}>
                                <LinearGradient
                                    colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                    <HStack justifyContent={'space-between'} alignItems={'center'}>
                                        <HStack space={2} alignItems={'center'}>
                                            <Icon name="trending-up-outline" size={26} color={lightColor} />
                                            <Text color="white" fontFamily={fontBold} fontSize="md">{t("My Performance")}</Text>
                                        </HStack>
                                        <Icon name="chevron-forward" size={22} color={lightColor} />
                                    </HStack>
                                </LinearGradient>
                            </Pressable>
                        </VStack>
                    </ScrollView>
                </VStack>
            </LinearGradient>
            <FooterComponents navigation={navigation} component={"Profile"} />
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

export default MyProfileScreen;