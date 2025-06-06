import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import En from './En.json';
import Hn from './Hn.json';
import Te from './Te.json';
import Ta from './Ta.json';
import Ml from './Ml.json';
import Kn from './Kn.json';
import Bn from './Bn.json';
i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'Eng',
    fallbackLng: 'Eng',
    resources: {
        Eng: En,
        Hn: Hn,
        Te: Te,
        Ta: Ta,
        Ml: Ml,
        Kn: Kn,
        Bn: Bn
    },
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export default i18n;