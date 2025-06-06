import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Stack, Actionsheet, useDisclose, Select, Button, Slider } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AccessToken, API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID, secretKey } from '../auth_provider/Config';
import RangeSlider from 'react-native-range-slider-expo/src/RangeSlider';
import { useTranslation } from 'react-i18next';
import HeaderComponents from '../components/Header';
import FooterComponents from '../components/Footer';
import { baseColor, baseDarkColor, baseLightColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, MainStyle, rareColor, successColor, warningColor } from '../assets/MainStyle';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const RewardsStoreScreen = ({ navigation, route }) => {

    const { width, height } = Dimensions.get('window');

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [dataFound, setDataFound] = React.useState("");

    const [pageNumber, setPageNumber] = React.useState(1);
    const [isLoadMore, setIsLoadMore] = React.useState(true);
    const [allProducts, setAllProducts] = React.useState([]);
    const [inCart, setInCart] = React.useState("");
    const [allCategory, setAllCategory] = React.useState([]);

    const [cateId, setCateId] = React.useState(0);
    const [sortBy, setSortBy] = React.useState("");

    const { isOpen, onOpen, onClose } = useDisclose();
    const [pointRange, setPointRange] = React.useState("");
    const [fromValue, setFromValue] = React.useState("");
    const [toValue, setToValue] = React.useState("");

    const [userType, setUserType] = React.useState("");
    const [cartcount, setCartCount] = React.useState("");

    const [imageBase, setImageBase] = React.useState("");
    const [availablePoint, setAvailablePoint] = React.useState("");
    const [filtervalue, setFilterValue] = React.useState("");
    const [filteration, setFiltertion] = React.useState(false);

    const [canRedeem, setCanRedeem] = React.useState(0);
    const [canSubmitKYC, setCanSubmitKYC] = React.useState(0);
    const [canSubmitKYCText, setCanSubmitKYCText] = React.useState("");

    const [loadMoreShow, setLoadMoreShow] = React.useState(0);

    const [cateName, setCateName] = React.useState("");


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
            AsyncStorage.getItem('filterData').then(valFilt => {
                if (valFilt != null) {
                    const value = JSON.parse(valFilt);
                    setCateId(value.selectedCat);
                    setSortBy(value.sortBy);
                    setFromValue(value.fromValue);
                    setToValue(value.toValue);
                    getAllData(value.selectedCat, value.sortBy, value.fromValue, value.toValue);
                    setFiltertion(true);
                } else {
                    getAllData(route.params.cateId, sortBy, fromValue, toValue);
                    setCateId(route.params.cateId);
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (cate_Id, sort_By, from_Value, to_Value) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {

                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                setUserType(JSON.parse(decryptData).user_type);

                let formdata = new FormData();
                formdata.append("pageNumber", 1);
                formdata.append("categoryId", cate_Id);
                formdata.append("min", from_Value);
                formdata.append("max", to_Value);
                formdata.append("sort", sort_By);
                formdata.append("sort_by", "price");
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
                        console.log("Rewards:", responseJson.data);
                        setCanRedeem(responseJson.data.can_redeem);
                        setCanSubmitKYC(responseJson.data.can_submit_kyc);
                        setCanSubmitKYCText(responseJson.data.can_submit_kyc_text);
                        setCateName(responseJson.data.selectedCategory);
                        setAllCategory(responseJson.data.categories);
                        setPointRange(responseJson.data.minMax);
                        if (fromValue == "") {
                            setFromValue(responseJson.data.minMax.min);
                        }
                        if (toValue == "") {
                            setToValue(responseJson.data.minMax.max);
                        }
                        setAvailablePoint(responseJson.data.available_point);
                        if (responseJson.data.status == 'success') {
                            countCart();
                            setAllProducts(responseJson.data.products);
                            setLoadMoreShow(responseJson.data.more);
                            setImageBase(responseJson.data.BaseUrl);
                            setDataFound("found");
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setAllProducts([]);
                            setDataFound("notfound");
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Rewards Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const countCart = () => {
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
                        setLoading(false);
                        console.log("cartCount:", responseJson.data);
                        setCartCount(responseJson.data.cart_count);
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);

                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const openFilter = (type) => {
        setFilterValue(type)
        onOpen();
    }

    const onApply = () => {
        setLoading(true);
        onClose();
        getAllData(cateId, sortBy, fromValue, toValue);
        const filterData = {
            sortBy: sortBy,
            fromValue: fromValue,
            toValue: toValue,
            selectedCat: cateId,
        };
        //AsyncStorage.setItem('filterData', JSON.stringify(filterData));
        setFiltertion(true);
    }

    const onClear = () => {
        setLoading(true);
        onClose();
        setPageNumber(1);
        setIsLoadMore(true);
        setFiltertion(false);
        if (filtervalue == "Category") {
            setCateId(route.params.cateId);
            getAllData(route.params.cateId, sortBy, fromValue, toValue);
        } else if (filtervalue == "Sort") {
            setSortBy("");
            getAllData(cateId, "", fromValue, toValue);
        } else if (filtervalue == "Points") {
            setFromValue(pointRange.min);
            setToValue(pointRange.max);
            getAllData(cateId, sortBy, pointRange.min, pointRange.max);
        }
    }

    const AddToCard = (prod_idd, price_in_pointss, prod_namee) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                const formdata = new FormData();
                formdata.append("prod_id", prod_idd);
                formdata.append("price_in_points", price_in_pointss);
                formdata.append("prod_name", prod_namee);
                formdata.append("quantity", 1);
                apiClient
                    .post(`${BASE_URL}/cart/adds`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            Useraccesstoken: JSON.parse(decryptData).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then(responseJson => {
                        Toast.show({ description: t(responseJson.data.message) });
                        if (responseJson.data.bstatus == 1) {
                            countCart();
                        } else {
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);

                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const AddToWish = ({ item, index }) => {

    }

    const renderProduct = ({ item, index }) => {
        return (
            <VStack key={index} style={styles.productbox}>
                <VStack space={1} style={{ position: 'absolute', top: 5, right: 5, zIndex: 99, backgroundColor: lightColor, padding: 3 }}>
                    {/* <TouchableOpacity onPress={() => AddToWish(item.productId, item.pricePoints, item.productName)} >
                        <Icon name="heart-outline" size={24} color={darkGrey} />
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={() => AddToCard(item.productId, item.pricePoints, item.productName)} >
                        <Icon name="add-circle-outline" size={24} color={baseDarkColor} />
                    </TouchableOpacity> */}
                </VStack>

                <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", {
                    detaildata: item.ProductDesc,
                    productname: item.productName,
                    productID: item.productId,
                    pricePoint: item.pricePoints,
                    availablepoint: availablePoint,
                    productimage: imageBase + item.ProductImage,
                    productParams: item.ProductParams
                }
                )}>
                    <Box style={styles.productimage}>
                        <Image source={{ uri: imageBase + item.ProductImage }} style={{ width: '100%', height: 150 }} resizeMode='contain' />
                    </Box>
                    <Text fontFamily={fontRegular} fontSize='xs'>{item.productName.substring(0, 30)}</Text>
                    <Text fontFamily={fontBold} fontSize='sm' color={darkColor}>{item.pricePoints} {t("points")}</Text>
                    <Text fontFamily={fontBold} style={{ textDecorationLine: 'underline' }} fontSize='xs' color={baseDarkColor}>{t("View Details")}</Text>
                </TouchableOpacity>
            </VStack>
        );
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        console.log(num);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {

                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);

                let formdata = new FormData();
                formdata.append("pageNumber", num);
                formdata.append("categoryId", cateId);
                formdata.append("min", fromValue);
                formdata.append("max", toValue);
                formdata.append("sort", sortBy);
                formdata.append("sort_by", "price");
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
                        console.log("jegjhgwergewjr", responseJson.data);
                        setLoadMoreShow(responseJson.data.more);
                        if (responseJson.data.status == 'success') {
                            setLoading(false);
                            let newArrya = allProducts.concat(responseJson.data.products);
                            setAllProducts(newArrya);
                            setPageNumber(num);
                        } else {
                            setLoading(false);
                            setIsLoadMore(false);
                            setPageNumber(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Rewards Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const onClearAllFilter = () => {
        setLoading(true);
        setSortBy("");
        setFromValue(pointRange.min);
        setToValue(pointRange.max);
        getAllData(route.params.cateId, "", pointRange.min, pointRange.max);
        setFiltertion(false);
        setCateId(route.params.cateId);
        AsyncStorage.removeItem('filterData');
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor={baseLightColor} />
            <HeaderComponents component="RewardsStore" navigation={navigation} cartcount={cartcount} />
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
                            <Text fontFamily={fontBold} color={darkColor} fontSize={'xl'}>{cateName}</Text>
                            {filteration && (
                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                    <HStack flexWrap="wrap" space={2}>
                                        <HStack style={{ backgroundColor: greyColor }} space={2} paddingX={2} paddingY={1} borderRadius={5} overflow="hidden">
                                            <Text fontSize='xs' color={darkColor} fontWeight="bold">{t("Clear Filter")}</Text>
                                            <Icon onPress={() => onClearAllFilter()} name="close-outline" size={18} color={darkColor} />
                                        </HStack>
                                    </HStack>
                                </HStack>
                            )}
                            {dataFound == "notfound" && (
                                <VStack space={5} flex={1} justifyContent={'center'} alignItems={'center'}>
                                    <Image source={require('../assets/images/nodata.jpeg')} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                                </VStack>
                            )}
                            {dataFound == "found" && (
                                <HStack flexWrap="wrap">
                                    <FlatList
                                        scrollEnabled={false}
                                        data={allProducts}
                                        renderItem={renderProduct}
                                        numColumns={2}
                                    />
                                </HStack>
                            )}
                            {loadMoreShow !== 0 && (
                                <HStack paddingY="3" paddingX="6" justifyContent="center">
                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                    </Button>
                                </HStack>
                            )}
                        </VStack>
                    </ScrollView>
                    <Stack>
                        <HStack justifyContent="space-evenly" backgroundColor={baseDarkColor}>
                            <Pressable onPress={() => openFilter("Category")}>
                                <HStack space={2} alignItems="center" padding={3}>
                                    <Icon name="grid-outline" size={18} color={lightColor} />
                                    <Text fontWeight="bold" fontSize='xs' color={lightColor}>{t("Category Type")}</Text>
                                </HStack>
                            </Pressable>
                            <Pressable onPress={() => openFilter("Sort")} style={{ borderColor: '#ffffff', borderLeftWidth: 1, borderRightWidth: 1 }}>
                                <HStack space={2} alignItems="center" padding={3}>
                                    <Icon name="filter-outline" size={18} color={lightColor} />

                                    <HStack space={1} alignItems="baseline">
                                        <Text fontWeight="bold" fontSize='xs' color={lightColor}>{t("Sort By")}</Text>
                                        <Text fontSize='10' color={lightColor}>{sortBy}</Text>

                                    </HStack>
                                </HStack>
                            </Pressable>
                            <Pressable onPress={() => { openFilter("Points"); }}>
                                <HStack space={2} alignItems="center" padding={3}>
                                    <Icon name="funnel-outline" size={18} color={lightColor} />
                                    <Text fontWeight="bold" fontSize='xs' color={lightColor}>{t("Filter By Points")}</Text>
                                </HStack>
                            </Pressable>
                        </HStack>
                        <HStack justifyContent="space-between" padding={4} backgroundColor="#ffffff">
                            <Text fontWeight="bold" fontSize='md' color={darkColor}>{t("Available Points")}</Text>
                            <Text fontWeight="bold" fontSize='md' color={darkColor}>{availablePoint ? availablePoint : ""}</Text>
                        </HStack>
                    </Stack>
                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content>
                            <ScrollView style={{ width: '100%', paddingHorizontal: 15 }}>
                                {filtervalue == "Category" && (
                                    <VStack space={1} marginBottom={2}>
                                        <Text style={MainStyle.lable} fontSize="xs">{t('Category')} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Select
                                                variant="unstyled"
                                                size="md"
                                                height={43}
                                                selectedValue={cateId}
                                                onValueChange={value => setCateId(value)}
                                                style={{ paddingLeft: 15 }}
                                                placeholder={t('Select')}
                                                fontFamily={fontRegular}
                                                dropdownCloseIcon={
                                                    <Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />
                                                }
                                                dropdownOpenIcon={
                                                    <Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />
                                                }
                                                _selectedItem={{
                                                    backgroundColor: greyColor,
                                                    endIcon: (
                                                        <Icon name="checkmark-circle" size={20} color={successColor} style={{ right: 0, position: 'absolute' }} />
                                                    ),
                                                }}>
                                                {allCategory.map((item, index) => (
                                                    <Select.Item key={index} label={item.categoryName} value={item.categoryId} />
                                                ))}
                                            </Select>
                                        </View>
                                    </VStack>
                                )}
                                {filtervalue == "Sort" && (
                                    <VStack space={1} marginBottom={2}>
                                        <Text style={MainStyle.lable} fontSize="xs">{t('Sort By')} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Select
                                                variant="unstyled"
                                                size="md"
                                                height={43}
                                                selectedValue={sortBy}
                                                onValueChange={value => setSortBy(value)}
                                                style={{ paddingLeft: 15 }}
                                                placeholder={t('Select')}
                                                fontFamily={fontRegular}
                                                dropdownCloseIcon={
                                                    <Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />
                                                }
                                                dropdownOpenIcon={
                                                    <Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />
                                                }
                                                _selectedItem={{
                                                    backgroundColor: greyColor,
                                                    endIcon: (
                                                        <Icon name="checkmark-circle" size={20} color={successColor} style={{ right: 0, position: 'absolute' }} />
                                                    ),
                                                }}>
                                                <Select.Item label={t("Low to High")} value="l-h" />
                                                <Select.Item label={t("High to Low")} value="h-l" />
                                            </Select>
                                        </View>
                                    </VStack>
                                )}
                                {filtervalue == "Points" && (
                                    <VStack space={1}>
                                        <Text textAlign="center" mt="5" fontWeight="bold">{t("Points Range")} ({fromValue} - {toValue})</Text>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <RangeSlider min={+pointRange.min} max={+pointRange.max} step={100}
                                                fromValueOnChange={(value) => setFromValue(value)}
                                                toValueOnChange={(value) => setToValue(value)}
                                                initialFromValue={+fromValue}
                                                initialToValue={+toValue}
                                                fromKnobColor={'#111111'}
                                                toKnobColor={'#111111'}
                                                knobSize={25}
                                                barHeight={8}
                                                showValueLabels={false}
                                                valueLabelsBackgroundColor='#444444'
                                                inRangeBarColor={darkColor}
                                            />
                                        </HStack>
                                    </VStack>
                                )}
                            </ScrollView>
                            <HStack width="100%" paddingY="3" paddingX="6" mt={5} justifyContent="space-between">
                                <Button variant={"outline"} width='48%' borderRadius={30} overflow="hidden" onPress={() => onClear()}>
                                    <Text color={rareColor} fontSize="md" fontWeight="normal">{t("Clear Filter")}</Text>
                                </Button>
                                <Button backgroundColor={rareColor} width='48%' borderRadius={30} overflow="hidden" onPress={() => onApply()}>
                                    <Text color="#ffffff" fontSize="md" fontWeight="normal">{t("Apply")}</Text>
                                </Button>
                            </HStack>
                        </Actionsheet.Content>
                    </Actionsheet>
                </VStack>
            </LinearGradient>
            {canRedeem === 1 && (
                <View style={MainStyle.spincontainer}>
                    <Stack backgroundColor="#ffffff" style={{ width: '70%', borderRadius: 10, overflow: 'hidden' }}>
                        <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Image source={require('../assets/images/logo.png')} style={MainStyle.logo} />
                            <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color={warningColor}>{canSubmitKYC == 0 ? t('Pending') : t('Warning')}!</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{canSubmitKYCText}</Text>
                            {canSubmitKYC == 1 && (
                                <Button
                                    size="sm"
                                    style={{
                                        backgroundColor: warningColor,
                                        width: 150,
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                    }}
                                    onPress={() => navigation.navigate("UpdateKYC", { pageTitle: t("Update KYC") })}
                                    marginY={4}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">
                                        {t("Update")}
                                    </Text>
                                </Button>
                            )}
                            <Button
                                size="sm"
                                style={{
                                    backgroundColor: '#111111',
                                    width: 150,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                }}
                                onPress={() => navigation.goBack()}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">
                                    {t('Close')}
                                </Text>
                            </Button>
                        </VStack>
                    </Stack>
                </View>
            )}
            {loading && (
                <View style={MainStyle.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={warningColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    productbox: { position: 'relative', width: '44%', marginHorizontal: '3%', marginBottom: '6%', overflow: 'hidden' },
    productimage: { borderColor: '#eeeeee', backgroundColor: '#ffffff', marginBottom: 10, borderWidth: 1, borderRadius: 5, width: '100%', height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
});

export default RewardsStoreScreen;