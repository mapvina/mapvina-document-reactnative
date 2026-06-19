import {
    Camera,
    MapView,
    SymbolLayer,
    UserLocation,
    UserLocationRenderMode,
    UserTrackingMode,
} from "@mapvina/mapvina-react-native";
import { useState } from "react";
import { Button } from "react-native";

import mapvinaIcon from "../../assets/images/mapvina.png";
import { OSM_RASTER_STYLE } from "../../constants/OSM_RASTER_STYLE";
import { sheet } from "../../styles/sheet";

export function UserLocationForNavigation() {
  const [navigationActive, setNavigationActive] = useState(false);

  return (
    <>
      <Button
        title={`Navigation is ${navigationActive ? "active" : "inactive"}`}
        onPress={() => setNavigationActive((prevState) => !prevState)}
      />

      <MapView
        style={sheet.matchParent}
        mapStyle={OSM_RASTER_STYLE}
        contentInset={navigationActive ? [200, 0, 0, 0] : undefined}
        pitchEnabled={navigationActive}
      >
        {navigationActive ? (
          <UserLocation
            renderMode={
              navigationActive
                ? UserLocationRenderMode.Normal
                : UserLocationRenderMode.Native
            }
            showsUserHeadingIndicator
          >
            <SymbolLayer
              id="navigation-icon"
              style={{
                iconImage: mapvinaIcon,
                iconPitchAlignment: "map",
                iconAllowOverlap: true,
              }}
            />
          </UserLocation>
        ) : null}

        <Camera
          followUserLocation={navigationActive}
          followUserMode={
            navigationActive
              ? UserTrackingMode.FollowWithHeading
              : UserTrackingMode.Follow
          }
          followZoomLevel={19}
          followPitch={60}
          pitch={0}
          onUserTrackingModeChange={(event) => {
            if (
              navigationActive &&
              !event.nativeEvent.payload.followUserLocation
            ) {
              setNavigationActive(false);
            }
          }}
        />
      </MapView>
    </>
  );
}
