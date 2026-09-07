/* eslint-disable @typescript-eslint/no-require-imports */
import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import {
  isScannedTypeSupported,
  renderFormatFromScannedType,
  SUPPORTED_BARCODE_SCANNER_TYPES,
} from "@/services/custom-canteen/formats";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";

interface ScannedCode {
  value: string;
  format: string;
}

export default function CustomCanteenCardCreation() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedCode, setScannedCode] = useState<ScannedCode | null>(null);

  const [label, setLabel] = useState("");
  const [balanceText, setBalanceText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!isScannedTypeSupported(type)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t("ONBOARDING_CUSTOM_CANTEEN_UNSUPPORTED_TITLE"),
        t("ONBOARDING_CUSTOM_CANTEEN_UNSUPPORTED_TEXT")
      );
      return;
    }

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScannedCode({ value: data, format: renderFormatFromScannedType(type) });
  };

  const rescan = () => {
    setScannedCode(null);
    setScanned(false);
  };

  const saveCard = async () => {
    if (!scannedCode || isSaving) {
      return;
    }

    setIsSaving(true);

    const accountId = uuid();
    const store = useAccountStore.getState();

    const balanceAmount = balanceText
      ? Math.round(parseFloat(balanceText.replace(",", ".")) * 100)
      : 0;

    const service = {
      id: accountId,
      auth: {
        additionals: {
          codeValue: scannedCode.value,
          codeFormat: scannedCode.format,
          label: label.trim() || t("ONBOARDING_SERVICE_CUSTOM_CANTEEN"),
          balanceAmount: Number.isFinite(balanceAmount) ? balanceAmount : 0,
          currency: "€",
        },
      },
      serviceId: Services.CUSTOM_CANTEEN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // A custom card is never a standalone identity: it only ever makes sense attached to an
    // existing school account, so unlike the other restaurant login screens we don't fork on
    // `action === "addService"` here — always attach to the current account.
    store.addServiceToAccount(store.lastUsedAccount, service);
    await initializeAccountManager();

    setIsSaving(false);
    router.back();
    router.back();
    router.back();
  };

  if (!scannedCode) {
    return (
      <SafeAreaView style={styles.container}>
        <OnboardingBackButton />

        <View style={[styles.explainations, { top: insets.top + 48 + 10 }]}>
          <Icon size={40} fill="white" papicon>
            <Papicons name="QrCode" />
          </Icon>
          <Typography style={styles.title}>
            {t("ONBOARDING_CUSTOM_CANTEEN_SCAN_TITLE")}
          </Typography>
          <Typography style={styles.text}>
            {t("ONBOARDING_CUSTOM_CANTEEN_SCAN_TEXT")}
          </Typography>
        </View>

        <MaskedView
          style={StyleSheet.absoluteFill}
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
              barcodeScannerSettings={{ barcodeTypes: SUPPORTED_BARCODE_SCANNER_TYPES }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFill}
            />
          )}
          {permission?.granted && <View style={styles.transparentSquareBorder} />}
        </MaskedView>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={32}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
          gap: 16,
          flexGrow: 1,
        }}
        style={{ backgroundColor: colors.background }}
      >
        <OnboardingBackButton />

        <View style={{ alignItems: "center", gap: 4, marginTop: 40, marginBottom: 8 }}>
          <Icon size={40} fill={colors.text} papicon>
            <Papicons name="QrCode" />
          </Icon>
          <Typography style={{ fontSize: 18, fontWeight: "600", color: colors.text, textAlign: "center" }}>
            {t("ONBOARDING_CUSTOM_CANTEEN_CONFIRM_TITLE")}
          </Typography>
          <Typography style={{ fontSize: 15, color: colors.text + "80", textAlign: "center" }}>
            {t("ONBOARDING_CUSTOM_CANTEEN_CONFIRM_TEXT", { format: scannedCode.format })}
          </Typography>
        </View>

        <OnboardingInput
          placeholder={t("ONBOARDING_CUSTOM_CANTEEN_LABEL_PLACEHOLDER")}
          text={label}
          setText={setLabel}
          icon="Card"
          inputProps={{ autoFocus: true }}
        />

        <OnboardingInput
          placeholder={t("ONBOARDING_CUSTOM_CANTEEN_BALANCE_PLACEHOLDER")}
          text={balanceText}
          setText={setBalanceText}
          icon="PiggyBank"
          inputProps={{ keyboardType: "decimal-pad" }}
        />

        <View style={{ flex: 1 }} />

        <View style={{ gap: 8 }}>
          <Button title={t("ONBOARDING_CUSTOM_CANTEEN_SAVE")} onPress={saveCard} loading={isSaving} />
          <Button title={t("ONBOARDING_CUSTOM_CANTEEN_RESCAN")} variant="outline" onPress={rescan} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    height: 200,
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
    height: 200,
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
});
