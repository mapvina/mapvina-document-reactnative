# Hướng Dẫn Tích Hợp MapVina Map trong React Native

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết cách tích hợp MapVina Maps vào ứng dụng React Native, bao gồm cấu hình iOS, tạo components, và triển khai các tính năng bản đồ cơ bản.

## 🏗️ Cấu Trúc Dự Án

```
MapVina-react-native-app/
├── ios/
│   ├── Podfile                 # Cấu hình CocoaPods và MapVina
│   └── MapVinaMapApp.xcworkspace
├── components/
│   └── MapVinaMapView.tsx    # Component bản đồ chính
├── App.tsx                     # Component gốc
├── package.json                # Dependencies
└── yarn.lock
```

## 📦 Dependencies và Cài Đặt

### 1. Package Dependencies

```json
{
  "dependencies": {
    "@mapvina/mapvina-react-native": "^2.0.1",
    "react": "19.0.0",
    "react-native": "0.79.3"
  }
}
```

### 2. Cài Đặt Dependencies

```bash
# Cài đặt JavaScript dependencies
yarn install

# Cấu hình node_modules (thay vì Yarn PnP)
echo 'nodeLinker: node-modules' > .yarnrc.yml
yarn install
```

## 🍎 Cấu Hình iOS

### 1. Podfile Configuration

File `ios/Podfile` cần được cấu hình để tích hợp MapVina Swift Package:

```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'MapVinaMapApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    # React Native post install
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      # :ccache_enabled => true
    )
    
    # MapVina post install configuration
    $MLRN_SPM_SPEC = {
      url: "https://github.com/map-vina/mapvina-gl-native-distribution",
      requirement: {
        kind: "exactVersion",
        version: "2.0.3"
      },
      product_name: "MapVina"
    }
    $MLRN.post_install(installer)
  end
end
```

### 2. Cài Đặt iOS Dependencies

```bash
cd ios
pod install
cd ..
```

## 🗺️ Component Implementation

### 1. MapVinaMapView Component

File `components/MapVinaMapView.tsx`:

```typescript
import MapVinaGL from '@mapvina/mapvina-react-native';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

// Cấu hình MapVina (không cần token cho basic usage)
MapVinaGL.setAccessToken(null);

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

class MapVinaMapView extends Component<MapVinaMapViewProps, MapVinaMapViewState> {
  constructor(props: MapVinaMapViewProps) {
    super(props);
    this.state = {
      isMapReady: false,
    };
  }

  static defaultProps = {
    showUserLocation: true,
    zoomLevel: 10,
    centerCoordinate: [106.6297, 10.8231], // Ho Chi Minh City coordinates
  };

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
    const { style, zoomLevel, centerCoordinate } = this.props;
    const { isMapReady } = this.state;

    return (
      <View style={[styles.container, style]}>
        <MapVinaGL.MapView
          style={styles.map}
          onPress={this.onMapPress}
          onDidFinishLoadingMap={this.onMapReady}
        >
          <MapVinaGL.Camera
            zoomLevel={zoomLevel || 10}
            centerCoordinate={centerCoordinate || [106.6297, 10.8231]}
            animationMode="flyTo"
            animationDuration={1000}
          />

          <MapVinaGL.PointAnnotation
            id="marker"
            coordinate={centerCoordinate || [106.6297, 10.8231]}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>📍</Text>
            </View>
          </MapVinaGL.PointAnnotation>
        </MapVinaGL.MapView>

        {!isMapReady && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        )}
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
```

### 2. Main App Component

File `App.tsx`:

```typescript
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
    Alert.alert('Map Pressed', `Coordinates: ${JSON.stringify(feature.geometry.coordinates)}`);
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
        <Text style={styles.headerSubtitle}>React Native Integration</Text>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapVinaMapView
          style={styles.map}
          showUserLocation={true}
          zoomLevel={12}
          centerCoordinate={[106.6297, 10.8231]} // Ho Chi Minh City
          onMapPress={handleMapPress}
          onUserLocationUpdate={handleUserLocationUpdate}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🗺️ Powered by MapVina React Native
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
```

## 🚀 Build và Chạy Ứng Dụng

### 1. Khởi Động Metro Bundler

```bash
# Khởi động development server
yarn start --reset-cache
```

### 2. Chạy iOS App

```bash
# Build và chạy trên iOS Simulator
yarn ios
```

## 🔧 Các Thành Phần Chính

### 1. MapVinaGL Components

- **`MapView`**: Container chính cho bản đồ
- **`Camera`**: Điều khiển vị trí và zoom của camera
- **`PointAnnotation`**: Tạo markers trên bản đồ
- **`UserLocation`**: Hiển thị vị trí người dùng (nếu cần)

### 2. Props và Configuration

```typescript
interface MapVinaMapViewProps {
  style?: any;                      // Style cho container
  showUserLocation?: boolean;       // Hiển thị vị trí user
  zoomLevel?: number;              // Mức zoom (0-20)
  centerCoordinate?: [number, number]; // [longitude, latitude]
  onMapPress?: (feature: any) => void; // Callback khi tap map
  onUserLocationUpdate?: (location: any) => void; // Callback vị trí user
}
```

### 3. Event Handling

```typescript
// Map press event
onMapPress = (feature: any) => {
  console.log('Map pressed:', feature);
  // feature.geometry.coordinates chứa [longitude, latitude]
};

// Map ready event
onMapReady = () => {
  console.log('MapVina Map is ready');
  // Map đã load hoàn thành
};
```

## 🎨 Customization

### 1. Custom Markers

```typescript
<MapVinaGL.PointAnnotation
  id="customMarker"
  coordinate={[longitude, latitude]}
>
  <View style={customMarkerStyle}>
    <Image source={require('./marker-icon.png')} />
  </View>
</MapVinaGL.PointAnnotation>
```

### 2. Map Styles

```typescript
// Có thể customize map style thông qua styleURL
<MapVinaGL.MapView
  style={styles.map}
  styleURL="custom-style-url" // Optional
>
```

### 3. Camera Animation

```typescript
<MapVinaGL.Camera
  zoomLevel={15}
  centerCoordinate={[106.6297, 10.8231]}
  animationMode="flyTo"        // "flyTo" | "easeTo" | "linearTo"
  animationDuration={2000}     // milliseconds
/>
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Access Token

```typescript
// Đối với basic usage, có thể set null
MapVinaGL.setAccessToken(null);

// Đối với production, cần access token thực tế
MapVinaGL.setAccessToken('your-mapvina-access-token');
```

### 2. Coordinate Format

MapVina sử dụng format `[longitude, latitude]` (khác với Google Maps):

```typescript
// Đúng: [longitude, latitude]
const coordinate = [106.6297, 10.8231]; // HCM City

// Sai: [latitude, longitude] 
const wrongCoordinate = [10.8231, 106.6297];
```

### 3. iOS Permissions

Để sử dụng user location, cần thêm vào `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>App cần quyền truy cập vị trí để hiển thị trên bản đồ</string>
```

## 🐛 Troubleshooting

### 1. Build Errors

**Lỗi**: "Missing package product 'MapVina'"
**Giải pháp**: Đảm bảo Podfile có cấu hình `$MLRN.post_install(installer)`

**Lỗi**: "No script URL provided"
**Giải pháp**: Khởi động Metro bundler trước: `yarn start`

### 2. Runtime Errors

**Lỗi**: "Cannot read property 'None' of undefined"
**Giải pháp**: Không sử dụng `userTrackingMode` property (không supported)

**Lỗi**: TypeScript errors với props
**Giải pháp**: Chỉ sử dụng các props được documented trong MapVina API

## 📚 Tài Liệu Tham Khảo

- [MapVina React Native GitHub](https://github.com/map-vina/mapvina-react-native)
- [MapVina GL Native Distribution](https://github.com/map-vina/mapvina-gl-native-distribution)
- [React Native Documentation](https://reactnative.dev/)

## 🎯 Tính Năng Tiếp Theo

1. **Routing & Directions**: Tích hợp API chỉ đường
2. **Offline Maps**: Tải bản đồ offline
3. **Custom Styles**: Tạo map styles tùy chỉnh
4. **Geocoding**: Chuyển đổi địa chỉ thành tọa độ
5. **Clustering**: Nhóm markers khi zoom out

---

*Tài liệu này được tạo dựa trên MapVina React Native v2.0.1 và React Native v0.79.3* 