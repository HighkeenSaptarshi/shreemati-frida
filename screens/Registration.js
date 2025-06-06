import { Box, HStack, NativeBaseProvider, Text, VStack, Stack, Button, Avatar, Input, Select, Actionsheet, useDisclose } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Keyboard, Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AccessToken, APP_VERSION, BASE_URL, OS_TYPE, secretKey } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStyle, baseColor, baseDarkColor, baseLightColor, baseSemiColor, dangerColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, successColor, warningColor } from '../assets/MainStyle';
import Toast from 'react-native-simple-toast';
import HeaderComponents from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import apiClient from '../api/apiClient';

const RegistrationScreen = ({ navigation, route }) => {

    const { width, height } = useWindowDimensions();

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const scrollRef = React.useRef();

    const [currentStep, setCurrentStep] = React.useState(1);
    const [stepDone2, setStepDone2] = React.useState(false);
    const [stepDone3, setStepDone3] = React.useState(false);

    const [aadhaarNumber, setAadhaarNumber] = React.useState('');
    const [forOTP, setForOTP] = React.useState(false);
    const [otpValue, setOtpValue] = React.useState('');
    const [tranId, setTranId] = React.useState("");
    const [aadhaarVerifed, setAadhaarVerifed] = React.useState(false);
    const [panVerifed, setPanVerifed] = React.useState(false);
    const [panNumber, setPanNumber] = React.useState('');
    const [panDOB, setPanDOB] = React.useState('');
    const [fetchedDetails, setFetchedDetails] = React.useState('');
    const [dob, setDOB] = React.useState('');

    const [dobType, setDOBType] = React.useState('');

    const [permanentAdress, setPermanentAdress] = React.useState('');
    const [state, setState] = React.useState('');
    const [stateID, setStateID] = React.useState('');
    const [district, setDistrict] = React.useState('');
    const [districtID, setDistrictID] = React.useState('');
    const [pincode, setPincode] = React.useState('');

    const [successPop, setSuccessPop] = React.useState(false);

    const [selectIDProof, setSelectIDProof] = React.useState('');

    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const maxYear = new Date(year - 18, month, day);
    const miniYear = new Date(year - 100, month, day);

    const regexNum = /^[6-9]\d{9}$/;

    const [userId, SetUserId] = React.useState('');

    const [detailsData, SetDetailsData] = React.useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    setLanguage(val);
                }
            });
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        var CryptoJS = require('crypto-js');
        const decryptData = CryptoJS.AES.decrypt(route.params.registerUserToken, secretKey).toString(
            CryptoJS.enc.Utf8,
        );
        SetUserId(JSON.parse(decryptData).userCode);
        SetDetailsData(JSON.parse(decryptData));
    }, []);

    const onContinue = () => {
        var crntstp = currentStep + 1;
        setCurrentStep(crntstp);
        setStepDone2(true);
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    }

    const onSelectIDProof = (val) => {
        setSelectIDProof(val);
        setPanNumber("");
        setPanVerifed(false);
        setAadhaarNumber("");
        setAadhaarVerifed(false);
        setFetchedDetails("");
        setPanDOB("");
    }

    const getOTP = () => {
        Keyboard.dismiss()
        if (aadhaarNumber.trim() == '') {
            Toast.show(t("Please enter Aadhaar Number"), Toast.LONG);
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("aadhaarNumber", aadhaarNumber);
            formdata.append("lang_code", currentLanguage);
            apiClient
                .post(`${BASE_URL}/aadhaar/get-otp`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`
                    },
                }).then(response => {
                    return response;
                })
                .then(responseJson => {
                    setLoading(false);
                    //console.log("Get OTP:", responseJson.data);
                    if (responseJson.data.bstatus === 1) {
                        setForOTP(true);
                        setTranId(responseJson.data.tran_id);
                        Toast.show(responseJson.data.message, Toast.LONG);
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
    }

    const closeOTP = () => {
        setForOTP(false);
        setTranId("");
        setOtpValue("");
    }

    const verifyOTP = () => {
        Keyboard.dismiss()
        if (otpValue == '') {
            Toast.show(t("Please enter OTP"), Toast.LONG);
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("aadhaarNumber", aadhaarNumber)
            formdata.append("tran_id", tranId);
            formdata.append("otp", otpValue);
            formdata.append("lang_code", currentLanguage);
            apiClient
                .post(`${BASE_URL}/aadhaar/get-user-details`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`
                    },
                }).then(response => {
                    return response;
                })
                .then(responseJson => {
                    setLoading(false);
                    console.log("Verify OTP:", responseJson.data);
                    if (responseJson.databstatus == 1) {
                        setForOTP(false);
                        setOtpValue("");
                        setTranId("");
                        setAadhaarVerifed(true);
                        setFetchedDetails(responseJson.data.details);
                        setPincode(responseJson.data.details.pinCode);
                        setState(responseJson.data.details.stateName);
                        setStateID(responseJson.data.details.stateId);
                        setDistrict(responseJson.data.details.districtName);
                        setDistrictID(responseJson.data.details.districtId);
                        setPanNumber(responseJson.data.details.pan);
                        Toast.show(responseJson.data.message, Toast.LONG);
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
    }

    const verifyPAN = () => {
        Keyboard.dismiss()
        if (panNumber.trim() == '') {
            Toast.show(t("Please enter PAN Number"), Toast.LONG);
        } else if (panDOB == '') {
            Toast.show(t("Please select DOB same as PAN"), Toast.LONG);
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("panNumber", panNumber);
            formdata.append("dob", moment(panDOB).format('YYYY-MM-DD'));
            formdata.append("lang_code", currentLanguage);
            apiClient
                .post(`${BASE_URL}/pan/verify`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`
                    },
                }).then(response => {
                    return response;
                })
                .then(responseJson => {
                    setLoading(false);
                    //console.log("Verify PAN:", responseJson.data);
                    if (responseJson.data.bstatus == 1) {
                        setPanVerifed(true);
                        setFetchedDetails(responseJson.data.details);
                        setPincode(responseJson.data.details.pinCode);
                        setState(responseJson.data.details.stateName);
                        setStateID(responseJson.data.details.stateId);
                        setDistrict(responseJson.data.details.districtName);
                        setDistrictID(responseJson.data.details.districtId);
                        Toast.show(responseJson.data.message, Toast.LONG);
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
    }

    const showDatePicker = (type) => {
        setDatePickerVisibility(true);
        setDOBType(type);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = date => {
        hideDatePicker();
        if (dobType == "DOB") {
            setDOB(date);
        } else if (dobType == "panDOB") {
            setPanDOB(date);
        }
    };

    const searchPermanentPin = (type) => {
        if (pincode.trim() == "") {
            Toast.show(t("Please enter Permanent Pincode"), Toast.LONG);
        } else {
            setLoading(true);
            search(type);
        }
    }

    // Pincode
    const search = (pinType) => {
        let formdata = new FormData();
        formdata.append("pinCode", (pinType == "permanent" ? pincode : altPincode));
        formdata.append("lang_code", currentLanguage);
        apiClient
            .post(`${BASE_URL}/registration/get-location-by-pin-code`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`
                },
            }).then(response => {
                return response;
            })
            .then(responseJson => {
                setLoading(false);
                //console.log("Pincode:", responseJson.data);
                if (responseJson.data.bstatus == 1) {
                    Toast.show(responseJson.data.message, Toast.LONG);
                    if (pinType == "permanent") {
                        setState(responseJson.data.details[0].state_name);
                        setStateID(responseJson.data.details[0].state_id);
                        setDistrict(responseJson.data.details[0].city_name);
                        setDistrictID(responseJson.data.details[0].city_id);
                    } else {
                        setAltState(responseJson.data.details[0].state_name);
                        setAltStateID(responseJson.data.details[0].state_id);
                        setAltDistrict(responseJson.data.details[0].city_name);
                        setAltDistrictID(responseJson.data.details[0].city_id);
                    }
                } else {
                    Toast.show(responseJson.data.message, Toast.LONG);
                    if (pinType == "permanent") {
                        setState("");
                        setStateID("");
                        setDistrict("");
                        setDistrictID("");
                    } else {
                        setAltState("");
                        setAltStateID("");
                        setAltDistrict("");
                        setAltDistrictID("");
                    }
                }
            })
            .catch((error) => {
                setLoading(false);
                //console.log("Error:", error);
                Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
            });
    }

    const onNext = () => {
        Keyboard.dismiss();
        if (currentStep == 2) {
            if (selectIDProof == "") {
                Toast.show(t("Please select ID Proof as Aadhaar / PAN"), Toast.LONG);
            } else if (selectIDProof == 1 && !aadhaarVerifed) {
                Toast.show(t("Please Verify your Aadahar No."), Toast.LONG);
            } else if (selectIDProof == 2 && !panVerifed) {
                Toast.show(t("Please Verify your PAN No."), Toast.LONG);
            } else if (fetchedDetails.dob == "" && dob == "") {
                Toast.show(t("Please select your Date of Birth"), Toast.LONG);
            } else {
                var crntstp = currentStep + 1;
                setCurrentStep(crntstp);
                setStepDone3(true);
                scrollRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                });
            }
        }
    }

    const onSubmit = () => {
        if (pincode.trim() == "") {
            Toast.show(t("Please enter Permanent Pincode"), Toast.LONG);
        } else if (state == "") {
            Toast.show(t("State not found. Please search by Pincode"), Toast.LONG);
        } else if (district == "") {
            Toast.show(t("District not found. Please search by Pincode"), Toast.LONG);
        }
        else {
            setLoading(true);
            onRegistration();
        }
    }

    const onRegistration = () => {
        let formdata = new FormData();
        formdata.append("os_type", `${OS_TYPE}`);
        formdata.append("app_ver", `${APP_VERSION}`);
        formdata.append("lang_code", currentLanguage);
        formdata.append("mobile", detailsData.mobile);
        formdata.append("aadhaar", aadhaarNumber);
        formdata.append("pan", panNumber);
        formdata.append("name", (fetchedDetails.name == undefined ? "" : fetchedDetails.name));
        formdata.append("gender", (fetchedDetails.gender == "Male" ? "M" : "F"));
        formdata.append("dob", (fetchedDetails.dob == undefined ? dob : fetchedDetails.dob));
        formdata.append("address", fetchedDetails.address && fetchedDetails.address.trim() !== "" ? fetchedDetails.address : permanentAdress);
        formdata.append("pincode", pincode);
        formdata.append("stateId", stateID);
        formdata.append("districtId", districtID);
        formdata.append("city", district);
        formdata.append("parentId", detailsData.parent_contact_id);
        formdata.append("refmobile", "");
        formdata.append("refConId", "");
        apiClient
            .post(`${BASE_URL}/registration/submit`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`,
                    Useraccesstoken: detailsData.token
                },
            }).then(response => {
                return response;
            })
            .then(responseJson => {
                setLoading(false);
                console.log("Registration:", responseJson.data);
                if (responseJson.data.bstatus == 1) {
                    setSuccessPop(true);
                } else {
                    Toast.show(responseJson.data.message, Toast.LONG);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log("Error:", error);
                Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
            });
    }

    const onPrev = () => {
        var crntstp = currentStep - 1;
        setCurrentStep(crntstp);
        if (crntstp == 1) {
            setStepDone2(false);
        } else if (crntstp == 2) {
            setStepDone3(false);
        }
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    }

    const onOkay = () => {
        setSuccessPop(false);
        navigation.replace("Login");
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
                    <ScrollView automaticallyAdjustKeyboardInsets={true} ref={scrollRef}>
                        <VStack padding={5} space={5}>
                            <Text color={darkColor} marginBottom={2} fontFamily={fontBold} fontSize="lg">{t('Signup to create an account')}</Text>
                            <HStack style={{ backgroundColor: darkGrey, height: 1, marginTop: 15, marginBottom: 60 }} justifyContent="space-between" alignItems="center">
                                <Stack height={36} width={'32%'} alignItems="center">
                                    <Box style={[MainStyle.pagibox, { backgroundColor: baseDarkColor }]}>
                                        <Text color={lightColor} fontSize="md" textAlign="center" fontWeight="normal" lineHeight={35}><Icon name="checkmark-outline" size={20} /></Text>
                                    </Box>
                                    <Text color={darkColor} fontSize="xs" textAlign="center" fontWeight="normal" lineHeight={16}>{t("Dealer")}{"\n"}{t("Details")}</Text>
                                </Stack>
                                <Stack height={36} width={'32%'} alignItems="center">
                                    {!stepDone2 ?
                                        <Box style={[MainStyle.pagibox, { backgroundColor: lightGrey }]}>
                                            <Text color={darkGrey} fontSize="md" textAlign="center" fontWeight="normal" lineHeight={35}>2</Text>
                                        </Box>
                                        :
                                        <Box style={[MainStyle.pagibox, { backgroundColor: baseDarkColor }]}>
                                            <Text color={lightColor} fontSize="md" textAlign="center" fontWeight="normal" lineHeight={35}><Icon name="checkmark-outline" size={20} /></Text>
                                        </Box>
                                    }
                                    <Text color={darkColor} fontSize="xs" textAlign="center" fontWeight="normal" lineHeight={16}>{t("Personal")}{"\n"}{t("Information")}</Text>
                                </Stack>
                                <Stack height={36} width={'32%'} alignItems="center">
                                    {!stepDone3 ?
                                        <Box style={[MainStyle.pagibox, { backgroundColor: lightGrey }]}>
                                            <Text color={darkGrey} fontSize="md" textAlign="center" fontWeight="normal" lineHeight={35}>3</Text>
                                        </Box>
                                        :
                                        <Box style={[MainStyle.pagibox, { backgroundColor: baseDarkColor }]}>
                                            <Text color={lightColor} fontSize="md" textAlign="center" fontWeight="normal" lineHeight={35}><Icon name="checkmark-outline" size={20} /></Text>
                                        </Box>
                                    }
                                    <Text color={darkColor} fontSize="xs" textAlign="center" fontWeight="normal" lineHeight={16}>{t("Address")}{"\n"}{t("Details")}</Text>
                                </Stack>
                            </HStack>
                            {currentStep == 1 && (
                                <Stack space={3}>
                                    <View>
                                        <Text style={MainStyle.lable} fontSize="xs">{t("Dealer Name")} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Input value={detailsData.dealer_first_name + " " + detailsData.dealer_last_name} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={MainStyle.lable} fontSize="xs">{t("Dealer Code")} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Input value={detailsData.dealerCode} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={MainStyle.lable} fontSize="xs">{t("Dealer Phone")} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Input value={detailsData.dealer_mobile} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                        </View>
                                    </View>
                                </Stack>
                            )}
                            {currentStep == 2 && (
                                <Stack space={5}>
                                    <View>
                                        <Text style={MainStyle.lable} fontSize="xs">{t("Mobile Number")} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Input value={detailsData.mobile} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                        </View>
                                    </View>
                                    <Text color={dangerColor} fontSize="xs" fontWeight="normal"><Text fontWeight="bold">{t("Note :")}</Text> {t("Please fill  Aadhar or PAN details. This is mandatory.All auto-filled data will be fetched from KYC")}</Text>
                                    <View>
                                        <Text style={MainStyle.lable} fontSize="xs">{t("Aadhaar / PAN")} <Text color={dangerColor}>*</Text></Text>
                                        <View style={MainStyle.inputbox}>
                                            <Select variant="unstyled" size="md" height={43}
                                                selectedValue={selectIDProof}
                                                onValueChange={value => onSelectIDProof(value)}
                                                style={{ paddingLeft: 15 }}
                                                fontFamily={fontRegular}
                                                dropdownCloseIcon={<Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />}
                                                dropdownOpenIcon={<Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />}
                                                _selectedItem={{
                                                    backgroundColor: greyColor,
                                                    endIcon: <Icon name="checkmark-circle" size={20} color={successColor} style={{ right: 0, position: 'absolute' }} />
                                                }}>
                                                <Select.Item label="Aadhaar" value="1" />
                                                <Select.Item label="PAN" value="2" />
                                            </Select>
                                        </View>
                                    </View>
                                    {selectIDProof == 1 && (
                                        <View>
                                            <Text style={MainStyle.lable} fontSize="xs">{t("Aadhaar No.")} <Text color={dangerColor}>*</Text></Text>
                                            <View style={MainStyle.inputbox}>
                                                {!aadhaarVerifed ?
                                                    <Input fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={(text) => setAadhaarNumber(text)} placeholder={t("Please Enter Aadhaar No.")} maxLength={12} keyboardType='number-pad'
                                                        InputRightElement={
                                                            <Button size="xs" style={[MainStyle.solidbtn, { backgroundColor: baseDarkColor, height: 37, borderRadius: 10, marginRight: 4 }]} onPress={() => getOTP()}>
                                                                <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Verify")}</Text>
                                                            </Button>
                                                        }
                                                    />
                                                    :
                                                    <Input value={aadhaarNumber} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                }
                                            </View>
                                        </View>
                                    )}
                                    {selectIDProof == 2 && (
                                        <View>
                                            <Text style={MainStyle.lable} fontSize="xs">{t("PAN Details")} <Text color={dangerColor}>*</Text></Text>
                                            {!panVerifed ?
                                                <VStack space={3} style={[MainStyle.inputbox, { padding: 8 }]}>
                                                    <View style={MainStyle.inputbox}>
                                                        <Input fontFamily={fontRegular} size="md" variant="unstyled" textTransform={"uppercase"} onChangeText={(text) => setPanNumber(text)} placeholder={t("Please Enter PAN No.")} maxLength={10} />
                                                    </View>
                                                    <View style={MainStyle.inputbox}>
                                                        <Pressable style={styles.inputbox} onPress={() => showDatePicker("panDOB")}>
                                                            <HStack style={{ paddingHorizontal: 10, height: 43 }} alignItems="center" paddingY={Platform.OS == 'ios' ? '1.5' : '2.5'} justifyContent="space-between">
                                                                <Text color={panDOB != '' ? '#111111' : '#999999'} fontSize="sm"> {panDOB != "" ? moment(panDOB).format('DD-MM-YYYY') : t("Select DOB same as PAN")}</Text>
                                                                <Icon name="calendar-outline" size={18} color={rareColor} />
                                                            </HStack>
                                                        </Pressable>
                                                    </View>
                                                    <Button size="xs" style={[MainStyle.solidbtn, { backgroundColor: baseDarkColor, height: 37 }]} onPress={() => verifyPAN()}>
                                                        <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Verify")}</Text>
                                                    </Button>
                                                </VStack>
                                                :
                                                <View style={MainStyle.inputbox}>
                                                    <Input value={panNumber} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" textTransform={"uppercase"} readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                </View>
                                            }
                                            <DateTimePickerModal date={panDOB || undefined} maximumDate={today} minimumDate={miniYear} isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} />
                                        </View>
                                    )}
                                    {fetchedDetails != "" && (
                                        <Stack space={3} marginTop={3}>
                                            <View>
                                                <Text style={MainStyle.lable} fontSize="xs">{t("Name as per ID Proof")} <Text color={dangerColor}>*</Text></Text>
                                                <View style={MainStyle.inputbox}>
                                                    <Input value={fetchedDetails.name} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                </View>
                                            </View>
                                            <View>
                                                <Text style={MainStyle.lable} fontSize="xs">{t("Gender")} <Text color={dangerColor}>*</Text></Text>
                                                <View style={MainStyle.inputbox}>
                                                    <Input value={fetchedDetails.gender} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                </View>
                                            </View>
                                            <View>
                                                <Text style={MainStyle.lable} fontSize="xs">{t("Date of Birth")} <Text color={dangerColor}>*</Text></Text>
                                                <View style={MainStyle.inputbox}>
                                                    {fetchedDetails.dob != "" ?
                                                        <Input value={fetchedDetails.dob} backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                        :
                                                        <Pressable style={styles.inputbox} onPress={() => showDatePicker("DOB")}>
                                                            <HStack style={{ paddingHorizontal: 10, height: 43 }} alignItems="center" paddingY={Platform.OS == 'ios' ? '1.5' : '2.5'} justifyContent="space-between">
                                                                <Text color={dob != '' ? '#111111' : '#999999'} fontSize="sm"> {dob != '' ? moment(dob).format('DD-MM-YYYY') : ""}</Text>
                                                                <Icon name="calendar-outline" size={18} color={warningColor} />
                                                            </HStack>
                                                        </Pressable>
                                                    }
                                                </View>
                                            </View>
                                            <DateTimePickerModal date={dob || undefined} maximumDate={maxYear} minimumDate={miniYear} isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} />
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                            {currentStep == 3 && (
                                <Stack space={5}>
                                    <Text color={dangerColor} fontSize="xs" fontWeight="normal"><Text fontWeight="bold">{t("Note :")}</Text> {t("All auto-filled data fetched form as per Aadhaar/PAN")}</Text>
                                    <View style={{ marginTop: 5 }}>
                                        <Text style={{ color: darkColor, fontFamily: fontBold }} fontSize="md">{t("Permanent Address")}</Text>
                                        <Stack space={2} marginTop={3}>
                                            <View>
                                                <Text style={MainStyle.lable} fontSize="xs">{t("Address")} <Text color={dangerColor}>*</Text></Text>
                                                <View style={MainStyle.inputbox}>
                                                    {fetchedDetails.address ? (
                                                        <Input
                                                            backgroundColor={lightGrey}
                                                            multiline
                                                            fontFamily={fontRegular}
                                                            size="md"
                                                            variant="unstyled"
                                                            value={fetchedDetails.address}
                                                            readOnly
                                                            InputRightElement={
                                                                <Icon
                                                                    name="checkmark-circle"
                                                                    size={22}
                                                                    color={successColor}
                                                                    style={{ marginRight: 10, textAlign: 'center' }}
                                                                />
                                                            }
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={permanentAdress}
                                                            multiline
                                                            fontFamily={fontRegular}
                                                            size="md"
                                                            variant="unstyled"
                                                            placeholder="Please Enter Address"
                                                            onChangeText={(text) => setPermanentAdress(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                            {fetchedDetails.pinCode == "" && (
                                                <View>
                                                    <Text style={MainStyle.lable} fontSize="xs">{t("Pincode")} <Text color={dangerColor}>*</Text></Text>
                                                    <View style={MainStyle.inputbox}>
                                                        <Input value={pincode} fontFamily={fontRegular} size="md" variant="unstyled" onChangeText={(text) => setPincode(text)} placeholder={t("Please Enter Pincode")} keyboardType='number-pad'
                                                            InputRightElement={
                                                                <Button size="xs" style={[MainStyle.solidbtn, { backgroundColor: baseDarkColor, height: 37, borderRadius: 10, marginRight: 4 }]} onPress={() => searchPermanentPin("permanent")}>
                                                                    <Icon name="search" size={18} color={lightColor} />
                                                                </Button>
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                            {fetchedDetails.pinCode != "" && (
                                                <View>
                                                    <Text style={MainStyle.lable} fontSize="xs">{t("Pincode")} <Text color={dangerColor}>*</Text></Text>
                                                    <View style={MainStyle.inputbox}>
                                                        <Input backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" value={pincode} readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                    </View>
                                                </View>
                                            )}
                                            {district != "" && (
                                                <View>
                                                    <Text style={MainStyle.lable} fontSize="xs">{t("District")} <Text color={dangerColor}>*</Text></Text>
                                                    <View style={MainStyle.inputbox}>
                                                        <Input backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" value={district} readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                    </View>
                                                </View>
                                            )}
                                            {state != "" && (
                                                <View>
                                                    <Text style={MainStyle.lable} fontSize="xs">{t("State")} <Text color={dangerColor}>*</Text></Text>
                                                    <View style={MainStyle.inputbox}>
                                                        <Input backgroundColor={lightGrey} fontFamily={fontRegular} size="md" variant="unstyled" value={state} readOnly InputRightElement={<Icon name="checkmark-circle" size={22} color={successColor} style={{ marginRight: 10, textAlign: 'center' }} />} />
                                                    </View>
                                                </View>
                                            )}
                                        </Stack>
                                    </View>
                                </Stack>
                            )}

                            {currentStep == 1 ?
                                <VStack marginTop={5}>
                                    <Stack space={3} marginTop={5}>
                                        <Button style={[MainStyle.solidbtn, { backgroundColor: rareColor }]} onPress={() => onContinue()}>
                                            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Continue")}</Text>
                                        </Button>
                                    </Stack>
                                </VStack>
                                :
                                <HStack marginTop={5} justifyContent="space-between" alignItems="center">
                                    <Button style={styles.halfbtn} variant="unstyled" backgroundColor={greyColor} borderRadius={30} onPress={() => onPrev()}>
                                        <Text color={darkColor} fontFamily={fontSemiBold} fontSize="xs">{t("Previous")}</Text>
                                    </Button>
                                    {currentStep == 2 && (
                                        <Button style={[MainStyle.solidbtn, styles.halfbtn, { backgroundColor: rareColor }]} onPress={() => onNext()}>
                                            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Next")}</Text>
                                        </Button>
                                    )}
                                    {currentStep == 3 && (
                                        <Button style={[MainStyle.solidbtn, styles.halfbtn, { backgroundColor: rareColor }]} onPress={() => onSubmit()}>
                                            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Submit")}</Text>
                                        </Button>
                                    )}
                                </HStack>
                            }
                        </VStack>
                    </ScrollView>
                </VStack>
            </LinearGradient>
            {forOTP && (
                <View style={MainStyle.spincontainer}>
                    <VStack space={3} style={{ backgroundColor: lightColor, padding: 30, borderRadius: 12, width: '85%' }}>
                        <Text color={darkColor} fontFamily={fontBold} fontSize="lg" textAlign="center" marginBottom={3}>{t("Enter OTP & Verify")}</Text>
                        <Text color={successColor} fontFamily={fontSemiBold} fontSize="sm" textAlign="center" marginBottom={3}>{("OTP sent to Aadhaar linked number")}.</Text>
                        <VStack space={2}>
                            <Text style={MainStyle.lable} fontSize="sm">{t("OTP")} <Text color={darkGrey} fontSize="10">({t("To Verify Mobile No.")})</Text> <Text color={dangerColor}>*</Text></Text>
                            <HStack justifyContent="space-between">
                                <View style={[MainStyle.inputbox, { width: 180 }]}>
                                    <Input value={otpValue} secureTextEntry={true} fontFamily={fontRegular} size="md" variant="unstyled" placeholder={t("Enter OTP")} onChangeText={(text) => setOtpValue(text)} keyboardType='number-pad' maxLength={6} />
                                </View>
                                <Button variant="unstyled" onPress={() => getOTP()}>
                                    <Text color={rareColor} fontFamily={fontSemiBold} fontSize="sm">{t("Resend")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                        <Button marginTop={6} style={[MainStyle.solidbtn, { backgroundColor: rareColor }]} onPress={() => verifyOTP()}>
                            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Verify OTP")}</Text>
                        </Button>
                        <Button variant="unstyled" backgroundColor={greyColor} borderRadius={30} onPress={() => closeOTP()}>
                            <Text color={darkColor} fontFamily={fontSemiBold} fontSize="xs">{t("Close")}</Text>
                        </Button>
                    </VStack>
                </View>
            )}
            {successPop && (
                <View style={MainStyle.spincontainer}>
                    <VStack style={MainStyle.popbox} space={10}>
                        <Image source={require('../assets/images/check-green.gif')} style={{ width: 100, height: 100, resizeMode: 'contain', position: 'relative', marginTop: 30 }} />
                        <HStack space={5} justifyContent={'center'} alignItems={'center'} flexWrap={'wrap'}>
                            <Image source={require('../assets/images/SHREEMATI.png')} style={{ width: 100, height: 50, resizeMode: 'contain' }} />
                        </HStack>
                        <VStack justifyContent="center" alignItems="center">
                            <Text color={darkGrey} fontSize="sm" fontFamily={fontSemiBold} textAlign="center">{t("Thank you for registering with")}</Text>
                            <Text color={rareColor} fontSize="sm" fontFamily={fontBold}>Shreemati</Text>
                        </VStack>
                        <Button style={[MainStyle.solidbtn, { backgroundColor: rareColor }]} width={'100%'} onPress={() => onOkay()}>
                            <Text color={lightColor} fontFamily={fontSemiBold} fontSize="sm">{t("Okay")}</Text>
                        </Button>
                    </VStack>
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
    halfbtn: { width: '48%', height: 45 },
    fullbtn: { width: '100%', height: 45 }
});

export default RegistrationScreen;