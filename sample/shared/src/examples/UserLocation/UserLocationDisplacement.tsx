import {
    Camera,
    LocationManager,
    Map,
    UserLocation,
    UserTrackingMode,
} from "@mapvina-com/mapvina-react-native";
import { useEffect, useState } from "react";

import { TabBarView } from "../../components/TabBarView";
import { sheet } from "../../styles/sheet";

const OPTIONS = [0, 5, 10].map((data) => ({ label: data + " Meter", data }));

export function UserLocationDisplacement() {
  const [minDisplacement, setMinDisplacement] = useState(OPTIONS[0]!.data);

  useEffect(() => {
    LocationManager.start();

    return () => {
      LocationManager.stop();
    };
  }, []);

  return (
    <TabBarView
      options={OPTIONS}
      onOptionPress={(_index, data) => {
        setMinDisplacement(data);
      }}
    >
      <Map style={sheet.matchParent}>
        <Camera
          followUserLocation
          followUserMode={UserTrackingMode.FollowWithHeading}
          followZoomLevel={16}
        />

        <UserLocation minDisplacement={minDisplacement} />
      </Map>
    </TabBarView>
  );
}
