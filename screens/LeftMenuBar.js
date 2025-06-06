import { Avatar, Box, Button, HStack, NativeBaseProvider, Pressable, Stack, Text, VStack, View } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Linking, ScrollView, Dimensions, StyleSheet } from 'react-native';
import Events from '../auth_provider/Events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { MainStyle, baseColor, baseColorC, baseDarkColor, baseLightColor, darkColor, darkGrey, fontBold, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey, rareColor, warningColor } from '../assets/MainStyle';
import { AccessToken, BASE_URL } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const LeftMenuBarScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const [mainMenu, setMainMenu] = React.useState([]);
    const [userData, setUserData] = React.useState("");
    const [state, setState] = React.useState("");
    const [points, setPoints] = React.useState("");
    const { width, height } = Dimensions.get('window');
    const [token, setToken] = React.useState("");

    useEffect(() => {
        Events.subscribe('mainMenu', (data) => {
            setMainMenu(data);
        });
        Events.subscribe('profileData', (data) => {
            setUserData(data.profile);
            setPoints(data.available_point);
            setState(data.profile.address[0].state);
        });
        Events.subscribe('points', (data) => {
            setPointData(data);
        });
        Events.subscribe('token', (data) => {
            setToken(data);
        });
    }, []);

    const onLogout = () => {
        console.log(token);
        console.log(`${AccessToken}`);
        Alert.alert(
            t("Alert"),
            t("Are you sure to logout") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        apiClient
                            .post(`${BASE_URL}/log-out`, "", {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    accesstoken: `${AccessToken}`,
                                    Useraccesstoken: token
                                },
                            }).then(response => {
                                return response;
                            })
                            .then(responseJson => {
                                setLoading(false);
                                console.log("Logout:", responseJson.data);
                                navigation.closeDrawer();
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                                setLanguage('Eng');
                            })
                            .catch((error) => {
                                setLoading(false);
                                console.log("Error:", error);
                            });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    return (
        <NativeBaseProvider>
            <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                colors={[baseColor, rareColor]}
                flex={1}
                style={{ position: 'relative' }}
            >
                <Image source={require('../assets/images/mehndi.png')} style={{ position: 'absolute', height: 200, bottom: 0, right: 0, width: '100%', resizeMode: 'contain' }} />
                <LinearGradient
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    colors={[baseColor, baseDarkColor]}
                    style={{ padding: 10, position: 'relative', borderBottomRightRadius: 100, overflow: 'hidden', borderColor: lightColor, borderBottomWidth: 5, borderRightWidth: 5 }}
                >
                    <HStack space={3} alignItems={'center'} paddingY={5} paddingX={2}>
                        <Box borderColor={lightColor} borderWidth={2} borderRadius={50}>
                            <Avatar borderColor={baseColor} resizeMode="contain" borderWidth="4" size="70" source={userData.profile_image == "" ? require('../assets/images/avatar.png') : { uri: userData.profile_image }}></Avatar>
                        </Box>
                        <VStack flexWrap={'wrap'} width={'60%'}>
                            <Text color={lightColor} fontSize="md" fontFamily={fontSemiBold} textTransform={'capitalize'}>{userData.name}</Text>
                            <HStack alignItems="center" space={1}>
                                <Icon name="call-outline" size={14} color={lightGrey} />
                                <Text color={lightColor} fontSize="sm" fontFamily={fontSemiBold}> {userData.mobile}</Text>
                            </HStack>
                            <HStack alignItems="center" space={1}>
                                <Icon name="location-outline" size={14} color={lightGrey} />
                                <Text color={lightColor} fontSize="sm" fontFamily={fontSemiBold}> {state}</Text>
                            </HStack>
                        </VStack>

                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <Stack paddingX={3} paddingTop={3} marginBottom={40}>
                        {mainMenu.map((item, index) =>
                            <Pressable key={index} onPress={() => navigation.navigate(item.url, { pageTitle: item.title })} paddingY={4} borderBottomWidth={1} borderColor={lightGrey}>
                                <HStack space={3} alignItems="center">
                                    <Icon name={item.icon} size={22} color={lightColor} />
                                    <Text color={lightColor} fontSize="16" fontFamily={fontSemiBold}>{item.title}</Text>
                                </HStack>
                            </Pressable>
                        )}
                        <Pressable onPress={() => onLogout()} paddingY={2}>
                            <HStack space={3} alignItems="center">
                                <Icon name="power" size={22} color={lightColor} />
                                <Text color={lightColor} fontSize="16" fontFamily={fontSemiBold}>{t("Logout")}</Text>
                            </HStack>
                        </Pressable>
                    </Stack>
                </ScrollView>
            </LinearGradient>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    icon: { width: 60, height: 60, resizeMode: 'cover' },
    okbtn: { backgroundColor: '#f9d162', borderRadius: 50, overflow: 'hidden', width: '80%', justifyContent: 'center', alignItems: 'center', height: 45 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default LeftMenuBarScreen;