import { getManager } from "@/services/shared";
import { Balance } from "@/services/shared/balance";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import ChipButton from "@/ui/components/ChipButton";
import { Dynamic } from "@/ui/components/Dynamic";
import { EmptyItem } from "@/ui/components/EmptyItem";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import Typography from "@/ui/components/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import { getServiceBackground, getServiceLogo, getServiceName } from "@/utils/services/helper";
import { Papicons, Plus } from "@getpapillon/papicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { getPapicardsAsBalances } from "@/database/usePapicard";

export default function QRCodeAndCardsPage() {
  const [wallets, setWallets] = useState<Balance[]>([]);
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  async function fetchWallets() {
    const manager = getManager();

    const onlineBalances = await manager.getCanteenBalances();
    const manualBalances = await getPapicardsAsBalances();
    const result = [...onlineBalances, ...manualBalances];

    setWallets(result);
  }

  useEffect(() => {
    setWallets([])
    fetchWallets();
  }, [accounts])

  const { t } = useTranslation();

  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <>
      <TabHeader
        modal
        onHeightChanged={setHeaderHeight}
        title={
          <TabHeaderTitle
            chevron={false}
            leading={t("Profile_QRCards")}
            subtitle={t("Profile_QRCards_Subtitle", { count: wallets.length })}
          />
        }
        trailing={
          <ChipButton
            single
            icon="cross"
            onPress={() => {
              router.dismiss();
            }}
          />
        }
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, paddingTop: headerHeight - 16 }} contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        {wallets.map((c, i) => {
          const serviceId = c.serviceId ?? account?.services.find(service => service.id === c.createdByAccount)?.serviceId ?? Services.TURBOSELF;

          return (
            <Dynamic
              animated
              key={c.createdByAccount + c.label}
              entering={PapillonAppearIn}
              exiting={PapillonAppearOut}
            >
              <Card
                key={c.createdByAccount + c.label}
                index={i}
                wallet={c}
                service={serviceId}
                totalCards={wallets.length}
              />
            </Dynamic>
          );
        })}

        {wallets.length === 0 && (
          <Dynamic
            animated
            entering={PapillonAppearIn}
            exiting={PapillonAppearOut}
          >
            <EmptyItem
              icon="Card"
              title={t("Settings_Cards_None_Title")}
              description={t("Settings_Cards_None_Description")}
              margin={0}
            />
          </Dynamic>
        )}

        <Dynamic animated>
          <Button
            title={t("Context_Add")}
            icon={<Plus />}
            onPress={() => {
              router.dismiss();
              router.push({
                pathname: "/(onboarding)/restaurants/method",
                params: { action: "addService" }
              });
            }}
          />
        </Dynamic>
      </ScrollView >
    </>
  );
}

export function Card({
  index = 0,
  wallet,
  service,
  disabled,
}: {
  index: number;
  wallet: Balance;
  service: Services;
  disabled?: boolean;
  inSpecificView?: boolean;
  totalCards?: number;
}) {
  const [pressed, setPressed] = useState(false);

  // For Papicard Service
  const walletData = wallet as any;
  const papicardColor = walletData.color;
  const qrData = walletData.qrData || '';
  const qrType = walletData.qrType || 'QR';
  const customLabel = wallet.label;
  const displayName = getServiceName(service, service === Services.PAPICARD ? customLabel : undefined);

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          if (service === Services.PAPICARD) {
            router.push({
              pathname: "/(features)/(cards)/qrcode",
              params: {
                qrcode: qrData,
                type: qrType,
                service: service.toString()
              }
            });
          } else {
            router.push({
              pathname: "/(features)/(cards)/specific",
              params: {
                serviceName: getServiceName(service),
                service: service,
                wallet: JSON.stringify(wallet)
              }
            });
          }
        }
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        width: "100%",
        minHeight: 210,
        borderRadius: 20,
        overflow: "hidden",
        marginTop: index === 0 ? 0 : -140,
        zIndex: 100 + index,
        top: 0,
        left: 0,
        right: 0,
      }}
      disabled={disabled}
    >
      <Image
        source={getServiceBackground(service, service === Services.PAPICARD ? papicardColor : undefined)}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          width: "100%",
          height: 250,
        }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["#00000080", "transparent"]}
        locations={[0, 0.87]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {pressed && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }} />
      )}

      <View style={{ padding: 15, flex: 1 }}>
        <Stack
          direction="horizontal"
          style={{ justifyContent: "space-between" }}
          hAlign="center"
        >
          <Stack direction="horizontal" hAlign="center" gap={8}>
            <Image
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#0000001F",
              }}
              source={getServiceLogo(service)}
              resizeMode="cover"
            />
            <Typography variant="title" color={"#FFFFFF"}>{displayName}</Typography>
          </Stack>

          {service !== Services.PAPICARD && (
            <Stack gap={0} direction="vertical">
              <Typography variant="caption" align="right" color={"#FFFFFF" + 90} style={{ width: "100%", lineHeight: 0 }}>
                {wallet.label}
              </Typography>
              <Typography variant="title" align="right" color={"#FFFFFF"} style={{ width: "100%", lineHeight: 0 }}>
                {(wallet.amount / 100).toFixed(2)} {wallet.currency}
              </Typography>
            </Stack>
          )}
        </Stack>
      </View>
    </Pressable>
  )
}
