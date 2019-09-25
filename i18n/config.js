import {I18nManager} from "react-native";
import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';
import en from './translations/en';
import fr from './translations/fr';

const fallback = { languageTag: "en", isRTL: false };

const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(["en", "fr"]) || fallback;

I18nManager.forceRTL(isRTL);

i18n.defaultLocale = en;
i18n.translations = { en, fr };
i18n.locale = languageTag;

export const rtl = isRTL;

export default i18n;