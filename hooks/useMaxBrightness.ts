import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import {setBrightnessAsync, getBrightnessAsync} from "expo-brightness"
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const previousBrightness = useRef<number | null>(null);
  const isMounted = useRef(true);
  const isRestoring = useRef(false); // 👈 Nouveau flag

  useEffect(() => {
    isMounted.current = true;

    const enableBrightness = async () => {
      if (!isMounted.current || isRestoring.current) return; // 👈 Check restoration
      
      try {
        const current = await Brightness.getBrightnessAsync();
        if (!isMounted.current) return;
        
        if (previousBrightness.current === null) {
          previousBrightness.current = current;
        }
        await Brightness.setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to set brightness");
      }
    };

    const restoreBrightness = async () => {
      if (!isMounted.current) return; // 👈 Check avant de restaurer
      isRestoring.current = true; // 👈 Bloque enableBrightness
      
      try {
        if (previousBrightness.current !== null) {
          await Brightness.setBrightnessAsync(previousBrightness.current);
        }
      } catch (error) {
        warn("Failed to restore brightness");
      } finally {
        isRestoring.current = false; // 👈 Libère
      }
    };

    enableBrightness();

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        restoreBrightness();
      } else if (nextState === "active") {
        enableBrightness();
      }
    });

    return () => {
      isMounted.current = false;
      restoreBrightness();
      subscription.remove();
    };
  }, []);
}
