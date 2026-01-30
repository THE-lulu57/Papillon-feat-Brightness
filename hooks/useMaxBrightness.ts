import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const previousBrightness = useRef<number | null>(null);
  const lastOperationId = useRef(0);

  useEffect(() => {
    // Fonction centrale pour gérer les changements avec priorité au dernier appel
    const updateBrightness = async (target: 'max' | 'restore') => {
      const currentId = ++lastOperationId.current;

      try {
        if (target === 'max') {
          // 1. On récupère la luminosité actuelle si pas déjà fait
          if (previousBrightness.current === null) {
            const val = await getBrightnessAsync();
            // Si une autre opération a commencé entre temps, on stop
            if (currentId !== lastOperationId.current) return;
            previousBrightness.current = val;
          }
          await setBrightnessAsync(1);
        } else {
          // 2. On restaure
          if (previousBrightness.current !== null) {
            await setBrightnessAsync(previousBrightness.current);
            // On ne reset pas previousBrightness ici pour pouvoir 
            // le réutiliser si on revient de l'arrière-plan
          }
        }
      } catch (error) {
        warn(`Failed to ${target} brightness:`, error);
      }
    };

    // Initialisation
    updateBrightness('max');

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        updateBrightness('restore');
      } else if (nextAppState === "active") {
        updateBrightness('max');
      }
    });

    return () => {
      // On incrémente pour annuler toute opération 'max' en cours
      lastOperationId.current++; 
      
      // On lance la restauration finale
      if (previousBrightness.current !== null) {
        setBrightnessAsync(previousBrightness.current).catch(() => 
          warn("Failed restore on unmount")
        );
      }
      subscription.remove();
    };
  }, []);
}
