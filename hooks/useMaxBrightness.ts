import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  // On utilise une ref pour stocker la valeur INITIALE (celle de l'utilisateur)
  // On ne la changera JAMAIS après le premier fetch réussi.
  const originalBrightness = useRef<number | null>(null);
  const isHookActive = useRef(true);

  useEffect(() => {
    isHookActive.current = true;

    const enableMax = async () => {
      try {
        // ÉTAPE 1 : On récupère la valeur seulement si on ne l'a pas encore
        if (originalBrightness.current === null) {
          const val = await getBrightnessAsync();
          // Sécurité : si entre temps on a quitté l'écran, on stop.
          if (!isHookActive.current) return;
          
          // Si la valeur récupérée est déjà 1, c'est louche (peut-être un bug précédent)
          // mais on fait confiance au premier fetch.
          originalBrightness.current = val;
        }

        // ÉTAPE 2 : On monte le son... euh, la lumière
        if (isHookActive.current) {
          await setBrightnessAsync(1);
        }
      } catch (e) {
        warn("Erreur enableMax", e);
      }
    };

    const restoreOriginal = async () => {
      if (originalBrightness.current !== null) {
        try {
          await setBrightnessAsync(originalBrightness.current);
        } catch (e) {
          warn("Erreur restore", e);
        }
      }
    };

    // Lancement initial
    enableMax();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        // Quand on revient, on ne re-fetch pas la luminosité (pour ne pas choper le 100%)
        // On se contente de remettre à 1 en utilisant la vieille sauvegarde
        enableMax();
      } else {
        // "inactive" ou "background"
        restoreOriginal();
      }
    });

    return () => {
      isHookActive.current = false;
      subscription.remove();
      // On restore immédiatement au démontage
      restoreOriginal();
    };
  }, []);
}
