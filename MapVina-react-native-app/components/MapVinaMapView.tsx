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
  hasLocationPermission: boolean;
}

const MAPVINA_STYLE_URL = 'https://maps.mapvina.com/styles/v2/streets.json?key=public_key';

class MapVinaMapView extends Component<MapVinaMapViewProps, MapVinaMapViewState> {
  private locationListener: ((location: any) => void) | null = null;

  constructor(props: MapVinaMapViewProps) {
    super(props);
    this.state = {
      isMapReady: false,
      hasLocationPermission: false,
    };
  }

  static defaultProps = {
    showUserLocation: true,
    zoomLevel: 5,
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
    if (this.props.showUserLocation) {
      LocationManager.stop();
    }
  }

  onMapReady = () => {
    this.setState({ isMapReady: true });
    console.log('MapVina Map is ready');

    if (this.props.showUserLocation) {
      LocationManager.requestPermissions().then((granted: boolean) => {
        if (granted) {
          LocationManager.start();
          this.setState({ hasLocationPermission: true });
        }
      }).catch((e: any) => {
        console.warn('Location permission denied:', e);
      });
    }
  };

  onMapPress = (feature: any) => {
    console.log('Map pressed:', feature);
    if (this.props.onMapPress) {
      this.props.onMapPress(feature);
    }
  };

  render() {
    const { style, zoomLevel, centerCoordinate, showUserLocation } = this.props;
    const { isMapReady, hasLocationPermission } = this.state;

    return (
      <View style={[styles.container, style]}>
        <Map
          mapStyle={MAPVINA_STYLE_URL}
          onPress={this.onMapPress}
          onDidFinishLoadingMap={this.onMapReady}
        >
          {/*
            Only mount the Camera after the map has finished loading
            (onDidFinishLoadingMap). On a cold launch the native
            MLRNCamera._setInitialCamera path runs when the Camera is
            attached; if the map view has not been laid out yet its frame
            is {0,0}. CameraUpdateItem._clippedPadding then produces a
            NEGATIVE edge inset, and mbgl::EdgeInsets throws std::domain_error
            (uncaught C++ exception -> crash). Deferring the Camera until the
            map is ready guarantees a non-zero frame and non-negative padding.
          */}
          {isMapReady && (
            <Camera
              zoomLevel={zoomLevel || 5}
              centerCoordinate={centerCoordinate || [106.6297, 10.8231]}
            />
          )}
          {showUserLocation && isMapReady && hasLocationPermission && (
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