import {
    Images,
    Map,
    GeoJSONSource,
    SymbolLayer,
} from "@mapvina-com/mapvina-react-native";
import { useState } from "react";

import mapvinaIcon from "../../assets/images/mapvina.png";
import { FEATURE_COLLECTION } from "../../constants/GEOMETRIES";
import { sheet } from "../../styles/sheet";

export function GeoJSONSourceIcon() {
  const [images, setImages] = useState({
    [FEATURE_COLLECTION.features[0]!.properties.name]: mapvinaIcon,
  });

  return (
    <Map style={sheet.matchParent}>
      <Images
        images={images}
        onImageMissing={(imageKey) =>
          setImages((prevState) => ({
            ...prevState,
            [imageKey]: mapvinaIcon,
          }))
        }
      />
      <GeoJSONSource id="shape-source" data={FEATURE_COLLECTION}>
        <SymbolLayer
          id="symbol-layer"
          style={{
            iconImage: ["get", "name"],
          }}
        />
      </GeoJSONSource>
    </Map>
  );
}
