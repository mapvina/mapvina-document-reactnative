import { Camera, LocationManager, Map, NativeUserLocation } from '@mapvina-com/mapvina-react-native';
import { Component } from 'react';
import {
    StyleSheet,
    View
} from 'react-native';

const MAPVINA_STYLE_URL = 'https://maps.mapvina.com/styles/v2/streets.json?key=public_key';

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
    centerCoordinate: [106.6297, 10.8231], // Ho Chi Minh City coordinates
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
          <Camera
            zoomLevel={zoomLevel || 5}
            centerCoordinate={centerCoordinate || [106.6297, 10.8231]}
          />
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
});

export default MapVinaMapView; 