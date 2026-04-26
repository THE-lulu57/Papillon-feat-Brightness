import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import { GetSupportedServices } from './utils/constants';
import { GetSupportedRestaurants } from "../utils/constants";

export default function ServiceSelection() {
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const { params } = useRoute();
  const { type } = params;

  const [selectedService, setSelectedService] = useState(null);
  const [ModalVisible, setModalVisible] = useState(false);
  const [selectedModalOption, setSelectedModalOption] = useState<"scan" | "import" | null>(null);

  const slideAnim = useRef(new Animated.Value(9999)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(0);
  const isOpening = useRef(false);

  const services = GetSupportedRestaurants((path: { pathname: string }) => {
    router.push({
      pathname: path.pathname as unknown as RelativePathString,
      params: path.options ?? {} as unknown as UnknownInputParams
    });
  });

  const filteredServices = services;

  const titleString = t("ONBOARDING_RESTAURANT_SELECTION_TITLE");

  const hasServiceRoute = services.find(service => service.name === selectedService)?.route || services.find(service => service.name === selectedService)?.onPress;

  const openModal = () => {
    isOpening.current = true;
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: sheetHeight.current, duration: 220, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedModalOption(null);
    });
  };

  const loginToService = (serviceName: string) => {
    if (serviceName === "papicard") {
      openModal();
      return;
    }
    const serviceRoute = services.find(service => service.name === serviceName)?.route;
    if(!serviceRoute) {
      services.find(service => service.name === serviceName)?.onPress();
      return;
    }
    const newRoute = './services/' + serviceRoute;
    router.push(newRoute);
  };

  return (
    <View style={{ flex: 1 }}>
      <List
        ListHeaderComponent={() => (
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{titleString}</Typography>
            <Typography variant="action" color="textSecondary">{t("ONBOARDING_SERVICE_SELECTION_DESCRIPTION")}</Typography>
            <Divider height={18} ghost />
          </Stack>
        )}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20
        }}
        style={{ flex: 1 }}
      >
        {filteredServices.map((app) => (
          <List.Item key={app.name} onPress={() => setSelectedService(app.name)} style={{
            backgroundColor: selectedService === app.name ? adjust(colors.primary, theme.dark ? -0.8 : 0.9) : colors.card,
            minHeight: 62
          }}>
            <List.Leading>
              <Stack animated direction="horizontal" hAlign="center" gap={12}>
                {selectedService === app.name && <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}><Icon fill={colors.primary}><Papicons name="check" /></Icon></Dynamic>}

                <Dynamic animated>
                  {app.image ? (
                    <Image source={app.image} style={{ width: 32, height: 32, borderRadius: 10 }} />
                  ) : (
                    <Icon papicon>{app.icon}</Icon>
                  )}
                </Dynamic>
              </Stack>
            </List.Leading>
            <Dynamic animated><Typography variant="action">{app.title}</Typography></Dynamic>
          </List.Item>
        ))}
      </List>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.background,
          flexDirection: "column",
          gap: 8
        }}
      >
        <Button
          label={t("ONBOARDING_CONTINUE")}
          onPress={() => { loginToService(selectedService) }}
          disabled={!selectedService || !hasServiceRoute}
        />
        <Button
          label={t("ONBOARDING_CANCEL")}
          onPress={() => { router.back() }}
          variant="secondary"
        />
      </View>

      {ModalVisible && (
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: "flex-end", zIndex: 100 }]}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={closeModal} />
          </Animated.View>

          <Animated.View
            onLayout={(e) => {
              const height = e.nativeEvent.layout.height;
              sheetHeight.current = height;
              if (isOpening.current) {
                isOpening.current = false;
                slideAnim.setValue(height);
                Animated.parallel([
                  Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
                  Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
                ]).start();
              }
            }}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: insets.bottom + 20,
              gap: 10,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Typography variant="h3">{t("PAPICARD_SERVICE_DESC")}</Typography>
            <Divider height={4} ghost />

            <List>
              {[
                { key: "scan", icon: "Camera", label: t("PAPICARD_TAKE_PHOTO"), desc: t("PAPICARD_SCAN_DESC") },
                { key: "import", icon: "Image", label: t("PAPICARD_IMPORT_PHOTO"), desc: t("PAPICARD_IMPORT_PHOTO_DESC") },
              ].map(({ key, icon, label, desc }) => (
                <List.Item key={key} onPress={() => setSelectedModalOption(key as "scan" | "import")} style={{
                  backgroundColor: selectedModalOption === key ? adjust(colors.primary, theme.dark ? -0.8 : 0.9) : colors.card,
                  minHeight: 62
                }}>
                  <List.Leading>
                    <Stack animated direction="horizontal" hAlign="center" gap={12}>
                      {selectedModalOption === key && (
                        <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
                          <Icon fill={colors.primary}><Papicons name="check" /></Icon>
                        </Dynamic>
                      )}
                      <Dynamic animated><Icon papicon><Papicons name={icon} /></Icon></Dynamic>
                    </Stack>
                  </List.Leading>
                  <Stack gap={2}>
                    <Dynamic animated><Typography variant="action">{label}</Typography></Dynamic>
                    <Typography variant="caption" color="textSecondary">{desc}</Typography>
                  </Stack>
                </List.Item>
              ))}
            </List>

            <Divider height={4} ghost />
            <Button
              label={t("ONBOARDING_CONTINUE")}
              disabled={!selectedModalOption}
              onPress={async () => {
                if (selectedModalOption === "import") {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    quality: 1,
                  });
                  if (result.canceled) return;

                  const localPath = FileSystem.documentDirectory + `papicard_tmp_${Date.now()}.jpg`;
                  await FileSystem.copyAsync({ from: result.assets[0].uri, to: localPath });

                  closeModal();
                  router.push({
                    pathname: "../restaurants/papicard/modify-card",
                    params: {
                      data: localPath,
                      type: "IMAGE",
                    },
                  });
                } else {
                  closeModal();
                  router.push(`../restaurants/papicard/${selectedModalOption}`);
                }
              }}
            />
            <Button
              label={t("ONBOARDING_CANCEL")}
              onPress={closeModal}
              variant="secondary"
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
}
