import { type ConfigContext, type ExpoConfig } from "expo/config";
import "ts-node/register";

import type { MapVinaPluginProps } from "./src/plugin/withMapVina";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MapVina Sample",
  slug: "mapvina-sample-react-native",
  version: "1.0.0",
  newArchEnabled: true,
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#285daa",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mapvina.expo.sample",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Permission is necessary to display user location",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.mapvina.expo.example",
  },
  androidStatusBar: {
    backgroundColor: "#285daa",
    translucent: false,
  },
  plugins: [
    [
      "./src/plugin/withMapVina.ts",
      {
        android: {},
        ios: {},
      } as MapVinaPluginProps,
    ],
  ],
});
