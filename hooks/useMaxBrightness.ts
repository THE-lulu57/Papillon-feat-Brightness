import { AppState, AppStateStatus } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const previousBrightness = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true; // 1. On suit l'état du montage

    const enableBrightness = async () => {
      try {
        // On récupère la valeur AVANT de changer quoi que ce soit
        const currentBrightness = await getBrightnessAsync();

        // 2. CHECK DE SÉCURITÉ :
        // Si le composant a été démonté pendant le 'await' ci-dessus, on arrête tout.
        // On n'écrase pas la ref et surtout ON NE CHANGE PAS la luminosité.
        if (!isMounted) return;

        // Si on n'a pas encore sauvegardé de valeur précédente, on le fait
        if (previousBrightness.current === null) {
          previousBrightness.current = currentBrightness;
        }

        // Maintenant on peut monter la luminosité
        await setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to set brightness:", error);
      }
    };

    const restoreBrightness = async () => {
      try {
        if (previousBrightness.current !== null) {
          await setBrightnessAsync(previousBrightness.current);
          // Optionnel : remettre à null pour éviter des restaurations multiples incorrectes
          // previousBrightness.current = null; 
        }
      } catch (error) {
        warn("Failed to restore brightness:", error);
      }
    };

    enableBrightness();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Sécurité supplémentaire : on ne restaure que si on est toujours "monté"
      if (!isMounted) return; 

      if (nextAppState.match(/inactive|background/)) {
        restoreBrightness();
      } else if (nextAppState === "active") {
        enableBrightness();
      }
    });

    return () => {
      isMounted = false; // 3. On signale que le composant est démonté
      restoreBrightness();
      subscription.remove();
    };
  }, []);
}
