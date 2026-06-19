# 📍 Hướng dẫn Tích hợp MapVina Map vào Dự án Expo React Native

## 📋 Tổng quan

Tài liệu này mô tả chi tiết cách tích hợp MapVina Map vào dự án React Native sử dụng Expo với cấu hình native build (prebuild).

## 🏗️ Kiến trúc Dự án

### Cấu trúc Thư mục
```
MapVina-expo-app/
├── App.tsx                           # Component chính của ứng dụng
├── components/
│   └── MapVinaMapView.tsx          # Component wrapper cho MapVina Map
├── ios/                              # Native iOS project (auto-generated)
│   ├── Podfile                       # CocoaPods dependencies
│   └── MapVinaexpoapp/            # iOS app code
├── android/                          # Native Android project (auto-generated)
│   ├── app/
│   │   └── build.gradle             # Android dependencies
│   └── build.gradle                 # Android project config
├── app.json                         # Expo configuration với MapVina plugin
├── package.json                     # NPM dependencies
├── tsconfig.json                    # TypeScript configuration
├── .eslintrc.js                     # ESLint rules
├── .prettierrc.js                   # Code formatting
└── jest.config.js                   # Testing configuration
```

## 🔧 Cài đặt và Cấu hình

### 1. Dependencies Chính

#### package.json
```json
{
  "name": "MapVinaMapApp",
  "version": "1.0.0",
  "dependencies": {
    "@mapvina/mapvina-react-native": "^2.0.1",
    "expo": "~53.0.11",
    "react": "19.0.0",
    "react-native": "0.79.3"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "eslint": "^8.57.1",
    "jest": "^29.7.0",
    "prettier": "^2.8.8",
    "typescript": "~5.8.3"
  }
}
```

### 2. Cấu hình Expo Plugin

#### app.json
```json
{
  "expo": {
    "name": "MapVina-expo-app",
    "plugins": [
      [
        "@mapvina/mapvina-react-native",
        {
          "ios": {
            "spmSpec": "{\"url\": \"https://github.com/map-vina/mapvina-gl-native-distribution\", \"requirement\": {\"kind\": \"branch\", \"version\": \"2.0.3\"}, \"product_name\": \"MapVina\"}"
          }
        }
      ]
    ]
  }
}
```

**Giải thích cấu hình:**
- **Plugin**: `@mapvina/mapvina-react-native` được đăng ký như một Expo plugin
- **spmSpec**: Cấu hình Swift Package Manager cho iOS
  - `url`: Repository chứa MapVina native library
  - `requirement.kind`: Loại requirement (`branch`, `exactVersion`, `upToNextMajor`)
  - `version`: Phiên bản cụ thể (2.0.3)
  - `product_name`: Tên product trong package

### 3. iOS Native Configuration

#### ios/Podfile (Tự động tạo bởi Expo)
```ruby
# MapVina global variables (auto-generated)
$MLRN_SPM_SPEC = {
  "url": "https://github.com/map-vina/mapvina-gl-native-distribution", 
  "requirement": {"kind": "exactVersion", "version": "2.0.3"}, 
  "product_name": "MapVina"
}

target 'MapVinaexpoapp' do
  # Expo modules và React Native
  use_expo_modules!
  
  post_install do |installer|
    # MapVina post-install hook (auto-generated)
    $MLRN.post_install(installer)
    
    # React Native post install
    react_native_post_install(installer, config[:reactNativePath])
  end
end
```

**Các hooks quan trọng:**
- `$MLRN_SPM_SPEC`: Biến global cấu hình Swift Package Manager
- `$MLRN.post_install(installer)`: Hook xử lý sau khi cài đặt pods

## 🗺️ Triển khai Map Component

### 1. MapVinaMapView Component

#### components/MapVinaMapView.tsx
```typescript
import MapVinaGL from '@mapvina/mapvina-react-native';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Cấu hình SDK (không cần token cho basic usage)
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
    this.state = { isMapReady: false };
  }

  static defaultProps = {
    showUserLocation: true,
    zoomLevel: 10,
    centerCoordinate: [106.6297, 10.8231], // TP.HCM
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
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: 16, color: '#333' },
  marker: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#007AFF',
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontSize: 20 },
});

export default MapVinaMapView;
```

**Các thành phần chính:**

1. **MapVinaGL.setAccessToken(null)**: Cấu hình SDK không cần token
2. **MapView**: Component bản đồ chính
3. **Camera**: Điều khiển vị trí và zoom của camera
4. **PointAnnotation**: Thêm marker lên bản đồ
5. **Loading State**: Hiển thị trạng thái loading khi map chưa sẵn sàng

### 2. Main App Component

#### App.tsx
```typescript
import React from 'react';
import {
  Alert, SafeAreaView, StatusBar, StyleSheet, Text, View,
} from 'react-native';
import MapVinaMapView from './components/MapVinaMapView';

const App = (): React.JSX.Element => {
  const handleMapPress = (feature: any) => {
    console.log('Map pressed:', feature);
    Alert.alert('Map Pressed', 
      `Coordinates: ${JSON.stringify(feature.geometry.coordinates)}`
    );
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
          zoomLevel={12}
          centerCoordinate={[106.6297, 10.8231]} // TP.HCM
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#E6F2FF', marginTop: 2 },
  mapContainer: {
    flex: 1, margin: 10, borderRadius: 10, overflow: 'hidden',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  map: { flex: 1 },
  footer: {
    backgroundColor: '#F8F9FA', paddingVertical: 10, paddingHorizontal: 20,
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E9ECEF',
  },
  footerText: { fontSize: 12, color: '#6C757D', fontStyle: 'italic' },
});

export default App;
```

## 🚀 Quy trình Build và Deploy

### 1. Prebuild (Tạo Native Code)
```bash
# Tạo native directories với cấu hình MapVina
npx expo prebuild

# Hoặc chỉ tạo iOS
npx expo prebuild --platform ios

# Hoặc chỉ tạo Android
npx expo prebuild --platform android
```

### 2. Development Build
```bash
# Chạy trên iOS Simulator
npx expo run:ios

# Chạy trên Android Emulator
npx expo run:android

# Chạy Expo Dev Server
npm start
```

### 3. Production Build
```bash
# EAS Build cho iOS
eas build --platform ios

# EAS Build cho Android
eas build --platform android
```

## 🔧 Troubleshooting

### 1. Lỗi iOS Build

**Lỗi**: `$MLRN.post_install(installer)` không được định nghĩa
```bash
# Giải pháp: Rebuild với plugin configuration
rm -rf ios
npx expo prebuild --platform ios
```

**Lỗi**: Swift Package Manager không tìm thấy MapVina
```json
// Kiểm tra app.json
{
  "plugins": [
    [
      "@mapvina/mapvina-react-native",
      {
        "ios": {
          "spmSpec": "{\"url\": \"https://github.com/map-vina/mapvina-gl-native-distribution\", \"requirement\": {\"kind\": \"exactVersion\", \"version\": \"2.0.3\"}, \"product_name\": \"MapVina\"}"
        }
      }
    ]
  ]
}
```

### 2. Lỗi Android Build

**Lỗi**: MapVina native library không tìm thấy
```bash
# Clean và rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

### 3. Lỗi Metro Bundler

```bash
# Clear cache
npx expo start --clear

# Hoặc
npx react-native start --reset-cache
```

## 📱 Tính năng Nâng cao

### 1. Custom Map Styles
```typescript
<MapVinaGL.MapView
  styleURL="https://your-custom-style-url.json"
  style={styles.map}
>
```

### 2. Multiple Markers
```typescript
{markers.map((marker, index) => (
  <MapVinaGL.PointAnnotation
    key={index}
    id={`marker-${index}`}
    coordinate={marker.coordinate}
  >
    <CustomMarker {...marker} />
  </MapVinaGL.PointAnnotation>
))}
```

### 3. User Location Tracking
```typescript
<MapVinaGL.UserLocation
  visible={true}
  onUpdate={handleUserLocationUpdate}
/>
```

### 4. Offline Maps
```typescript
// Download offline pack
MapVinaGL.offlineManager.createPack({
  name: 'offline-region',
  styleURL: 'your-style-url',
  bounds: [[minLng, minLat], [maxLng, maxLat]],
  minZoom: 10,
  maxZoom: 15,
});
```

## 📊 Performance Optimization

### 1. Memory Management
- Sử dụng `onDidFinishLoadingMap` để biết khi nào map đã sẵn sàng
- Cleanup listeners trong `componentWillUnmount`
- Giới hạn số lượng markers hiển thị cùng lúc

### 2. Rendering Optimization
- Sử dụng `shouldComponentUpdate` cho markers
- Lazy loading cho complex annotations
- Cache map styles locally

## 🧪 Testing

### Unit Tests
```typescript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

### Integration Tests
```bash
# Chạy tests
npm test

# Test với coverage
npm run test:coverage
```

## 📄 Tài liệu Tham khảo

1. **MapVina React Native**: https://docs.mapvina.org/
2. **Expo Prebuild**: https://docs.expo.dev/workflow/prebuild/
3. **React Native Maps**: https://github.com/react-native-maps/react-native-maps
4. **MapVina GL Native**: https://github.com/map-vina/mapvina-gl-native

## 🔗 Repository và Support

- **Source Code**: `MapVina-expo-app/`
- **Issues**: Tạo issue trên GitHub repository
- **Documentation**: Xem README.md cho hướng dẫn cơ bản
- **Community**: MapVina Discord/Telegram group

---

*Tài liệu này được cập nhật cho MapVina React Native v2.0.1 và Expo SDK 53* 