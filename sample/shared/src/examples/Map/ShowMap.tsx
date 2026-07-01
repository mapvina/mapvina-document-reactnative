import { Map } from "@mapvina-com/mapvina-react-native";

import { MAPVINA_DEMO_STYLE } from "../../constants/MAPVINA_DEMO_STYLE";
import { sheet } from "../../styles/sheet";

export function ShowMap() {
  return <Map style={sheet.matchParent} mapStyle={MAPVINA_DEMO_STYLE} />;
}
