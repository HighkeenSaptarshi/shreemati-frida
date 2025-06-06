import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import RenderHTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const TermsConditionsScreen = ({ navigation, route }) => {

    const { width, height } = useWindowDimensions();

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
        formdata.append("contentCode", "Terms-and-Conditions_23");
        apiClient
            .post(`${BASE_URL}/get-general-content`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`,
                },
            }).then(response => {
                console.log('RESSS: ', response);
                return response;
            })
            .then(responseJson => {
                setLoading(false);
                console.log('responseJson: ', responseJson.data);
                Toast.show(responseJson.data.message, Toast.LONG);
                if (responseJson.data.bstatus == 1) {
                    setLoading(false);
                    setPageData(responseJson.data.content_details.article_detail);
                }
            })
            .catch(error => {
                //console.log('error', error);
                Toast.show(t("Secure connection error or network issue! Please try again later."), Toast.LONG);
            });
    }
    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="Terms & Conditions" navigation={navigation} />
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
                            <RenderHTML contentWidth={width} baseStyle={{ color: '#444444', fontSize: 14 }} source={{ html: pageData }} />
                        </VStack>
                    </ScrollView>
                </VStack>
                <Button variant="unstyled" marginTop={3} onPress={() => navigation.goBack()}>
                    <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t('Back')}</Text>
                </Button>
            </LinearGradient>
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

export default TermsConditionsScreen;