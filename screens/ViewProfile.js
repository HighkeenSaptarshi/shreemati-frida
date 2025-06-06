import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, StatusBar, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorC, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const ViewProfileScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
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
                                navigation.replace('Intro');
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
            <HeaderComponents navigation={navigation} />
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
                    </Box>
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
                            <VStack style={MainStyle.inputbox} padding={3} space={2}>
                                <Text style={[MainStyle.lable, { color: darkColor, fontFamily: fontBold }]} fontSize="xs">{t("Personal Details")}</Text>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Mobile Number")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.mobile}</Text>
                                </HStack>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Date of Birth")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.dob}</Text>
                                </HStack>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Gender")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.gender}</Text>
                                </HStack>
                                {/* <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Date of Anniversary")}:</Text>
                                {profileData.anniversary == "N/A" ?
                                    <Pressable style={[MainStyle.solidbtn, { backgroundColor: warningColor, height: 30, paddingHorizontal: 15 }]} variant="unstyled" onPress={() => showDatePicker()}>
                                        <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm" lineHeight={29}>{t("Edit")}</Text>
                                    </Pressable>
                                    :
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{moment(profileData.anniversary).format('DD MMM, YYYY')}</Text>
                                }
                            </HStack>
                            <DateTimePickerModal maximumDate={today} isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} /> */}
                            </VStack>
                            <VStack style={MainStyle.inputbox} padding={3} space={2}>
                                <Text style={[MainStyle.lable, { color: darkColor, fontFamily: fontBold }]} fontSize="xs">{t("Permanent Address")}</Text>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Address")}:</Text>
                                    <Text width={180} color={baseColorC} fontSize="xs" fontFamily={fontBold} textAlign="right">{addressData.line1}</Text>
                                </HStack>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Pincode")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{addressData.post_code}</Text>
                                </HStack>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("District")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{addressData.city}</Text>
                                </HStack>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("State")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{addressData.state}</Text>
                                </HStack>
                            </VStack>
                            {workingAddressData != "" && (
                                <VStack style={MainStyle.inputbox} padding={3} space={2}>
                                    <Text style={[MainStyle.lable, { color: darkColor, fontFamily: fontBold }]} fontSize="xs">{t("Working Address")}</Text>
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Address")}:</Text>
                                        <Text width={180} color={baseColorC} fontSize="xs" fontFamily={fontBold} textAlign="right">{workingAddressData.line1}</Text>
                                    </HStack>
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Pincode")}:</Text>
                                        <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{workingAddressData.post_code}</Text>
                                    </HStack>
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("District")}:</Text>
                                        <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{workingAddressData.city}</Text>
                                    </HStack>
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("State")}:</Text>
                                        <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{workingAddressData.state}</Text>
                                    </HStack>
                                </VStack>
                            )}
                            <VStack style={MainStyle.inputbox} padding={3} space={2}>
                                <Text style={[MainStyle.lable, { color: darkColor, fontFamily: fontBold }]} fontSize="xs">{t("KYC Details")}</Text>
                                <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Status")}:</Text>
                                    <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.kyc_status}</Text>
                                </HStack>
                                {profileData.aadhaar_number != "N/A" && (
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("Aadhaar Number")}:</Text>
                                        <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.aadhaar_number}</Text>
                                    </HStack>
                                )}
                                {profileData.pan_number != "N/A" && (
                                    <HStack backgroundColor={lightGrey} borderRadius={6} alignItems="center" justifyContent="space-between" padding="2">
                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{t("PAN Number")}:</Text>
                                        <Text color={baseColorC} fontSize="xs" fontFamily={fontBold}>{profileData.pan_number}</Text>
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

export default ViewProfileScreen;