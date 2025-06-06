import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose, Badge } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, View } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import FooterComponents from '../components/Footer';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';




const GalleryScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const [loading, setLoading] = React.useState(false);

    const [filterStatus, setFilterStatus] = React.useState(1);

    const [albums, setAlbums] = React.useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData(filterStatus);
            console.log("filterStatus: ", filterStatus);
            setFilterStatus(1);
        });
        return unsubscribe;
    }, []);

    const onSetFilter = (dataVal) => {
        setLoading(true);
        setFilterStatus(dataVal);
        getAllData(dataVal);
    }

    const getAllData = (type) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("contentType", type);
                console.log("formdata: ", formdata);
                apiClient
                    .post(`${BASE_URL}/get-gallery`, formdata, {
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
                        console.log("get-gallery:", JSON.stringify(responseJson.data));
                        if (responseJson.data.bstatus == 1) {
                            setAlbums(responseJson.data.gallery_list);
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
                <Image source={require('../assets/images/Vectorshape.png')} style={{ width: width, resizeMode: 'cover', position: 'absolute', top: -50, left: 0 }} />
                <Image source={require('../assets/images/footer-round.png')} style={{ width: 110, height: 70, resizeMode: 'contain', position: 'absolute', bottom: 0, left: 0 }} />
                <Image source={require('../assets/images/mehndi.png')} style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', resizeMode: 'contain' }} />
                <VStack flex={1} backgroundColor={lightColor} borderRadius={20} overflow={'hidden'}>
                    <ScrollView automaticallyAdjustKeyboardInsets={true}>
                        <VStack padding={5} space={5}>
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{route.params.pageTitle}</Text>
                            <HStack alignItems="center" justifyContent="space-evenly">
                                <Button size="xs" borderColor={filterStatus == "1" ? baseColor : lightColor} style={{ width: '30%', borderBottomWidth: 3 }} variant="link" _text={{ color: darkColor, fontSize: 12 }} onPress={() => onSetFilter("1")}>{t("Images")}</Button>
                                <Button size="xs" borderColor={filterStatus == "2" ? baseColor : lightColor} style={{ width: '30%', borderBottomWidth: 3 }} variant="link" _text={{ color: darkColor, fontSize: 12 }} onPress={() => onSetFilter("2")}>{t("Videos")}</Button>
                                <Button size="xs" borderColor={filterStatus == "3" ? baseColor : lightColor} style={{ width: '30%', borderBottomWidth: 3 }} variant="link" _text={{ color: darkColor, fontSize: 12 }} onPress={() => onSetFilter("3")}>{t("Documents")}</Button>
                            </HStack>
                            <HStack flexWrap="wrap" justifyContent={'space-between'} alignItems={'center'}>
                                {albums.map((item, index) =>
                                    <VStack key={index} backgroundColor={lightGrey} style={{ width: '48%', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate("GalleryDetails", { albumId: item.id, albumType: item.contentType, albumName: item.name})}>
                                            <Image source={{ uri: item.display_image }} style={{ width: '100%', height: 100 }} resizeMode='cover' />
                                            <Stack backgroundColor={baseColor} padding={1}>
                                                <Text fontFamily={fontBold} fontSize='sm' color={lightColor} textAlign="center">{item.name}</Text>
                                            </Stack>
                                        </TouchableOpacity>
                                    </VStack>
                                )}
                            </HStack>
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

export default GalleryScreen;