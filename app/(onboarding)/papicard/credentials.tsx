import { useTheme } from "@react-navigation/native";
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import Button from '@/ui/components/Button';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';

export default function TurboSelfLoginWithCredentials() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    return (
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderBottomLeftRadius: 42,
                    borderBottomRightRadius: 42,
                    padding: 20,
                    paddingTop: insets.top + 20,
                    paddingBottom: 34,
                    borderCurve: "continuous",
                    flex: 1,
                    backgroundColor: "#60B400"
                }}
            >
                <View
                    style={{
                        flex: 1,
                        marginBottom: 16,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <LottieView
                        autoPlay
                        loop={false}
                        style={{
                            height: "100%",
                            aspectRatio: 1,
                            maxHeight: 250,
                        }}
                        source={require('@/assets/lotties/papicard.json')}
                    />
                </View>
                <Stack
                    vAlign="start"
                    hAlign="start"
                    width="100%"
                    gap={12}
                >
                    <Stack direction="horizontal">
                        <Typography
                            variant="h5"
                            style={{ color: '#FFF', lineHeight: 22, fontSize: 18 }}
                        >
                            {t("STEP")} 2
                        </Typography>
                        <Typography
                            variant="h5"
                            style={{ color: '#FFFFFF90', lineHeight: 22, fontSize: 18 }}
                        >
                            {t("STEP_OUTOF")} 3
                        </Typography>
                    </Stack>
                    <Typography
                        variant="h1"
                        style={{ color: '#FFF', fontSize: 32, lineHeight: 34 }}
                    >
                        {t("ONBOARDING_PAPICARD")}
                    </Typography>
                </Stack>
            </View>
            <Stack padding={20} gap={10}>
                <Button
                    title={t("ONBOARDING_PAPICARD_BTN")}
                    style={{
                        backgroundColor: theme.dark ? theme.colors.border : "black",
                    }}
                    size='large'
                    disableAnimation
                    onPress={() => {
                        router.push("/(onboarding)/papicard/scan");
                    }}
                />
            </Stack>
            <OnboardingBackButton />
        </View>
    );
}
