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
    "@mapvina-com/mapvina-react-native": "^1.0.1",
    "expo": "^54.0.35",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "eslint": "^8.57.1",
    "jest": "^29.7.0",
    "prettier": "^2.8.8",
    "typescript": "~5.9.2"
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
        "@mapvina-com/mapvina-react-native",
        {
          "ios": {
            "spmSpec": "{\"url\": \"https://github.com/mapvina/mapvina-gl-native-distribution\", \"requirement\": {\"kind\": \"exactVersion\", \"version\": \"1.0.0\"}, \"product_name\": \"MapVina\"}"
          }
        }
      ]
    ]
  }
}
```

**Giải thích cấu hình:**
- **Plugin**: `@mapvina-com/mapvina-react-native` được đăng ký như một Expo plugin
- **spmSpec**: Cấu hình Swift Package Manager cho iOS
  - `url`: Repository chứa MapVina native library (`https://github.com/mapvina/mapvina-gl-native-distribution`)
  - `requirement.kind`: Loại requirement (`exactVersion`, `upToNextMajor`)
  - `version`: Phiên bản cụ thể (1.0.0)
  - `product_name`: Tên product trong package

### 3. iOS Native Configuration

#### ios/Podfile (Tự động tạo bởi Expo)
```ruby
# MapVina global variables (auto-generated)
$MLRN_SPM_SPEC = {
  "url": "https://github.com/mapvina/mapvina-gl-native-distribution", 
  "requirement": {"kind": "exactVersion", "version": "1.0.0"}, 
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

### 4. iOS AppDelegate Configuration

**Bắt buộc**: Cấu hình `MLNSettings` trong `AppDelegate.swift` trước khi sử dụng MapVina:

```swift
import MapVina

// Trong application(_:didFinishLaunchingWithOptions:)
MLNSettings.use(.mapVina)
MLNSettings.apiKey = "public_key"

// Force HTTP/2 over TCP by capping TLS at 1.2.
// QUIC/HTTP3 requires TLS 1.3; capping at 1.2 prevents QUIC,
// which times out in the iOS Simulator.
let networkConfig = URLSessionConfiguration.default
networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12
networkConfig.timeoutIntervalForRequest = 30
networkConfig.timeoutIntervalForResource = 60
MLNNetworkConfiguration.sharedManager.sessionConfiguration = networkConfig
```

> **Quan trọng**: Nếu không gọi `MLNSettings.use(.mapVina)`, app sẽ crash (SIGABRT) trong `ResourceLoaderThread` khi tải map style.
> 
> **TLS 1.2 cap**: Bắt buộc trên iOS Simulator để tránh QUIC timeout. MapVina SDK tự xử lý HTTP negotiation trên thiết bị thật.

## 🗺️ Triển khai Map Component

### 1. MapVinaMapView Component

#### components/MapVinaMapView.tsx
```typescript
import { Camera, LocationManager, Map, NativeUserLocation } from '@mapvina-com/mapvina-react-native';
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

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
}

class MapVinaMapView extends Component<MapVinaMapViewProps, MapVinaMapViewState> {
  private locationListener: ((location: any) => void) | null = null;

  constructor(props: MapVinaMapViewProps) {
    super(props);
    this.state = { isMapReady: false };
  }

  static defaultProps = {
    showUserLocation: true,
    zoomLevel: 10,
    centerCoordinate: [106.6297, 10.8231], // TP.HCM
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
            centerCoordinate={centerCoordinate || [106.6297, 10.8231]}
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
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapVinaMapView;
```

**Các thành phần chính:**

1. **Map**: Component bản đồ chính, sử dụng `mapStyle` prop
2. **Camera**: Điều khiển vị trí và zoom của camera
3. **NativeUserLocation**: Hiển thị vị trí người dùng trên bản đồ
4. **LocationManager**: Quản lý location updates

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
      "@mapvina-com/mapvina-react-native",
      {
        "ios": {
          "spmSpec": "{\"url\": \"https://github.com/mapvina/mapvina-gl-native-distribution\", \"requirement\": {\"kind\": \"exactVersion\", \"version\": \"1.0.0\"}, \"product_name\": \"MapVina\"}"
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

### 3. Lỗi `fmt` consteval (Apple Clang 20+ / Xcode 26)

```bash
error: consteval function cannot be used in a constant expression
```

**Nguyên nhân:** Apple Clang 20+ (Xcode 26) có bug với `consteval` trong thư viện `fmt`.

**Cách khắc phục:** Thêm vào `post_install` hook trong Podfile (sau `react_native_post_install`):
```ruby
# Fix glog and fmt build issues (Xcode 26 / Apple Clang 20+)
installer.pods_project.targets.each do |target|
  if target.name == 'glog'
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
    end
  end
  if target.name == 'fmt'
    target.build_configurations.each do |config|
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
    end
  end
end

# Patch fmt/base.h to disable consteval on Apple Clang 20+
fmt_base_h = File.join(installer.sandbox.pod_dir('fmt').to_s, 'include', 'fmt', 'base.h')
if File.exist?(fmt_base_h)
  content = File.read(fmt_base_h)
  old_line = "#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L\n#  define FMT_USE_CONSTEVAL 0  // consteval is broken in Apple clang < 14."
  new_line = old_line + "\n#elif defined(__apple_build_version__) && __apple_build_version__ >= 20000000L\n#  define FMT_USE_CONSTEVAL 0  // consteval broken in Apple clang 20+ (Xcode 26)."
  if content.include?(old_line) && !content.include?("Apple clang 20+")
    FileUtils.chmod(0644, fmt_base_h)
    File.write(fmt_base_h, content.sub(old_line, new_line))
  end
end
```

> **Lưu ý:** Sau khi chạy `npx expo prebuild`, các patch trong Podfile có thể bị ghi đè. Cần thêm lại patch fmt sau mỗi lần prebuild, hoặc giữ Podfile trong `.gitignore` và patch thủ công.

### 4. Lỗi Metro Bundler

```bash
# Clear cache
npx expo start --clear

# Hoặc
npx react-native start --reset-cache
```

## 📱 Tính năng Nâng cao

### 1. Custom Map Styles
```typescript
<Map
  mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key"
  style={styles.map}
>
```

### 2. Multiple Markers
```typescript
import { Marker } from '@mapvina-com/mapvina-react-native';

{markers.map((marker, index) => (
  <Marker
    key={index}
    id={`marker-${index}`}
    lngLat={marker.coordinate}
  >
    <CustomMarker {...marker} />
  </Marker>
))}
```

### 3. User Location Tracking
```typescript
import { NativeUserLocation, LocationManager } from '@mapvina-com/mapvina-react-native';

<NativeUserLocation />

LocationManager.addListener((location) => {
  console.log('User location:', location);
});
```

### 4. Offline Maps
```typescript
import { OfflineManager } from '@mapvina-com/mapvina-react-native';

OfflineManager.createPack({
  name: 'offline-region',
  styleURL: 'https://maps.mapvina.com/styles/v2/streets.json?key=public_key',
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
4. **MapVina GL Native**: https://github.com/mapvina/mapvina-gl-native-distribution

## 🔗 Repository và Support

- **Source Code**: `MapVina-expo-app/`
- **Issues**: Tạo issue trên GitHub repository
- **Documentation**: Xem README.md cho hướng dẫn cơ bản
- **Community**: MapVina Discord/Telegram group

---

*Tài liệu này được cập nhật cho `@mapvina-com/mapvina-react-native` v1.0.1 và Expo SDK 54 / React Native 0.81.5* 

> **Tránh crash cold-launch (`std::domain_error` / `mbgl::EdgeInsets`)**: Chỉ mount `<Camera>` (và `<Marker>`) **sau** `onDidFinishLoadingMap` (dùng state `isMapReady`). Mount `<Camera>` khi map view chưa layout (frame `{0,0}`) làm edge padding bị âm và ném uncaught C++ exception. Đây là fix đã áp dụng trong `components/MapVinaMapView.tsx`.

> **iOS Simulator map trắng do QUIC/HTTP3**: cap TLS 1.2 trong `AppDelegate.swift` — `networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12`. (Sau mỗi `expo prebuild` cần thêm lại.)
