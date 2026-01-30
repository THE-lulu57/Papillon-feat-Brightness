import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const previousBrightness = useRef<number | null>(null);
  const brightnessPromise = useRef<Promise<number> | null>(null);

  useEffect(() => {
    const enableBrightness = async () => {
      try {
        if (previousBrightness.current === null && brightnessPromise.current === null) {
          brightnessPromise.current = getBrightnessAsync();
          previousBrightness.current = await brightnessPromise.current;
        }
        await setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to set brightness:");
      }
    };

    const restoreBrightness = async () => {
      try {
        // Attendre que la luminosité initiale soit récupérée si nécessaire
        if (brightnessPromise.current !== null && previousBrightness.current === null) {
          previousBrightness.current = await brightnessPromise.current;
        }
        
        if (previousBrightness.current !== null) {
          await setBrightnessAsync(previousBrightness.current);
        }
      } catch (error) {
        warn("Failed to restore brightness:");
      }
    };

    enableBrightness();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        restoreBrightness();
      } else if (nextAppState === "active") {
        enableBrightness();
      }
    });

    return () => {
      restoreBrightness();
      subscription.remove();
    };
  }, []);
}
