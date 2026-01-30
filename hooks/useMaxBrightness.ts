import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const initialBrightness = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true; // Ce flag est la clé pour empêcher les race conditions

    const initBrightness = async () => {
      try {
        // 1. On capture la valeur.
        const current = await getBrightnessAsync();
        
        // 2. Si l'utilisateur a déjà quitté l'écran pendant le 'await', on arrête TOUT.
        // On n'enregistre même pas la valeur pour éviter de corrompre l'état.
        if (!isMounted) return;

        // On sauvegarde uniquement si c'est la première fois
        if (initialBrightness.current === null) {
            initialBrightness.current = current;
        }

        // 3. On applique le max SEULEMENT si on est toujours sur l'écran
        if (isMounted) {
            await setBrightnessAsync(1);
        }
      } catch (error) {
        warn("Failed to set max brightness:", error);
      }
    };

    const restoreBrightness = async () => {
      try {
        // On restaure seulement si on a une valeur valide
        if (initialBrightness.current !== null) {
          await setBrightnessAsync(initialBrightness.current);
        }
      } catch (error) {
        warn("Failed to restore brightness:", error);
      }
    };

    // Lancement initial
    initBrightness();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // Si on revient sur l'app, on remet à 1, MAIS on vérifie qu'on est monté
        if (isMounted) {
            setBrightnessAsync(1).catch((e) => warn(e));
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // Si on quitte l'app, on restaure
        restoreBrightness();
      }
    });

    return () => {
      // C'est ici que la magie opère : 
      // On passe isMounted à false IMMÉDIATEMENT.
      // Si 'initBrightness' était en attente (le await), il s'arrêtera avant de mettre la lumière à 1.
      isMounted = false; 
      restoreBrightness();
      subscription.remove();
    };
  }, []);
}
