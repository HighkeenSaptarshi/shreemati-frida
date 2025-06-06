import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Actionsheet, useDisclose, Badge } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Pressable, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet, View, Platform } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import HeaderComponents from '../components/Header';
import Toast from 'react-native-simple-toast';
import FooterComponents from '../components/Footer';
import LinearGradient from 'react-native-linear-gradient';
import ImageView from "react-native-image-viewing";
import WebView from 'react-native-webview';
import Pdf from 'react-native-pdf';
import apiClient from '../api/apiClient';



const GalleryDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const [loading, setLoading] = React.useState(false);

    const [filterStatus, setFilterStatus] = React.useState(1);

    const [albums, setAlbums] = React.useState([]);

    const [allImages, setAllImages] = React.useState([]);
    const [albumName, setAlbumName] = React.useState("");

    const [imagePop, setImagePop] = React.useState(false);
    const [imageIndex, setImageIndex] = React.useState("");

    const images = [];

    const [isPDF, setIsPDF] = React.useState(false);
    const [isVideo, setIsVideo] = React.useState(false);
    const [sourcePDF, setSourcePDF] = React.useState("");
    const [sourceVideo, setSourceVideo] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData(filterStatus);
        });
        return unsubscribe;
    }, []);

    const getAllData = (type) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("album_id", route.params.albumId);
                formdata.append("contentType", route.params.albumType);
                apiClient
                    .post(`${BASE_URL}/get-album-details`, formdata, {
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
                        console.log("get_album_details:", JSON.stringify(responseJson.data));
                        if (responseJson.data.bstatus == 1) {
                            for (let i = 0; i < responseJson.data.album_details.length; i++) {
                                images.push(
                                    { view: responseJson.data.album_details[i].display_image, uri: responseJson.data.album_details[i].file_url, title: responseJson.data.album_details[i].title }
                                );
                            }
                            setAllImages(images);
                            setAlbumName(responseJson.data.album_name);
                        } else {
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("get_album_details Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const viewImage = (ind, url) => {
        if (route.params.albumType == 1) {
            setImagePop(true);
            setImageIndex(ind);
        } else if (route.params.albumType == 2) {
            setIsVideo(true);
            setSourceVideo(url);
        } else if (route.params.albumType == 3) {
            setIsPDF(true);
            setSourcePDF(url);
        }
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
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{route.params.albumName}</Text>
                            <HStack flexWrap="wrap" justifyContent={'space-between'} alignItems={'center'}>
                                {allImages.map((item, index) =>
                                    <VStack key={index} backgroundColor={lightGrey} style={{ width: '48%', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                                        <TouchableOpacity onPress={() => viewImage(index, item.uri)}>
                                            <Image source={{ uri: item.view }} style={{ width: '100%', height: 100 }} resizeMode='cover' />
                                            <Stack backgroundColor={baseColor} padding={1}>
                                                <Text fontFamily={fontBold} fontSize='sm' color={lightColor} textAlign="center">{item.title}</Text>
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
            <ImageView
                images={allImages}
                imageIndex={imageIndex}
                visible={imagePop}
                onRequestClose={() => setImagePop(false)}
            />
            {isVideo && (
                <View style={MainStyle.spincontainer}>
                    <TouchableOpacity onPress={() => setIsVideo(false)} style={{ position: "absolute", top: 12, right: 15, zIndex: 9 }}>
                        <Icon name="close-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={{ height: 450 }}>
                        <WebView
                            style={{ width: 400, maxWidth: '98%' }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            source={{ uri: sourceVideo }}
                        />
                    </View>
                </View>
            )}
            {isPDF && (
                <View style={MainStyle.spincontainer}>
                    <TouchableOpacity onPress={() => setIsPDF(false)} style={{ position: "absolute", top: 12, right: 15 }}>
                        <Icon name="close-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                    <Pdf
                        trustAllCerts={false}
                        source={{
                            uri: sourcePDF,
                            cache: true,
                        }}
                        style={styles.pdf} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    pdf: { width: '96%', height: '80%', marginHorizontal: '2%', marginTop: 10 }
});

export default GalleryDetailsScreen;