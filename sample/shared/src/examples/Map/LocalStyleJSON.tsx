import { Map } from "@mapvina-com/mapvina-react-native";
import { useState } from "react";
import { Text } from "react-native";

import MapVinaDemoTilesBlue from "../../assets/styles/mapvina-demo-tiles-blue.json";
import MapVinaDemoTilesWhite from "../../assets/styles/mapvina-demo-tiles-white.json";
import { Bubble } from "../../components/Bubble";
import { sheet } from "../../styles/sheet";

export function LocalStyleJSON() {
  const [color, setColor] = useState<"blue" | "white">("blue");

  return (
    <>
      <Map
        style={sheet.matchParent}
        mapStyle={
          { blue: MapVinaDemoTilesBlue, white: MapVinaDemoTilesWhite }[color]
        }
      />
      <Bubble
        onPress={() =>
          setColor((prevState) => {
            return ({ blue: "white", white: "blue" } as const)[prevState];
          })
        }
      >
        <Text>Switch Style JSON</Text>
      </Bubble>
    </>
  );
}
