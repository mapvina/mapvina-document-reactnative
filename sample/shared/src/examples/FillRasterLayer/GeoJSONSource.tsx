import {
    BackgroundLayer,
    Camera,
    FillLayer,
    GeoJSONSource,
    Map,
} from "@mapvina-com/mapvina-react-native";
import { type FeatureCollection } from "geojson";

import smileyFeatureCollection from "../../assets/geojson/smiley.json";
import gridPattern from "../../assets/images/mapvina.png";
import { sheet } from "../../styles/sheet";

export function GeoJSONSourceExample() {
  return (
    <Map style={sheet.matchParent}>
      <Camera zoomLevel={2} centerCoordinate={[-35.15165038, 40.6235728]} />

      <BackgroundLayer
        id="background"
        style={{
          backgroundPattern: gridPattern,
        }}
      />

      <GeoJSONSource
        id="smiley-source"
        data={smileyFeatureCollection as FeatureCollection}
      >
        <FillLayer
          id="smiley-fill"
          style={{
            fillAntialias: true,
            fillColor: "white",
            fillOutlineColor: "rgba(255, 255, 255, 0.84)",
          }}
        />
      </GeoJSONSource>
    </Map>
  );
}
