import React, { useState } from "react";
import { View, ScrollView, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/ui/components/Button";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import AppColorsSelector from "@/components/AppColorsSelector";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { addPapicard } from "@/database/usePapicard";
import { AppColors } from "@/utils/colors";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useTranslation } from 'react-i18next';
import { useAlert } from '@/ui/components/AlertProvider';
import { useTheme } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const CARD_IMAGES: { [key: string]: any } = {
    '#26B290': require('@/assets/images/card_background/papicard_green.png'),
    '#48B7E8': require('@/assets/images/card_background/papicard_blue.png'),
    '#6D6D6D': require('@/assets/images/card_background/papicard_black.png'),
    '#E8B048': require('@/assets/images/card_background/papicard_yellow.png'),
    '#C400DD': require('@/assets/images/card_background/papicard_purple.png'),
    '#DD007D': require('@/assets/images/card_background/papicard_pink.png'),
};

export default function PreviewPapicardPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const store = useAccountStore();
    const settingsStore = useSettingsStore(state => state.personalization);
    const alert = useAlert();

    const scannedData = params.data as string;
    const scannedType = params.type as string;

    const defaultColorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
    const initialColor = defaultColorData.mainColor.toUpperCase();

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [cardLabel, setCardLabel] = useState("");
    const theme = useTheme();
    const { t } = useTranslation();


    const handleSave = async () => {
        try {
            await addPapicard(
                cardLabel,
                scannedType,
                scannedData,
                selectedColor
            );
            router.dismissAll();
            router.replace('/(features)/cards');
        } catch (error) {
            alert.showAlert({
                title: "Impossible d'ajouter la carte",
                description: "Nous n’avons pas réussi à ajouter ta carte.",
                icon: "TriangleAlert",
                color: "#D60046",
                withoutNavbar: true
            })
        }
    };

    return (
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
            <ScrollView
                contentContainerStyle={{ padding: 24, gap: 20 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{
                    alignItems: "center",
                    marginTop: 65,
                    marginBottom: 5,
                }}>
                    <Image
                        source={CARD_IMAGES[selectedColor] || CARD_IMAGES['#26B290']}
                        style={{
                            width: width - 48,
                            height: 260,
                            borderRadius: 20,
                        }}
                        resizeMode="cover"
                    />
                </View>

                <OnboardingInput
                    icon={"card"}
                    placeholder={t("PAPICARD_NAME_INPUT")}
                    text={cardLabel}
                    setText={setCardLabel}
                    isPassword={false}
                    keyboardType={"default"}
                    inputProps={{
                        autoCapitalize: "none",
                        autoCorrect: false,
                        spellCheck: false,
                    }}
                />

                <AppColorsSelector
                    accountId={store.lastUsedAccount}
                    onChangeColor={(color) => color && setSelectedColor(color.toUpperCase())}
                />
                <Button
                    variant="primary"
                    onPress={handleSave}
                    style={{ backgroundColor: selectedColor }}
                    title={t("Settings_Cards_Add_Button")}>
                </Button>
            </ScrollView>
            <OnboardingBackButton
                iconColor={theme.dark ? '#fff' : '#000000'}
            />
        </View>
    );
}
