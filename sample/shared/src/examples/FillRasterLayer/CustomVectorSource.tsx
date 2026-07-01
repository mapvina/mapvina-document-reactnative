import {
    FillLayer,
    Map,
    VectorSource,
} from "@mapvina-com/mapvina-react-native";
import { useRef, useState } from "react";
import { Text } from "react-native";

import { Bubble } from "../../components/Bubble";
import { sheet } from "../../styles/sheet";

export function CustomVectorSource() {
  const vectorSourceRef = useRef<any>();
  const [featuresCount, setFeaturesCount] = useState<number>();

  return (
    <>
      <Map style={sheet.matchParent}>
        <VectorSource
          id="mapvina-tiles"
          url="https://maps.map-vina.com/styles/v1/streets.json?key=public_key"
          ref={vectorSourceRef}
          onPress={(event) => {
            console.log(
              `VectorSource onPress: ${event.features}`,
              event.features,
            );
          }}
        >
          <FillLayer
            id="countries"
            sourceLayerID="countries"
            style={{
              fillColor: "#ffffff",
              fillAntialias: true,
            }}
          />
        </VectorSource>
      </Map>
      <Bubble
        onPress={async () => {
          const features = await vectorSourceRef.current?.features?.([
            "countries",
          ]);
          setFeaturesCount(features.features.length);
        }}
      >
        <Text>Query features</Text>
        {typeof featuresCount === "number" ? (
          <Text>Count: {featuresCount}</Text>
        ) : null}
      </Bubble>
    </>
  );
}
