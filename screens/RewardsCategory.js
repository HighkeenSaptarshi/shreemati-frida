import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Events from '../auth_provider/Events';
import { MainStyle, baseColor, baseColorB, baseColorC, baseDarkColor, baseLightColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, warningColor } from '../assets/MainStyle';
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



const RewardsCategoryScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = Dimensions.get('window');

    const [categories, setCategories] = React.useState([]);

    const [userType, setUserType] = React.useState("");

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
                setUserType(JSON.parse(decryptData).user_type);

                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("lang_code", currentLanguage);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("programId", JSON.parse(decryptData).program_id);
                formdata.append("categoryId", "");
                apiClient
                    .post(`${BASE_URL}/catalog/products`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("catalog:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setCategories(responseJson.data.categories);
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
                        //console.log("catalog Error:", error);
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
                            <HStack justifyContent={'space-between'} flexWrap={"wrap"}>
                                {categories.map((item, index) =>
                                    <TouchableOpacity key={index} onPress={() => navigation.navigate("Rewards", { cateId: item.categoryId, cateName: item.categoryName })} style={{ width: 90, marginVertical: 15 }}>
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
                </VStack>
            </LinearGradient>
            <FooterComponents navigation={navigation} component={"RewardsCategory"} />
            {loading && (
                <View style={MainStyle.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={warningColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

/* const styles = StyleSheet.create({
}); */

export default RewardsCategoryScreen;