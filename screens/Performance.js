import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, BASE_URL, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import RenderHTML from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-gifted-charts';
import MonthPicker from 'react-native-month-year-picker';
import moment from 'moment';
import { TouchableOpacity } from 'react-native';
import apiClient from '../api/apiClient';

const PerformanceScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const { width, height } = useWindowDimensions();

    const [barData, setBarData] = React.useState([]);

    const [currentMonthYear, setCurrentMonthYear] = React.useState(new Date());
    const [dealer, setDealer] = React.useState("");
    const [dealerList, setDealerList] = React.useState([]);
    const [product, setProduct] = React.useState("");
    const [productList, setProductList] = React.useState([]);

    const [saleData, setSaleData] = React.useState("");

    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);

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
            getAllData(currentMonthYear, dealer, product);
        });
        return unsubscribe;
    }, []);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;

            hideDatePicker();
            setCurrentMonthYear(selectedDate);
            setLoading(true);
            setBarData([]);
            getAllData(selectedDate, dealer, product);
        }
    );

    const onSelectDealer = (val) => {
        setDealer(val);
        setLoading(true);
        setBarData([]);
        getAllData(currentMonthYear, val, product);
    }

    const onSelectProduct = (val) => {
        setProduct(val);
        setLoading(true);
        setBarData([]);
        getAllData(currentMonthYear, dealer, val);
    }

    const getAllData = (date, dealerId, productId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("date", moment(date).format('YYYY-MM'));
                formdata.append("dealer_id", dealerId);
                formdata.append("product_id", productId);
                apiClient
                    .post(`${BASE_URL}/get-sales-target`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("get-sales-target:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setDealerList(responseJson.data.dealers);
                            setProductList(responseJson.data.products);
                            if (responseJson.data.dealers.length == 1) {
                                setDealer(responseJson.data.dealers[0].id);
                            }
                            setSaleData(responseJson.data.data);
                            setBarData([{ value: responseJson.data.data.Target, frontColor: baseDarkColor }, { value: responseJson.data.data.Achievement, frontColor: successColor }]);
                        } else {
                            setLoading(false);
                            setDealerList([]);
                            setProductList([]);
                            setSaleData("");
                            setBarData([]);
                            Toast.show(responseJson.data.message, Toast.LONG);
                            if (responseJson.data.msg_code == "msg_0047") {
                                AsyncStorage.clear();
                                navigation.replace('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("get-sales-target Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.replace('Login');
            }
        });
    }

    const [date, setDate] = React.useState(new Date());
    const [show, setShow] = React.useState(false);

    const showPicker = useCallback((value) => setShow(value), []);

    const onValueChange = useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;

            showPicker(false);
            setDate(selectedDate);
        },
        [date, showPicker],
    );

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
                            <Stack padding={5} space={3} backgroundColor={lightGrey} borderRadius={15} overflow={'hidden'} marginBottom={3}>
                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                    <Text style={{ width: '20%' }} fontSize='sm' fontWeight="bold" color={darkColor}>{t("Month")}</Text>
                                    <Pressable style={[MainStyle.inputbox, { width: '78%' }]} onPress={() => showDatePicker()}>
                                        <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"} alignItems={'center'}>
                                            <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 15, marginRight: 10, textAlign: 'center' }} />
                                            <Text color={"#111111"} fontSize="md">{moment(currentMonthYear).format("MMMM, YYYY")}</Text>
                                        </HStack>
                                    </Pressable>
                                </HStack>
                                {isDatePickerVisible && (
                                    <MonthPicker
                                        onChange={handleConfirm}
                                        value={currentMonthYear}
                                        maximumDate={new Date()}
                                    />
                                )}
                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                    <Text style={{ width: '20%' }} fontSize='sm' fontWeight="bold" color={darkColor}>{t("Dealer")}</Text>
                                    <View style={[MainStyle.inputbox, { width: '78%' }]}>
                                        <Select variant="none" size="lg"
                                            placeholder={t("Select Dealer *")}
                                            InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                            selectedValue={dealer}
                                            onValueChange={value => onSelectDealer(value)}
                                            style={{ paddingLeft: 20, height: 45 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {dealerList.map((item, index) =>
                                                <Select.Item key={index} label={item.name} value={item.id} />
                                            )}
                                        </Select>
                                    </View>
                                </HStack>
                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                    <Text style={{ width: '20%' }} fontSize='sm' fontWeight="bold" color={darkColor}>{t("Product")}</Text>
                                    <View style={[MainStyle.inputbox, { width: '78%' }]}>
                                        <Select variant="none" size="lg"
                                            placeholder={t("Select Product")}
                                            InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                            selectedValue={product}
                                            onValueChange={value => onSelectProduct(value)}
                                            style={{ paddingLeft: 20, height: 45 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {productList.map((item, index) =>
                                                <Select.Item key={index} label={item.name} value={item.id} />
                                            )}
                                        </Select>
                                    </View>
                                </HStack>
                            </Stack>
                            {product != "" && (
                                <Stack space={5}>
                                    {(saleData != "[]" && saleData.outstanding_on != "") && (
                                        <VStack padding={5} space={3} backgroundColor={baseLightColor} borderRadius={15} overflow={'hidden'}>
                                            <Stack style={{ borderBottomWidth: 1, borderColor: baseDarkColor, paddingBottom: 10 }}>
                                                <Text fontSize='md' fontFamily={fontSemiBold} color={darkColor} textAlign={'center'}>{t("Outstanding Amount")}</Text>
                                                {saleData.outstanding_on != "" && (
                                                    <Text fontSize='sm' fontFamily={fontRegular} color={darkColor} textAlign={'center'}>({saleData.outstanding_on})</Text>
                                                )}
                                            </Stack>
                                            <Text fontSize='xl' fontFamily={fontBold} color={darkColor} textAlign={'center'}>{saleData.outstanding}</Text>
                                        </VStack>
                                    )}
                                    <LinearGradient
                                        colors={[baseDarkColor, baseDarkColor, '#C5AAF8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ paddingHorizontal: 15, paddingVertical: 10, position: 'relative', borderRadius: 8, overflow: 'hidden' }}
                                    >
                                        <Image source={require('../assets/images/header-round.png')} style={{ width: 150, height: 100, resizeMode: 'contain', position: 'absolute', top: 0, right: -30 }} />
                                        <Text color="white" fontFamily={fontBold} fontSize="md">{t("Target vs Actual")}</Text>
                                    </LinearGradient>
                                    {saleData != "[]" ?
                                        <Box>
                                            <VStack style={{ padding: 20 }} justifyContent={'center'} alignItems={'center'}>
                                                <HStack space={6} marginBottom={10} justifyContent={'center'} alignItems={'center'}>
                                                    <HStack space={2} alignItems={'center'}>
                                                        <View style={{ height: 20, width: 20, backgroundColor: baseDarkColor, borderRadius: 20, overflow: 'hidden' }} />
                                                        <Text style={{ color: '#666666' }}>{t("Target")}</Text>
                                                    </HStack>
                                                    <HStack space={2} alignItems={'center'}>
                                                        <View style={{ height: 20, width: 20, backgroundColor: successColor, borderRadius: 20, overflow: 'hidden' }} />
                                                        <Text style={{ color: '#666666' }}> {t("Actual")}</Text>
                                                    </HStack>
                                                </HStack>

                                                <BarChart data={barData} width={250} barWidth={80} />

                                                <VStack space={3} marginTop={5}>
                                                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'} backgroundColor={"#f3f3f3"} style={{ borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, width: '100%' }}>
                                                        <Text color='#555555' fontSize='sm'>{t("Product")}:</Text>
                                                        <Text width={200} backgroundColor={darkColor} textAlign={'right'} color='#111111' fontSize='sm' fontWeight="medium">{saleData.Product}</Text>
                                                    </HStack>
                                                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'} backgroundColor={"#f3f3f3"} style={{ borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, width: '100%' }}>
                                                        <Text color='#555555' fontSize='sm'>{t("Target")}:</Text>
                                                        <Text backgroundColor={darkColor} fontSize='sm' fontWeight="medium">{saleData.Target}</Text>
                                                    </HStack>
                                                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'} backgroundColor={"#f3f3f3"} style={{ borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, width: '100%' }}>
                                                        <Text color='#555555' fontSize='sm'> {t("Actual")}:</Text>
                                                        <Text backgroundColor={darkColor} fontSize='sm' fontWeight="medium">{saleData.Achievement}</Text>
                                                    </HStack>
                                                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'} backgroundColor={"#f3f3f3"} style={{ borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, width: '100%' }}>
                                                        <Text color='#555555' fontSize='sm'>{t("Achieve %:")}  </Text>
                                                        <Text backgroundColor={darkColor} fontSize='sm' fontWeight="medium">{saleData.Achieve} %</Text>
                                                    </HStack>
                                                </VStack>
                                            </VStack>
                                        </Box>
                                        :
                                        <VStack space={5} flex={1} justifyContent={'center'} alignItems={'center'}>
                                            <Image source={require('../assets/images/nodata.jpeg')} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                                        </VStack>
                                    }
                                </Stack>
                            )}
                        </VStack>
                    </ScrollView>
                </VStack>
            </LinearGradient >
            {loading && (
                <View style={MainStyle.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={warningColor} />
                </View>
            )}
        </NativeBaseProvider >
    );
};

/* const styles = StyleSheet.create({
}); */

export default PerformanceScreen;