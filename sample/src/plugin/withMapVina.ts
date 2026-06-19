import { type ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import type { MapVinaPluginProps } from "./MapVinaPluginProps";
import { android } from "./android";
import { ios } from "./ios";

let pkg: { name: string; version?: string } = {
  name: "@mapvina/mapvina-react-native",
};
try {
  pkg = require("@mapvina/mapvina-react-native/package.json");
} catch {
  // empty catch block
}

const withMapVina: ConfigPlugin<MapVinaPluginProps> = (config, props) => {
  // Android
  config = android.withGradleProperties(config, props);

  // iOS
  config = ios.withExcludedSimulatorArchitectures(config);
  config = ios.withDwarfDsym(config);
  config = ios.withoutSignatures(config);
  config = ios.withPodfileGlobalVariables(config, props);
  config = ios.withPodfilePostInstall(config);

  return config;
};

export default createRunOncePlugin(withMapVina, pkg.name, pkg.version);
