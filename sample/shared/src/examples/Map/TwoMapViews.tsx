import {
    FillLayer,
    Map,
    GeoJSONSource,
} from "@mapvina-com/mapvina-react-native";
import { type FeatureCollection } from "geojson";

import smileyFeatureCollection from "../../assets/geojson/smiley.json";
import { sheet } from "../../styles/sheet";

const layerStyles = {
  smileyFaceLight: {
    fillAntialias: true,
    fillColor: "white",
    fillOutlineColor: "rgba(255, 255, 255, 0.84)",
  },
  smileyFaceDark: {
    fillAntialias: true,
    fillColor: "black",
    fillOutlineColor: "rgba(0, 0, 0, 0.84)",
  },
};

export function TwoMaps() {
  return (
    <>
      {[layerStyles.smileyFaceDark, layerStyles.smileyFaceLight].map(
        (style) => {
          return (
            <Map style={sheet.matchParent}>
              <GeoJSONSource
                id="smileyFaceSource"
                data={smileyFeatureCollection as FeatureCollection}
              >
                <FillLayer id="smileyFaceFill" style={style} />
              </GeoJSONSource>
            </Map>
          );
        },
      )}
    </>
  );
}
