import {
    Camera,
    Map,
    UserLocation,
    UserTrackingMode,
} from "@mapvina-com/mapvina-react-native";
import { useState } from "react";

import { TabBarView } from "../../components/TabBarView";
import { sheet } from "../../styles/sheet";

const OPTIONS = ["red", "yellow", "green"].map((data) => ({
  label: data,
  data,
}));

export function SetTintColor() {
  const [tintColor, setTintColor] = useState(OPTIONS[0]!.data);

  return (
    <TabBarView
      options={OPTIONS}
      onOptionPress={(_index, data) => {
        setTintColor(data);
      }}
    >
      <Map style={sheet.matchParent} tintColor={tintColor}>
        <Camera
          followZoomLevel={6}
          followUserMode={UserTrackingMode.FollowWithHeading}
          followUserLocation
        />

        <UserLocation renderMode="native" androidRenderMode="compass" />
      </Map>
    </TabBarView>
  );
}
