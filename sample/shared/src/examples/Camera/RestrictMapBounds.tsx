import {
    Camera,
    FillLayer,
    Map,
    GeoJSONSource,
} from "@mapvina-com/mapvina-react-native";
import bboxPolygon from "@turf/bbox-polygon";

import { EU_BOUNDS } from "../../constants/GEOMETRIES";
import { colors } from "../../styles/colors";
import { sheet } from "../../styles/sheet";

const POLYGON = bboxPolygon([
  EU_BOUNDS.sw[0],
  EU_BOUNDS.sw[1],
  EU_BOUNDS.ne[0],
  EU_BOUNDS.ne[1],
]);

export function RestrictMapBounds() {
  return (
    <Map style={sheet.matchParent}>
      <Camera maxBounds={EU_BOUNDS} bounds={EU_BOUNDS} />
      <GeoJSONSource id="bounds-source" data={POLYGON}>
        <FillLayer
          id="bounds-fill"
          style={{
            fillColor: colors.blue,
            fillOpacity: 0.1,
            fillOutlineColor: colors.blue,
          }}
        />
      </GeoJSONSource>
    </Map>
  );
}
