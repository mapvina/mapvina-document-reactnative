import { Camera, LocationManager, Map, NativeUserLocation } from '@mapvina-com/mapvina-react-native';
import React, { Component } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';

interface MapVinaMapViewProps {
  style?: any;
  showUserLocation?: boolean;
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  onMapPress?: (feature: any) => void;
  onUserLocationUpdate?: (location: any) => void;
}

interface MapVinaMapViewState {
  isMapReady: boolean;
}

const MAPVINA_STYLE_URL = 'https://maps.mapvina.com/styles/v2/streets.json?key=public_key';

class MapVinaMapView extends Component<MapVinaMapViewProps, MapVinaMapViewState> {
  private locationListener: ((location: any) => void) | null = null;

  constructor(props: MapVinaMapViewProps) {
    super(props);
    this.state = {
      isMapReady: false,
    };
  }

  static defaultProps = {
    showUserLocation: true,
    zoomLevel: 10,
    centerCoordinate: [106.6297, 10.8231],
  };

  componentDidMount() {
    if (this.props.showUserLocation && this.props.onUserLocationUpdate) {
      this.locationListener = (location: any) => {
        this.props.onUserLocationUpdate?.(location);
      };
      LocationManager.addListener(this.locationListener);
    }
  }

  componentWillUnmount() {
    if (this.locationListener) {
      LocationManager.removeListener(this.locationListener);
    }
  }

  onMapReady = () => {
    this.setState({ isMapReady: true });
    console.log('MapVina Map is ready');
  };

  onMapPress = (feature: any) => {
    console.log('Map pressed:', feature);
    if (this.props.onMapPress) {
      this.props.onMapPress(feature);
    }
  };

  render() {
    const { style, zoomLevel, centerCoordinate, showUserLocation } = this.props;

    return (
      <View style={[styles.container, style]}>
        <Map
          mapStyle={MAPVINA_STYLE_URL}
          onPress={this.onMapPress}
          onDidFinishLoadingMap={this.onMapReady}
        >
          <Camera
            zoomLevel={zoomLevel || 11}
            centerCoordinate={centerCoordinate || [106.81018062140834, 11.114651875200437]}
          />
          {showUserLocation && (
            <NativeUserLocation />
          )}
        </Map>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  marker: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#007AFF',
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 20,
  },
});

export default MapVinaMapView;