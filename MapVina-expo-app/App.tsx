import React from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapVinaMapView from './components/MapVinaMapView';

const App = (): React.JSX.Element => {
  const handleMapPress = (feature: any) => {
    console.log('Map pressed:', feature);
    const coords = feature?.geometry?.coordinates;
    if (coords) {
      Alert.alert('Map Pressed', `Coordinates: ${JSON.stringify(coords)}`);
    }
  };

  const handleUserLocationUpdate = (location: any) => {
    console.log('User location updated:', location);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MapVina Map Demo</Text>
        <Text style={styles.headerSubtitle}>Expo React Native Integration</Text>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapVinaMapView
          style={styles.map}
          showUserLocation={true}
          zoomLevel={5}
          centerCoordinate={[106.6297, 10.8231]} // Ho Chi Minh City
          onMapPress={handleMapPress}
          onUserLocationUpdate={handleUserLocationUpdate}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🗺️ Powered by MapVina React Native (Expo)
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E6F2FF',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  footerText: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
  },
});

export default App;
