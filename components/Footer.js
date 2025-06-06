import { Badge, Box, HStack, Stack, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImageBackground, Pressable, TouchableOpacity } from 'react-native';
import { baseColor, darkGrey, fontRegular, fontSemiBold, greyColor, lightColor, lightGrey } from '../assets/MainStyle';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FooterComponents = ({ navigation, component, cartcount, canredeem }) => {

    const { t } = useTranslation();

    return (
        <Stack>
            <HStack backgroundColor={lightColor} alignItems="center" justifyContent="space-evenly" padding={5} borderColor={lightGrey} borderTopWidth={1}>
                <TouchableOpacity onPress={() => navigation.replace('Home', { pageTitle: t("Home") })}>
                    <VStack alignItems="center">
                        <Icon name={component == "Home" ? "home" : "home-outline"} size={20} color={component == "Home" ? baseColor : darkGrey} />
                        <Text color={component == "Home" ? baseColor : darkGrey} fontSize="10" fontFamily={fontRegular}>{t("Home")}</Text>
                    </VStack>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => navigation.navigate('Cart', { pageTitle: t("My Cart") })}>
                    <VStack alignItems="center">
                        <Icon name={component == "Cart" ? "cart" : "cart-outline"} size={20} color={component == "Cart" ? baseColor : darkGrey} />
                        <Text color={component == "Cart" ? baseColor : darkGrey} fontSize="10" fontFamily={fontRegular}>{t("My Cart")}</Text>
                    </VStack>
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => navigation.navigate('Gallery', { pageTitle: t("Gallery") })}>
                    <VStack alignItems="center">
                        <Icon name={component == "Gallery" ? "images" : "images-outline"} size={20} color={component == "Gallery" ? baseColor : darkGrey} />
                        <Text color={component == "Gallery" ? baseColor : darkGrey} fontSize="10" fontFamily={fontRegular}>{t("Gallery")}</Text>
                    </VStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("RewardsCategory", { pageTitle: t("Rewards Category") })}>
                    <VStack alignItems="center">
                        <Icon name={component == "RewardsCategory" ? "gift" : "gift-outline"} size={20} color={component == "RewardsCategory" ? baseColor : darkGrey} />
                        <Text color={component == "RewardsCategory" ? baseColor : darkGrey} fontSize="10" fontFamily={fontRegular}>{t("Rewards")}</Text>
                    </VStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('MyProfile', { pageTitle: t("My Profile") })}>
                    <VStack alignItems="center">
                        <Icon name={component == "Profile" ? "person" : "person-outline"} size={20} color={component == "Profile" ? baseColor : darkGrey} />
                        <Text color={component == "Profile" ? baseColor : darkGrey} fontSize="10" fontFamily={fontRegular}>{t("Profile")}</Text>
                    </VStack>
                </TouchableOpacity>
            </HStack>
        </Stack>
    );
}

export default FooterComponents;