import { Map, type MapRef } from "@mapvina-com/mapvina-react-native";
import { useRef, useState } from "react";
import { Text } from "react-native";

import { Bubble } from "../../components/Bubble";
import { sheet } from "../../styles/sheet";

export function SourceLayerVisibility() {
  const mapViewRef = useRef<MapRef>(null);
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Map ref={mapViewRef} style={sheet.matchParent} />
      <Bubble
        onPress={() => {
          mapViewRef.current?.setSourceVisibility(
            !visible,
            "mapvina",
            "countries",
          );

          setVisible((prevState) => !prevState);
        }}
      >
        <Text>{`${visible ? "Hide" : "Show"} Countries`}</Text>
      </Bubble>
    </>
  );
}
