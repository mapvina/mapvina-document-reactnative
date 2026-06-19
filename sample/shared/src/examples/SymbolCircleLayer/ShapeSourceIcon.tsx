import {
    Images,
    MapView,
    ShapeSource,
    SymbolLayer,
} from "@mapvina/mapvina-react-native";
import { useState } from "react";

import mapvinaIcon from "../../assets/images/mapvina.png";
import { FEATURE_COLLECTION } from "../../constants/GEOMETRIES";
import { sheet } from "../../styles/sheet";

export function ShapeSourceIcon() {
  const [images, setImages] = useState({
    [FEATURE_COLLECTION.features[0]!.properties.name]: mapvinaIcon,
  });

  return (
    <MapView style={sheet.matchParent}>
      <Images
        images={images}
        onImageMissing={(imageKey) =>
          setImages((prevState) => ({
            ...prevState,
            [imageKey]: mapvinaIcon,
          }))
        }
      />
      <ShapeSource id="shape-source" shape={FEATURE_COLLECTION}>
        <SymbolLayer
          id="symbol-layer"
          style={{
            iconImage: ["get", "name"],
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
