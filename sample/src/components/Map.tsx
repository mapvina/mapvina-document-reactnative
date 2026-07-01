import { Camera, Map, Marker } from '@mapvina-com/mapvina-react-native';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Yêu cầu quyền truy cập vị trí
    Geolocation.requestAuthorization();

    // Lấy vị trí hiện tại của người dùng
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key"
      >
        <Camera
          zoomLevel={14}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [106.6297, 10.8231]
          }
        />

        {userLocation && (
          <Marker
            id="userLocation"
            lngLat={[userLocation.longitude, userLocation.latitude]}>
            <View style={styles.markerContainer}>
              <View style={styles.marker} />
            </View>
          </Marker>
        )}

        <Marker
          id="sampleLocation"
          lngLat={[106.6297, 10.8231]}>
          <View style={styles.markerContainer}>
            <View style={[styles.marker, styles.sampleMarker]} />
          </View>
        </Marker>
      </Map>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sampleMarker: {
    backgroundColor: '#FF3B30',
  },
});

export default MapScreen;