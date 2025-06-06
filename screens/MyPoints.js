import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { APP_VERSION, AccessToken, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import FooterComponents from '../components/Footer';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';


const MyPointsScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const [pointList, setPointList] = React.useState([]);
    const [searchTerms, setSearchTerms] = React.useState("");
    const [isReset, setIsReset] = React.useState(false);

    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);

    const [pageNumber, setPageNumber] = React.useState(1);
    const [totalPage, setTotalPage] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("");

    const [dateFilter, setDateFilter] = React.useState(false);
    const [fromDate, setFromDate] = React.useState("");
    const [toDate, setToDate] = React.useState("");
    const [dateType, setDateType] = React.useState("");
    const [userType, setUserType] = React.useState("");
    const [cartcount, setCartCount] = React.useState("");
    const [moreValue, setMoreValue] = React.useState("");

    const [availablePoints, setAvailablePoints] = React.useState("");

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
            getAllData(fromDate, toDate, route.params.filterType);
            setFilterStatus(route.params.filterType);
        });
        return unsubscribe;
    }, []);

    const getAllData = (startDate, endDate, typeData) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("programId", JSON.parse(decryptData).program_id);
                formdata.append("type", typeData);
                formdata.append("page", 1);
                formdata.append("from_date", (startDate == "" ? "" : moment(startDate).format("DD-MM-YYYY")));
                formdata.append("to_date", (endDate == "" ? "" : moment(endDate).format("DD-MM-YYYY")));
                apiClient
                    .post(`${BASE_URL}/point-statements`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        console.log("Points:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setPointList(responseJson.data.trnasc_list);
                            setTotalPage(responseJson.data.total_pages);
                            setAvailablePoints(responseJson.data.current_balance);
                        } else {
                            setLoading(false);
                            //Toast.show(responseJson.data.message, Toast.LONG);
                            setPointList([]);
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

    const showDatePicker = (type) => {
        setDateType(type);
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        if (dateType == "from") {
            setFromDate(date);
        } else if (dateType == "to") {
            setToDate(date);
        }
    };

    const onDateSearch = () => {
        if (fromDate == "") {
            Toast.show(t("Select From Date"), Toast.LONG);
        } else if (toDate == "") {
            Toast.show(t("Select To Date"), Toast.LONG);
        } else {
            setLoading(true);
            getAllData(fromDate, toDate);
            setIsReset(true);
        }
    }

    const onReset = () => {
        setLoading(true);
        getAllData("", "");
        setIsReset(false);
        setFromDate("");
        setToDate("");
    }

    const onMore = (val) => {
        setMoreValue(val);
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("app_ver", `${APP_VERSION}`);
                formdata.append("programId", JSON.parse(decryptData).program_id);
                formdata.append("type", filterStatus);
                formdata.append("page", num);
                formdata.append("from_date", (fromDate == "" ? "" : moment(fromDate).format("DD-MM-YYYY")));
                formdata.append("to_date", (toDate == "" ? "" : moment(toDate).format("DD-MM-YYYY")));
                apiClient
                    .post(`${BASE_URL}/point-statements`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setTotalPage(responseJson.data.total_pages);
                            setPageNumber(num);
                            let newArrya = pointList.concat(responseJson.data.trnasc_list);
                            setPointList(newArrya);
                        } else {
                            setLoading(false);
                            setPageNumber(1);
                            setPointList([]);
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
                navigation.navigate('Login');
            }
        });
    };

    const onChangeFilter = (type) => {
        setLoading(true);
        setFilterStatus(type);
        getAllData(fromDate, toDate, type);

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
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{t("Points History")}</Text>
                            <View>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text style={MainStyle.lable} fontSize="xs">{t("Filter By Date")}</Text>
                                    {isReset && (
                                        <Button size="xs" variant="link" onPress={() => onReset()}>
                                            <Text color={warningColor} fontFamily={fontBold} fontSize="sm">{t("Clear")}</Text>
                                        </Button>
                                    )}
                                </HStack>
                                <HStack style={MainStyle.inputbox} padding={1} justifyContent="space-between" alignItems="center">
                                    <Pressable width={'38%'} borderRadius={6} backgroundColor={lightGrey} onPress={() => showDatePicker("from")}>
                                        <HStack height={37} style={{ paddingHorizontal: 6 }} justifyContent="space-between" alignItems="center">
                                            <Text color={fromDate != '' ? '#111111' : '#999999'} fontSize="xs"> {fromDate != '' ? moment(fromDate).format('DD-MM-YYYY') : t("From Date")}</Text>
                                            <Icon name="calendar-outline" size={18} color={darkColor} />
                                        </HStack>
                                    </Pressable>
                                    <Pressable width={'38%'} borderRadius={6} backgroundColor={lightGrey} onPress={() => showDatePicker("to")}>
                                        <HStack height={37} style={{ paddingHorizontal: 6 }} justifyContent="space-between" alignItems="center">
                                            <Text color={toDate != '' ? '#111111' : '#999999'} fontSize="xs"> {toDate != '' ? moment(toDate).format('DD-MM-YYYY') : t("To Date")}</Text>
                                            <Icon name="calendar-outline" size={18} color={darkColor} />
                                        </HStack>
                                    </Pressable>
                                    <Button size="xs" style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 37, borderRadius: 10 }]} onPress={() => onDateSearch()}>
                                        <Text color={lightColor} fontFamily={fontSemiBold} fontSize="xs">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            </View>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                                maximumDate={new Date()}
                            />
                            {pointList.length == 0 && (
                                <VStack space={5} flex={1} justifyContent={'center'} alignItems={'center'}>
                                    <Image source={require('../assets/images/nodata.jpeg')} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                                </VStack>
                            )}
                            {pointList.length != 0 && (
                                <Stack space={7}>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Button variant="unstyled" style={{borderBottomWidth: 3, width: '28%', borderRadius: 0, borderColor: filterStatus == "" ? baseColor : lightColor}} onPress={() => onChangeFilter("")}>
                                            <Text color={darkColor} fontFamily={fontSemiBold} fontSize="sm">{t('All')}</Text>
                                        </Button>
                                        <Button variant="unstyled" style={{borderBottomWidth: 3, width: '28%', borderRadius: 0, borderColor: filterStatus == "C" ? baseColor : lightColor}} onPress={() => onChangeFilter("C")}>
                                            <Text color={darkColor} fontFamily={fontSemiBold} fontSize="sm">{t('Earned')}</Text>
                                        </Button>
                                        <Button variant="unstyled" style={{borderBottomWidth: 3, width: '28%', borderRadius: 0, borderColor: filterStatus == "D" ? baseColor : lightColor}} onPress={() => onChangeFilter("D")}>
                                            <Text color={darkColor} fontFamily={fontSemiBold} fontSize="sm">{t('Redeemed')}</Text>
                                        </Button>
                                    </HStack>
                                    <VStack backgroundColor={lightGrey} paddingX={3} paddingY={1} borderRadius={8} overflow="hidden">
                                        {pointList.map((item, index) =>
                                            <Stack key={index} borderBottomWidth={pointList.length - 1 ? 1.5 : 0} borderColor={greyColor}>
                                                <HStack paddingY={2} justifyContent="space-between" alignItems="center" backgroundColor={lightGrey} position="relative">
                                                    <VStack>
                                                        <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold}>{moment(item.created_at_date).format("DD MMMM YYYY")}, {item.created_at_time}</Text>
                                                        {item.transaction_type == "Credit" ?
                                                            <Text width={200} color={darkColor} fontSize="sm" fontFamily={fontBold}>{item.transaction_desc}</Text>
                                                            :
                                                            <Text color={darkColor} fontSize="sm" fontFamily={fontBold}>{t("Redeemed")}</Text>
                                                        }
                                                    </VStack>
                                                    <HStack space={1} alignItems="center">
                                                        <Text color={darkColor} fontSize="xs" fontFamily={fontBold}>{item.transaction_type == "Credit" ? "+" : "-"}{item.reward_points}</Text>
                                                        {item.transaction_type == "Credit" ?
                                                            <Icon name="arrow-up-outline" size={16} color={successColor} />
                                                            :
                                                            <Icon name="arrow-down-outline" size={16} color={dangerColor} />
                                                        }
                                                        {moreValue == item.id ?
                                                            <Pressable onPress={() => setMoreValue("")} style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 24, width: 25, paddingHorizontal: 7, borderRadius: 3 }]} variant="unstyled">
                                                                <Text color={lightColor} fontFamily={fontSemiBold} fontSize="lg" lineHeight={22}>-</Text>
                                                            </Pressable>
                                                            :
                                                            <Pressable onPress={() => onMore(item.id)} style={[MainStyle.solidbtn, { backgroundColor: baseColor, height: 24, width: 25, paddingHorizontal: 7, borderRadius: 3 }]} variant="unstyled">
                                                                <Text color={lightColor} fontFamily={fontSemiBold} fontSize="lg" lineHeight={22}>+</Text>
                                                            </Pressable>
                                                        }
                                                    </HStack>
                                                </HStack>
                                                {moreValue == item.id && (
                                                    <VStack space={0.5} backgroundColor={lightColor} padding={3} borderColor={greyColor} borderTopWidth={1.5}>
                                                        <Text color={darkColor} marginBottom={2} fontSize="sm" fontFamily={fontSemiBold}>{item.product_name}</Text>


                                                        <HStack alignItems="center" justifyContent="space-between">
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{item.subtype == "Redemption" ? t("Order ID") : t("Transaction ID")}</Text>
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{item.id}</Text>
                                                        </HStack>
                                                        {item.subtype != "Redemption" && (
                                                            <Stack>
                                                                <HStack alignItems="center" justifyContent="space-between">
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{t("Dealer")}</Text>
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{item.dealer}</Text>
                                                                </HStack>
                                                                <HStack alignItems="center" justifyContent="space-between">
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{t("Purchase Date")}</Text>
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{moment(item.purchase_date).format("DD-MM-YYYY")}</Text>
                                                                </HStack>

                                                                <HStack alignItems="center" justifyContent="space-between">
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{t("Bags")}</Text>
                                                                    <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{item.bags}</Text>
                                                                </HStack>
                                                            </Stack>
                                                        )}

                                                        <HStack alignItems="center" justifyContent="space-between">
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{item.subtype == "Redemption" ? t("Order Date") : t("Transaction Date")}</Text>
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{moment(item.created_at_date).format("DD-MM-YYYY")}</Text>
                                                        </HStack>
                                                        <HStack alignItems="center" justifyContent="space-between">
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontRegular}>{item.subtype == "Redemption" ? t("Order Time") : t("Transaction Time")}</Text>
                                                            <Text color={darkGrey} fontSize="xs" fontFamily={fontSemiBold} textAlign="right">{item.created_at_time}</Text>
                                                        </HStack>
                                                    </VStack>
                                                )}
                                            </Stack>
                                        )}
                                    </VStack>
                                </Stack>
                            )}
                            {pointList.length != 0 && pageNumber != totalPage && (
                                <HStack paddingY="3" paddingX="6" justifyContent="center">
                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                    </Button>
                                </HStack>
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

export default MyPointsScreen;