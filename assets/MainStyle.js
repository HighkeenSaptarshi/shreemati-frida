import { StyleSheet } from "react-native";

export const baseColor = "#B770E5";
export const rareColor = "#A6185A";
export const baseLightColor = "#F8DCFE";
export const baseDarkColor = "#956EDC";

export const baseSemiColor = "#ebedff";
export const dangerColor = "#DA4C51";
export const successColor = "#4BA54D";
export const warningColor = "#FF9900";
export const lightColor = "#ffffff";
export const darkColor = "#000000";
export const greyColor = "#DFDFDF";
export const lightGrey = "#F4F4F4";
export const darkGrey = "#707274";

export const fontRegular = "Mulish-Regular";
export const fontBold = "Mulish-Bold";
export const fontSemiBold = "Mulish-SemiBold";

const MainStyle = StyleSheet.create({
    spincontainer: { position: 'absolute', zIndex: 9999, left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
    logo: { height: 50, resizeMode: 'contain' },
    lable: { fontFamily: fontSemiBold, color: darkColor, marginBottom: 5 },
    inputbox: { backgroundColor: lightColor, borderColor: greyColor, borderWidth: 1, borderRadius: 12, width: '100%', position: 'relative', overflow: 'hidden' },
    solidbtn: { height: 45, backgroundColor: rareColor, borderRadius: 30, overflow: 'hidden' },
    outlinebtn: { height: 43, borderColor: rareColor, borderWidth: 1, borderRadius: 30, overflow: 'hidden' },
    pagibox: { width: 35, height: 35, borderRadius: 30 },
    popbox: { width: '80%', backgroundColor: "#fcfcfc", borderRadius: 15, overflow: 'hidden', minHeight: 300, justifyContent: 'center', alignItems: 'center', padding: 30 },
    /* quickbox: { width: '29.33%', padding: 2, height: 125, borderColor: greyColor, borderWidth: 1, borderRadius: 12, margin: '2%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    quickicon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#eeeeee", marginBottom: 5 },
    tabbtn: {borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden' , borderRadius: 0, width: '24%'},
    productbox: { width: '50%', padding: 8 },
    productimage: { backgroundColor: lightGrey, marginBottom: 5, borderRadius: 8, width: '100%', height: 160, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productimagebig: { backgroundColor: lightGrey, marginBottom: 5, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' } */
});

export { MainStyle };