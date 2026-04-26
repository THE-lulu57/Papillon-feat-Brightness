import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";

const BARCODE_TYPE_MAP: Record<string, string> = {
  'aztec': 'AZTEC',
  'ean13': 'EAN13',
  'ean8': 'EAN8',
  'qr': 'QR',
  'pdf417': 'PDF417',
  'upc_e': 'UPCE',
  'upc_a': 'UPC',
  'code39': 'CODE39',
  'code93': 'CODE93',
  'code128': 'CODE128',
  'itf14': 'ITF14',
  'codabar': 'codabar',
};

const normalizeType = (raw: string) => BARCODE_TYPE_MAP[raw.toLowerCase()] ?? raw.toUpperCase();

export default function ScanPapicardPage() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  useFocusEffect(useCallback(() => {
    scannedRef.current = false;
    setScanned(false);
  }, []));

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: "../papicard/modify-card", params: { data, type: normalizeType(type) } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.explanations, { top: insets.top + 48 + 10 }]}>
        <Icon size={40} fill="white" papicon>
          <Papicons name="QrCode" />
        </Icon>
        <Typography style={styles.title}>{t("ONBOARDING_PAPICARD_SCAN_TITLE")}</Typography>
        <Typography style={styles.text}>{t("ONBOARDING_PAPICARD_SCAN_DESC")}</Typography>
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
              barcodeTypes: ['aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'upc_a', 'code39', 'code93', 'code128', 'itf14', 'codabar'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {permission?.granted && <View style={styles.transparentSquareBorder} />}
      </MaskedView>
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
  explanations: {
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
});
