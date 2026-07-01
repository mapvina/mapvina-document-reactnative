import {
    Map,
    MarkerView,
    GeoJSONSource,
    SymbolLayer,
} from "@mapvina-com/mapvina-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import mapvinaIcon from "../../assets/images/mapvina.png";
import { FEATURE_COLLECTION } from "../../constants/GEOMETRIES";
import { sheet } from "../../styles/sheet";

export function CustomCallout() {
  const [selectedFeature, setSelectedFeature] =
    useState<GeoJSON.Feature<GeoJSON.Point, { name: string }>>();

  return (
    <Map style={sheet.matchParent}>
      <GeoJSONSource
        id="shape-source"
        data={FEATURE_COLLECTION}
        onPress={(event) => {
          const feature = event?.features[0] as
            | GeoJSON.Feature<GeoJSON.Point, { name: string }>
            | undefined;

          setSelectedFeature(feature);
        }}
      >
        <SymbolLayer
          id="symbol-layer"
          style={{
            iconAllowOverlap: true,
            iconAnchor: "center",
            iconImage: mapvinaIcon,
            iconSize: 1,
          }}
        />
      </GeoJSONSource>
      {selectedFeature && (
        <MarkerView
          id="select-feature-marker"
          coordinate={selectedFeature.geometry.coordinates}
          anchor={{ x: 0.5, y: -1.1 }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
            }}
          >
            <Text>{selectedFeature?.properties?.name}</Text>
          </View>
        </MarkerView>
      )}
    </Map>
  );
}
