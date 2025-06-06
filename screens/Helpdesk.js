import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, View, useWindowDimensions, Linking } from 'react-native';
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
import RenderHTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';


const ContactUsScreen = ({ navigation, route }) => {


    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [pageData, setPageData] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        let formdata = new FormData();
        formdata.append("contentCode", "Contact-Us_4");
        apiClient
            .post(`${BASE_URL}/get-general-content`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`
                },
            }).then(response => {
                return response;
            })
            .then(responseJson => {
                console.log("Content:", responseJson.data);
                if (responseJson.data.bstatus == 1) {
                    setLoading(false);
                    setPageData(responseJson.data.content_details);
                } else {
                    setLoading(false);
                    //Toast.show(responseJson.data.message);
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
                            <Image source={require('../assets/images/helpImg.png')} style={{ width: '100%', height: 250, resizeMode: 'cover' }} />
                            <Text fontSize="2xl" fontFamily={fontBold}>{t("For any queries")}</Text>
                            <Pressable onPress={() => Linking.openURL(`tel:${pageData.phone}`)}>
                                <LinearGradient
                                    colors={[baseDarkColor, '#C5AAF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                >
                                    <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                                    <HStack space={3}>
                                        <Box backgroundColor={lightColor} padding={2} width={60} height={60} borderRadius={50} overflow={'hidden'} alignItems={'center'} justifyContent={'center'}>
                                            <Icon name="call" size={42} color={baseColor} />
                                        </Box>
                                        <VStack>
                                            <Text fontSize="lg" fontFamily={fontBold} letterSpacing={2}>{t('Toll-Free Number')}</Text>
                                            <Text fontSize="20" fontFamily={fontBold} letterSpacing={2} color={lightColor}>{pageData.phone}</Text>
                                        </VStack>
                                    </HStack>
                                </LinearGradient>
                            </Pressable>
                            {pageData.email != "" && (
                                <Pressable onPress={() => Linking.openURL(`mailto:${pageData.email}`)}>
                                    <LinearGradient
                                        colors={[baseDarkColor, '#C5AAF8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 15, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
                                    >
                                        <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                                        <HStack space={3}>
                                            <Box backgroundColor={lightColor} padding={2} width={60} height={60} borderRadius={50} overflow={'hidden'} alignItems={'center'} justifyContent={'center'}>
                                                <Icon name="mail" size={42} color={baseColor} />
                                            </Box>
                                            <VStack>
                                                <Text fontSize="lg" fontFamily={fontBold} letterSpacing={2}>{t('Email Address')}</Text>
                                                <Text fontSize="20" fontFamily={fontBold} letterSpacing={2} color={lightColor}>{pageData.email}</Text>
                                            </VStack>
                                        </HStack>
                                    </LinearGradient>
                                </Pressable>
                            )}
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

export default ContactUsScreen;