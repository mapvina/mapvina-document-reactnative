import { MapView } from "@mapvina/mapvina-react-native";

import { sheet } from "../../styles/sheet";

export function ShowMap() {
  return <MapView style={sheet.matchParent} />;
}
