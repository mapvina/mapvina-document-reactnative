import {
  Camera,
  FillLayer,
  MapView,
  GeoJSONSource,
  StyleURL,
} from "@mapvina-com/mapvina-react-native";
import React, { Component } from "react";
import { Text } from "react-native";

import newYorkCityDistrictsFeatureCollection from "../../assets/geojson/new-york-city-districts.json";
import { Bubble } from "../../components/Bubble";
import { sheet } from "../../styles/sheet";

const styles = {
  neighborhoods: {
    fillAntialias: true,
    fillColor: "blue",
    fillOutlineColor: "black",
    fillOpacity: 0.84,
  },
  selectedNeighborhood: {
    fillAntialias: true,
    fillColor: "green",
    fillOpacity: 0.84,
  },
};

export class QueryAtPoint extends Component {
  constructor(props) {
    super(props);
    this.state = this.emptyState;
    this.onPress = this.onPress.bind(this);
  }

  get emptyState() {
    return { selectedGeoJSON: null, selectedCommunityDistrict: -1 };
  }

  async onPress(e) {
    const { screenPointX, screenPointY } = e.properties;

    const featureCollection = await this._map.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      null,
      ["nycFill"],
    );

    if (featureCollection.features.length) {
      this.setState({
        selectedGeoJSON: featureCollection,
        selectedCommunityDistrict:
          featureCollection.features[0].properties.communityDistrict,
      });
    } else {
      this.setState(this.emptyState);
    }
  }

  render() {
    return (
      <>
        <MapView
          ref={(c) => (this._map = c)}
          onPress={this.onPress}
          style={sheet.matchParent}
          styleURL={StyleURL.Default}
        >
          <Camera zoomLevel={9} centerCoordinate={[-73.970895, 40.723279]} />

          <GeoJSONSource id="nyc" data={newYorkCityDistrictsFeatureCollection}>
            <FillLayer id="nycFill" style={styles.neighborhoods} />
          </GeoJSONSource>

          {this.state.selectedGeoJSON ? (
            <GeoJSONSource id="selectedNYC" data={this.state.selectedGeoJSON}>
              <FillLayer
                id="selectedNYCFill"
                style={styles.selectedNeighborhood}
              />
            </GeoJSONSource>
          ) : null}
        </MapView>

        <Bubble>
          <Text>Press on a feature to highlight it.</Text>
        </Bubble>
      </>
    );
  }
}
