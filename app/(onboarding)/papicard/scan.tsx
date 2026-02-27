import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";

export default function ScanPapicardPage() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const BARCODE_TYPE_MAP: Record<string, string> = {
        "qr": "QR",
        "ean13": "EAN13",
        "ean8": "EAN8",
        "code128": "CODE128",
        "code39": "CODE39",
        "code93": "CODE93",
    };

    const normalizeType = (raw: string): string => {
        return BARCODE_TYPE_MAP[raw.toLowerCase()] ?? raw.toUpperCase();
    };

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission?.granted, requestPermission]);

    const handleBarCodeScanned = ({
        type,
        data,
    }: {
        type: string;
        data: string;
    }) => {
        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const normalizedType = normalizeType(type);

        router.push({
            pathname: "../papicard/modify-card",
            params: {
                data: data,
                type: normalizedType,
            }
        });
    };

    // Fonction de debug pour simuler un scan
    const handleDebugScan = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        router.push({
            pathname: "../papicard/modify-card",
            params: {
                data: "1234567890123",
                type: "CODE128",
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.explainations, { top: insets.top + 48 + 10 }]}>
                <Icon size={40} fill={"white"} papicon>
                    <Papicons name="QrCode" />
                </Icon>
                <Typography style={styles.title}>
                    {t("ONBOARDING_PAPICARD_SCAN_TITLE")}
                </Typography>
                <Typography style={styles.text}>
                    {t("ONBOARDING_PAPICARD_SCAN_SUBTITLE")}
                </Typography>
            </View>

            <MaskedView
                style={StyleSheet.absoluteFillObject}
                maskElement={
                    <View style={styles.maskContainer}>
                        <View style={styles.transparentSquare} />
                    </View>
                }
            >
                <View style={styles.maskContainer} />
                {permission?.granted && (
                    <CameraView
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: [
                                "qr",
                                "ean13",
                                "ean8",
                                "code128",
                                "code39",
                                "code93",
                            ]
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />
                )}
                {permission?.granted && (
                    <View style={styles.transparentSquareBorder} />
                )}
            </MaskedView>

            <TouchableOpacity
                style={[styles.debugButton, { bottom: insets.bottom + 100 }]}
                onPress={handleDebugScan}
            >
                <Icon size={20} fill={"white"}>
                    <Papicons name="Bug" />
                </Icon>
                <Typography style={styles.debugText}>Debug Scan</Typography>
            </TouchableOpacity>

            <OnboardingBackButton />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    maskContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    transparentSquare: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "black",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 30,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "35%",
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 200,
        backgroundColor: '#ffffff42',
        padding: 10,
        borderRadius: 100,
    },
    transparentSquareBorder: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 30,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "35%",
    },
    explainations: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 24,
        gap: 4,
        zIndex: 9999,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
        textAlign: "center",
    },
    text: {
        fontSize: 16,
        fontWeight: "400",
        color: "white",
        textAlign: "center",
        opacity: 0.8,
    },
    debugButton: {
        position: "absolute",
        alignSelf: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        zIndex: 9999,
    },
    debugText: {
        fontSize: 14,
        fontWeight: "600",
        color: "white",
    },
});
