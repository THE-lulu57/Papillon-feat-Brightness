import { AppState, AppStateStatus } from "react-native";
import { useEffect, useRef } from "react";
import { setBrightnessAsync, getBrightnessAsync } from "expo-brightness";
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {
  const originalBrightness = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Variable locale pour savoir si le composant est "vivant"
    let isMounted = true;

    const enableMaxBrightness = async () => {
      try {
        // 1. On récupère la valeur actuelle
        const current = await getBrightnessAsync();

        // 2. CHECK CRITIQUE : Si le composant est démonté ou si l'utilisateur
        // a quitté l'app PENDANT la récupération, on s'arrête net.
        if (!isMounted) return;

        // On ne sauvegarde que si on n'a pas déjà une valeur
        if (originalBrightness.current === null) {
          originalBrightness.current = current;
        }

        // 3. On applique le max
        await setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to enable brightness:", error);
      }
    };

    const restoreBrightness = () => {
      // On annule tout démarrage prévu qui ne serait pas encore parti
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // On restaure seulement si on a eu le temps de sauvegarder une valeur
      if (originalBrightness.current !== null) {
        setBrightnessAsync(originalBrightness.current).catch((err) =>
          warn("Failed to restore:", err)
        );
      }
    };

    // --- LE SECRET EST ICI ---
    // On n'active pas la luminosité tout de suite. On attend 100ms.
    // Si tu ouvres et fermes l'écran en moins de 0.1s, le code dans le timeout
    // ne s'exécutera JAMAIS. La luminosité ne bougera pas. Pas de bug.
    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        enableMaxBrightness();
      }
    }, 100); 

    // Gestion de l'état de l'app (Background/Active)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // Si on revient, on relance la procédure (avec délai aussi)
        timeoutRef.current = setTimeout(() => {
            if (isMounted) enableMaxBrightness();
        }, 100);
      } else if (nextAppState.match(/inactive|background/)) {
        // Si on quitte l'app, on restaure direct
        restoreBrightness();
      }
    });

    return () => {
      isMounted = false; // On coupe le circuit
      restoreBrightness(); // On restaure ou on annule le timer
      subscription.remove();
    };
  }, []);
}
