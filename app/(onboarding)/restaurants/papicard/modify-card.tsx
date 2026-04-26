import React, { useState } from "react";
import { View, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/ui/new/Button";
import AppColorsSelector from "@/components/AppColorsSelector";
import { useSettingsStore } from "@/stores/settings";
import { addPapicard } from "@/database/usePapicard";
import { AppColors } from "@/utils/colors";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useTranslation } from 'react-i18next';
import { useAlert } from '@/ui/components/AlertProvider';
import * as FileSystem from "expo-file-system/legacy";

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
    const settingsStore = useSettingsStore(state => state.personalization);
    const alert = useAlert();

    const scannedData = params.data as string;
    const scannedType = params.type as string;

    const defaultColorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
    const initialColor = defaultColorData.mainColor.toUpperCase();

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [cardLabel, setCardLabel] = useState("");
    const { t } = useTranslation();

    const handleSave = async () => {
        try {
            let cardData = scannedData;

            if (scannedType === "IMAGE") {
                const finalPath = FileSystem.documentDirectory + `papicard_${Date.now()}.jpg`;
                await FileSystem.moveAsync({ from: scannedData, to: finalPath });
                cardData = finalPath;
            }

            await addPapicard(cardLabel, scannedType, cardData, selectedColor);
            router.dismissAll();
            router.push({
                pathname: "/(features)/(cards)/cards",
            });
        } catch (error) {
            alert.showAlert({
                title: "Impossible d'ajouter la carte",
                description: "Nous n'avons pas réussi à ajouter ta carte.",
                icon: "Warning",
                color: "#D60046",
                withoutNavbar: true,
            });
        }
    };

    return (
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 24,
                    paddingTop: 0,
                    gap: 20
                }}
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior="never"
            >
                <View
                    style={{
                        width: "100%",
                        height: 210,
                        borderRadius: 20,
                        overflow: "hidden",
                        marginTop: insets.top + 40,
                        marginBottom: 5,
                        alignItems: "center",
                    }}
                >
                    <Image
                        source={CARD_IMAGES[selectedColor] || CARD_IMAGES['#26B290']}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
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
                    onChangeColor={(color) => color && setSelectedColor(color.toUpperCase())}
                />
                <Button
                    label={t("Context_Add")}
                    onPress={handleSave}
                    variant="primary"
                />
            </ScrollView>
        </View>
    );
}
