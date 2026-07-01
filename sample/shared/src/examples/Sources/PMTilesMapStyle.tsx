import { Map } from "@mapvina-com/mapvina-react-native";

export function PMTilesMapStyle() {
  return (
    <Map
      style={{ flex: 1 }}
      mapStyle="https://raw.githubusercontent.com/wipfli/foursquare-os-places-pmtiles/refs/heads/main/style.json"
    />
  );
}
