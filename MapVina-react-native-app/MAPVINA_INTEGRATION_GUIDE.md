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
    "@mapvina-com/mapvina-react-native": "^1.0.1",
    "react": "^19.1.0",
    "react-native": "0.81.5"
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
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
    )

    # Fix glog build issue
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
      if target.name == 'RNReanimated'
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
      end
    end

    # Patch fmt/base.h: disable consteval on Apple Clang 20+ (Xcode 26) where it's broken
    fmt_base_h = File.join(installer.sandbox.pod_dir('fmt').to_s, 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base_h)
      content = File.read(fmt_base_h)
      old_line = "#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L\n#  define FMT_USE_CONSTEVAL 0  // consteval is broken in Apple clang < 14."
      new_line = "#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L\n#  define FMT_USE_CONSTEVAL 0  // consteval is broken in Apple clang < 14.\n#elif defined(__apple_build_version__) && __apple_build_version__ >= 20000000L\n#  define FMT_USE_CONSTEVAL 0  // consteval broken in Apple clang 20+ (Xcode 26)."
      if content.include?(old_line) && !content.include?("Apple clang 20+")
        FileUtils.chmod(0644, fmt_base_h)
        File.write(fmt_base_h, content.sub(old_line, new_line))
        puts "[Fix] Patched fmt/base.h to disable consteval on Apple Clang 20+"
      end
    end

    # MapVina post install — local SPM
    spm_path = "../../../mapvina-gl-native-distribution"
    spm_product = "MapVina"

    add_local_spm = lambda do |project, target|
      pkg_class = Xcodeproj::Project::Object::XCLocalSwiftPackageReference
      ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency
      pkg = project.root_object.package_references.find { |p| p.class == pkg_class && p.relative_path == spm_path }
      if !pkg
        pkg = project.new(pkg_class)
        pkg.relative_path = spm_path
        project.root_object.package_references << pkg
      end
      ref = target.package_product_dependencies.find { |r| r.class == ref_class && r.package == pkg && r.product_name == spm_product }
      if !ref
        ref = project.new(ref_class)
        ref.package = pkg
        ref.product_name = spm_product
        target.package_product_dependencies << ref
      end
    end

    project = installer.pods_project
    mlrn_target = project.targets.find { |t| t.name == "MapVinaReactNative" }
    if mlrn_target
      add_local_spm.call(project, mlrn_target)
    end

    installer.aggregate_targets.group_by(&:user_project).each do |proj, targets|
      targets.each do |target|
        target.user_targets.each do |user_target|
          add_local_spm.call(proj, user_target)

          phase_name = "[MapVina React Native] Remove MapVina.xcframework-ios.signature"
          unless user_target.shell_script_build_phases.any? { |p| p.name == phase_name }
            phase = user_target.new_shell_script_build_phase(phase_name)
            phase.shell_script = 'rm -rf "$CONFIGURATION_BUILD_DIR/MapVina.xcframework-ios.signature"'
            phase.always_out_of_date = "1"
          end
        end
      end
    end
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
import { Camera, LocationManager, Map, NativeUserLocation } from '@mapvina-com/mapvina-react-native';
import React, { Component } from 'react';
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
        <Text style={styles.headerSubtitle}>React Native Integration</Text>
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

### 1. MapVina Components

- **`Map`**: Component bản đồ chính, sử dụng `mapStyle` prop
- **`Camera`**: Điều khiển vị trí và zoom của camera
- **`NativeUserLocation`**: Hiển thị vị trí người dùng
- **`LocationManager`**: Quản lý location updates
- **`Marker`**: Tạo markers trên bản đồ (sử dụng prop `lngLat`)

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
import { Marker } from '@mapvina-com/mapvina-react-native';

<Marker
  id="customMarker"
  lngLat={[longitude, latitude]}
>
  <View style={customMarkerStyle}>
    <Image source={require('./marker-icon.png')} />
  </View>
</Marker>
```

### 2. Map Styles

```typescript
// Có thể customize map style thông qua mapStyle prop
<Map
  mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key"
  style={styles.map}
>
```

### 3. Camera Animation

```typescript
<Camera
  zoomLevel={15}
  centerCoordinate={[106.6297, 10.8231]}
  animationMode="flyTo"        // "flyTo" | "easeTo" | "linearTo"
  animationDuration={2000}     // milliseconds
/>
```

## ⚠️ Lưu Ý Quan Trọng

### 1. API Key và MLNSettings

**Bắt buộc**: Cần cấu hình `MLNSettings` trong `AppDelegate.swift` trước khi sử dụng MapVina:

```swift
// AppDelegate.swift
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

**Quan trọng**: Nếu không gọi `MLNSettings.use(.mapVina)`, app sẽ crash trong `mbgl::MainResourceLoaderThread` (SIGABRT) khi tải map style.

API key cũng được nhúng trong style URL (`?key=public_key`).

**Không sử dụng HTTP1Protocol**: Việc đăng ký `NSURLProtocol` custom để force HTTP/1.1 gây crash trong `mbgl::PMTilesFileSource::Impl` khi `CFRunLoopRun` xử lý trên `ResourceLoaderThread`. MapVina SDK tự xử lý HTTP negotiation.

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
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>App cần quyền truy cập vị trí để hiển thị trên bản đồ</string>
```

## 🐛 Troubleshooting

### 1. Build Errors

**Lỗi**: "Missing package product 'MapVina'"
**Giải pháp**: Đảm bảo Podfile có cấu hình local SPM path (`spm_path = "../../../mapvina-gl-native-distribution"`) và `add_local_spm` trong `post_install`

**Lỗi**: "No script URL provided"
**Giải pháp**: Khởi động Metro bundler trước: `yarn start`

### 2. Runtime Errors

**Lỗi**: "Cannot read property 'None' of undefined"
**Giải pháp**: Không sử dụng `userTrackingMode` property (không supported)

**Lỗi**: TypeScript errors với props
**Giải pháp**: Chỉ sử dụng các props được documented trong MapVina API

## 📚 Tài Liệu Tham Khảo

- [MapVina React Native GitHub](https://github.com/mapvina/mapvina-react-native)
- [MapVina GL Native Distribution](https://github.com/mapvina/mapvina-gl-native-distribution)
- [React Native Documentation](https://reactnative.dev/)

## 🎯 Tính Năng Tiếp Theo

1. **Routing & Directions**: Tích hợp API chỉ đường
2. **Offline Maps**: Tải bản đồ offline
3. **Custom Styles**: Tạo map styles tùy chỉnh
4. **Geocoding**: Chuyển đổi địa chỉ thành tọa độ
5. **Clustering**: Nhóm markers khi zoom out

---

*Tài liệu này được cập nhật cho `@mapvina-com/mapvina-react-native` v1.0.1 và React Native v0.81.5+*

> **Quan trọng**: Khi sử dụng `showUserLocation={true}`, cần:
> 1. Request location permissions qua `LocationManager.requestPermissions()` trước
> 2. Chỉ render `<NativeUserLocation />` sau khi map ready (`onDidFinishLoadingMap`) và permission được granted
> 3. Điều này tránh crash trong `ResourceLoaderThread` do native exception 