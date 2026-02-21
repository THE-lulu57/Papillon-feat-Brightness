import { ImageSourcePropType } from "react-native";

import { Services } from "@/stores/account/types";

export function getServiceName(service: Services, customLabel?: string): string {
  switch(service) {
  case Services.TURBOSELF:
    return "TurboSelf";
  case Services.ARD:
    return "ARD";
  case Services.IZLY:
    return "Izly";
  case Services.ALISE:
    return "Alise";
  case Services.PAPICARD:
      return customLabel || "Papicard";
  case Services.ECOLEDIRECTE:
    return "ÉcoleDirecte";
  case Services.LANNION:
    return "IUT de Lannion";
  default:
    return "Pronote";
  }
}

export function getServiceLogo(service: Services): ImageSourcePropType {
  switch(service) {
  case Services.PRONOTE:
    return require("@/assets/images/service_pronote.png")
  case Services.SKOLENGO:
    return require("@/assets/images/service_skolengo.png")
  case Services.LANNION:
    return require("@/assets/images/univ_lannion.png")
  case Services.TURBOSELF:
    return require("@/assets/images/turboself.png")
  case Services.ARD:
    return require("@/assets/images/ard.png")
  case Services.IZLY:
    return require("@/assets/images/izly.png")
  case Services.ECOLEDIRECTE:
    return require("@/assets/images/ecoledirecte.png")
  case Services.ALISE:
    return require("@/assets/images/alise.jpg")
  case Services.PAPICARD:
      return require("@/assets/app.icon/Assets/glass 2.png")
  default: 
    return require("@/assets/images/turboself.png")
  }
}

export function getServiceBackground(service: Services, color?: string): ImageSourcePropType {
  switch(service) {
  case Services.TURBOSELF:
    return require("@/assets/images/turboself_background_card.png")
  case Services.IZLY:
    return require("@/assets/images/izly_background_card.png")
  case Services.ARD:
    return require("@/assets/images/ard_background_card.png")
  case Services.ECOLEDIRECTE:
    return require("@/assets/images/card_background/ecoledirecte.png")
  case Services.ALISE:
    return require("@/assets/images/alise_background_card.png")
  case Services.PAPICARD:
      return getPapicardImageByColor(color);
  default: 
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@/assets/images/ard_background_card.png")
  }
}

function getPapicardImageByColor(color?: string): ImageSourcePropType {
  const colorUpper = color?.toUpperCase();
  
  switch(colorUpper) {
    case '#26B290':
      return require("@/assets/images/card_background/papicard_green.png");
    case '#48B7E8':
      return require("@/assets/images/card_background/papicard_blue.png");
    case '#6D6D6D':
      return require("@/assets/images/card_background/papicard_black.png");
    case '#E8B048':
      return require("@/assets/images/card_background/papicard_yellow.png");
    case '#C400DD':
      return require("@/assets/images/card_background/papicard_purple.png");
    case '#DD007D':
      return require("@/assets/images/card_background/papicard_pink.png");
    default:
      return require("@/assets/images/card_background/papicard_green.png");
  }
}

export function getServiceColor(service: Services): string {
  switch(service) {
  case Services.TURBOSELF:
    return "#E70026"
  case Services.ARD:
    return "#295888"
  case Services.ECOLEDIRECTE:
    return "#108ED1"
  case Services.ALISE:
    return "#108ED1"
  default:
    return "#E70026"
  }
}

export function getCodeType(service: Services): string {
  switch(service) {
  case Services.ECOLEDIRECTE:
    return "CODE39"
  default:
    return "QR"
  }
}

export function isSelfModuleEnabledED(additionals?: Record<string, any>): boolean {
  if (!additionals) {return false;}
  for (const module of additionals["modules"] as Array<{badge: number, code: string, enable: true, ordre: number, params: Array<any>}>) {
    if (module.code === "CANTINE_BARCODE" && module.enable) {
      if (module.params && module.params.numeroBadge)
      {return true;}
    }
  }
  return false;
}
