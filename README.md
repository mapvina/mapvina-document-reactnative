# MapVina React Native SDK

## Giới thiệu

MapVina là một thư viện bản đồ mạnh mẽ cho ứng dụng React Native, cung cấp giải pháp bản đồ chất lượng cao với nhiều tính năng tiên tiến. Thư viện này cho phép bạn tích hợp bản đồ tương tác, theo dõi vị trí người dùng và tùy chỉnh giao diện bản đồ một cách linh hoạt trong ứng dụng React Native của bạn.

### Lợi ích chính:
- Hiệu suất cao và tối ưu cho thiết bị di động
- Hỗ trợ đầy đủ cho cả iOS và Android
- Tích hợp dễ dàng với React Native (Expo và Pure React Native CLI)
- Nhiều tùy chọn tùy biến giao diện và tính năng
- Hỗ trợ theo dõi vị trí người dùng thời gian thực

## Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt](#cài-đặt)
   - [Tích hợp vào dự án Expo](#a-tích-hợp-vào-dự-án-expo)
   - [Tích hợp vào dự án React Native CLI thuần túy](#b-tích-hợp-vào-dự-án-react-native-cli-thuần-túy)
3. [Sử Dụng Cơ Bản](#sử-dụng-cơ-bản)
4. [Dự Án Mẫu](#-dự-án-mẫu)
5. [Xử Lý Lỗi Phổ Biến](#xử-lý-lỗi-phổ-biến)
6. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

## Yêu cầu hệ thống

### React Native
- React Native phiên bản **0.81.0** trở lên
- **New Architecture bắt buộc** (TurboModules + Fabric)
- Node.js **18** trở lên
- npm hoặc yarn

### iOS
- Xcode **16** trở lên (khuyến nghị Xcode 26+ cho Expo SDK 54)
- iOS **15.1** trở lên
- CocoaPods
- Swift Package Manager (SPM) — MapVina sử dụng SPM để phân phối native library

### Android
- Android Studio
- Android SDK Platform **24** trở lên (minSdkVersion)
- Compile SDK **35**
- Build Tools **35.0.0**
- NDK **27.1.12297006**
- Kotlin **2.1.20** (Expo) / **2.2.10** (RN CLI)

### Expo (nếu sử dụng)
- Expo SDK **54**
- **Không tương thích với Expo Go** — yêu cầu Development Build (`expo-dev-client`) hoặc `expo prebuild`
- EAS Build được khuyến nghị cho production

## Cài đặt

### 1. Cài đặt package

```bash
# npm
npm install @mapvina-com/mapvina-react-native

# yarn
yarn add @mapvina-com/mapvina-react-native
```

> **Lưu ý cho Expo**: Nếu sử dụng npm, thêm file `.npmrc` với nội dung `legacy-peer-deps=true` để tránh xung đột peer dependencies.

> **Lưu ý cho Yarn v4**: Nếu sử dụng Yarn v4 (Berry), tạo file `.yarnrc.yml` với nội dung `nodeLinker: node-modules` trước khi chạy `yarn install`.

---

### A. Tích hợp vào dự án Expo

> **Quan trọng**: MapVina SDK sử dụng native code và **không thể chạy trên Expo Go**. Bạn cần sử dụng Development Build hoặc Prebuild workflow.

#### Bước 1: Cấu hình Expo Plugin trong `app.json`

Thêm MapVina plugin vào `app.json`:

```json
{
  "expo": {
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
- **`spmSpec`**: Cấu hình Swift Package Manager cho iOS
  - `url`: Repository chứa MapVina native library
  - `requirement.kind`: `exactVersion` hoặc `upToNextMajor`
  - `version`: Phiên bản native library (1.0.0)
  - `product_name`: Tên product trong package (`MapVina`)

Plugin sẽ tự động:
- Thêm `$MLRN_SPM_SPEC` global variable vào Podfile
- Thêm `$MLRN.post_install(installer)` hook vào Podfile `post_install`
- Loại bỏ signature files build phase cho Xcode

#### Bước 2: Cấu hình iOS Info.plist

Thêm vào `app.json` trong phần `ios.infoPlist`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Ứng dụng cần quyền truy cập vị trí để hiển thị trên bản đồ",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Ứng dụng cần quyền truy cập vị trí để hiển thị trên bản đồ"
      }
    }
  }
}
```

#### Bước 3: Cấu hình iOS AppDelegate

> **Bắt buộc**: Sau khi chạy `expo prebuild`, bạn **phải chỉnh sửa thủ công** file `ios/<AppName>/AppDelegate.swift` để thêm cấu hình MapVina. Plugin không tự động sửa AppDelegate.

```swift
import Expo
import React
import ReactAppDependencyProvider
import MapVina  // ← Thêm import này

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // === MapVina SDK configuration (BẮT BUỘC) ===
    MLNSettings.use(.mapVina)
    MLNSettings.apiKey = "public_key"

    // Cap TLS at 1.2 để tránh QUIC timeout trên iOS Simulator
    let networkConfig = URLSessionConfiguration.default
    networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12
    networkConfig.timeoutIntervalForRequest = 30
    networkConfig.timeoutIntervalForResource = 60
    MLNNetworkConfiguration.sharedManager.sessionConfiguration = networkConfig
    // === End MapVina configuration ===

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    #if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    #endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  // ... phần còn lại giữ nguyên
}
```

> Nếu bỏ qua bước này, app sẽ **crash (SIGABRT)** trong `ResourceLoaderThread` khi tải map style.

#### Bước 4: Cấu hình Android MainApplication

> **Bắt buộc**: Sau khi chạy `expo prebuild`, bạn **phải chỉnh sửa thủ công** file `android/app/src/main/java/<package>/MainApplication.kt` để thêm khởi tạo MapVina.

```kotlin
import io.github.mapvina.android.MapVina
import io.github.mapvina.android.WellKnownTileServer

class MainApplication : Application(), ReactApplication {
  // ... phần còn lại giữ nguyên

  override fun onCreate() {
    super.onCreate()

    // === MapVina SDK initialization (BẮT BUỘC) ===
    MapVina.getInstance(this, "public_key", WellKnownTileServer.MapVina)

    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }
}
```

> Nếu bỏ qua bước này, bản đồ sẽ **không tải được tile** và màn hình sẽ trắng/trống.

#### Bước 5: Cấu hình Android permissions

Thêm vào `app.json` trong phần `android`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

Hoặc chỉnh sửa thủ công `android/app/src/main/AndroidManifest.xml` sau prebuild:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### Bước 6: Cấu hình Android gradle.properties

Thêm vào `android/gradle.properties` (sau `expo prebuild`):

```properties
# Disable K2 compiler để tránh internal compiler error với MapVina SDK
kotlin.compiler.execution.strategy=daemon
kotlin.compiler.useK2=false
```

#### Bước 7: Prebuild và chạy ứng dụng

```bash
# Tạo native directories
npx expo prebuild

# Chạy trên iOS
npx expo run:ios

# Chạy trên Android
npx expo run:android
```

> **Lưu ý**: Mỗi lần chạy `npx expo prebuild` (hoặc `npx expo prebuild --clean`), các file native sẽ được tạo lại. Bạn **cần thêm lại** cấu hình `MLNSettings` trong `AppDelegate.swift` và `MapVina.getInstance()` trong `MainApplication.kt` sau mỗi lần prebuild.

---

### B. Tích hợp vào dự án React Native CLI thuần túy

#### Bước 1: Cấu hình iOS Podfile

File `ios/Podfile` cần cấu hình để tích hợp MapVina Swift Package. Thêm vào `post_install` hook:

```ruby
target 'YourApp' do
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

    # Fix glog build issue (iOS 15.1+ deployment target)
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

    # Patch fmt/base.h: disable consteval on Apple Clang 20+ (Xcode 26)
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

> **Lưu ý `spm_path`**: Đường dẫn `../../../mapvina-gl-native-distribution` trỏ tới thư mục clone của `mapvina-gl-native-distribution` repo. Điều chỉnh đường dẫn cho phù hợp với cấu trúc dự án của bạn. Clone repo:
> ```bash
> git clone https://github.com/mapvina/mapvina-gl-native-distribution.git
> ```

#### Bước 2: Cài đặt iOS Pods

```bash
cd ios && pod install && cd ..
```

#### Bước 3: Cấu hình iOS AppDelegate

**Bắt buộc** — Chỉnh sửa `ios/<AppName>/AppDelegate.swift`:

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import MapVina  // ← Thêm import

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // === MapVina SDK configuration (BẮT BUỘC) ===
    MLNSettings.use(.mapVina)
    MLNSettings.apiKey = "public_key"

    // Cap TLS at 1.2 để tránh QUIC timeout trên iOS Simulator
    let networkConfig = URLSessionConfiguration.default
    networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12
    networkConfig.timeoutIntervalForRequest = 30
    networkConfig.timeoutIntervalForResource = 60
    MLNNetworkConfiguration.sharedManager.sessionConfiguration = networkConfig
    // === End MapVina configuration ===

    // ... phần React Native factory giữ nguyên
    return true
  }
}
```

> Nếu bỏ qua bước này, app sẽ **crash (SIGABRT)** trong `ResourceLoaderThread` khi tải map style.

#### Bước 4: Thêm quyền iOS Info.plist

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Ứng dụng cần quyền truy cập vị trí của bạn để hiển thị trên bản đồ</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Ứng dụng cần quyền truy cập vị trí của bạn để hiển thị trên bản đồ</string>
```

#### Bước 5: Cấu hình Android

**5a. Thêm quyền vào `android/app/src/main/AndroidManifest.xml`:**

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**5b. Cập nhật `android/build.gradle` (project-level):**

```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion = 24
        compileSdkVersion = 35
        targetSdkVersion = 35
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.2.10"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}
```

**5c. Thêm MapVina SDK dependency vào `android/app/build.gradle`:**

```gradle
dependencies {
    implementation("com.facebook.react:react-android")
    implementation("io.github.mapvina:android-sdk-opengl:1.0.1")  // ← MapVina SDK

    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

**5d. Thêm vào `android/gradle.properties`:**

```properties
# Disable K2 compiler để tránh internal compiler error với MapVina SDK
kotlin.compiler.execution.strategy=daemon
kotlin.compiler.useK2=false
```

#### Bước 6: Khởi tạo MapVina trong Android MainApplication

**Bắt buộc** — Chỉnh sửa `android/app/src/main/java/<package>/MainApplication.kt`:

```kotlin
import io.github.mapvina.android.MapVina
import io.github.mapvina.android.WellKnownTileServer

class MainApplication : Application(), ReactApplication {
  // ... phần còn lại giữ nguyên

  override fun onCreate() {
    super.onCreate()
    MapVina.getInstance(this, "public_key", WellKnownTileServer.MapVina)
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
```

> Nếu bỏ qua bước này, bản đồ sẽ **không tải được tile** và màn hình sẽ trắng/trống.

#### Bước 7: Bật New Architecture

MapVina SDK yêu cầu New Architecture. Đảm bảo:

**Android** — `android/gradle.properties`:
```properties
newArchEnabled=true
```

**iOS** — `ios/<AppName>/Info.plist`:
```xml
<key>RCTNewArchEnabled</key>
<true/>
```

#### Bước 8: Cài đặt dependencies và chạy ứng dụng

```bash
# Cài đặt JS dependencies
yarn install

# iOS
cd ios && pod install && cd ..
yarn ios

# Android
yarn android
```

## Sử dụng cơ bản

### 1. Hiển thị bản đồ đơn giản

```javascript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Map, Camera } from '@mapvina-com/mapvina-react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key"
      >
        <Camera
          zoomLevel={14}
          centerCoordinate={[106.6297, 10.8231]} // [longitude, latitude] — TP. Hồ Chí Minh
        />
      </Map>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default App;
```

> **Quan trọng**: MapVina sử dụng format **`[longitude, latitude]`** (khác với Google Maps dùng `[latitude, longitude]`).

### 2. Thêm marker vào bản đồ

```javascript
import { Map, Camera, Marker } from '@mapvina-com/mapvina-react-native';

// Trong component của bạn:
<Map style={styles.map} mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key">
  <Camera zoomLevel={14} centerCoordinate={[106.6297, 10.8231]} />
  <Marker id="marker1" lngLat={[106.6297, 10.8231]}>
    <View style={styles.markerContainer}>
      <View style={styles.marker} />
    </View>
  </Marker>
</Map>
```

### 3. Theo dõi vị trí người dùng

```javascript
import { Map, Camera, NativeUserLocation, LocationManager } from '@mapvina-com/mapvina-react-native';

// Request permission trước khi sử dụng
LocationManager.requestPermissions().then((granted) => {
  if (granted) {
    LocationManager.start();
  }
});

// Render
<Map style={styles.map} mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key">
  <Camera zoomLevel={14} centerCoordinate={[106.6297, 10.8231]} />
  <NativeUserLocation />
</Map>
```

> **Quan trọng**: Chỉ render `<NativeUserLocation />` **sau khi** map đã ready (`onDidFinishLoadingMap`) và permission đã được granted. Việc render quá sớm có thể gây crash trong `ResourceLoaderThread`.

### 4. Điều khiển tương tác bản đồ

```javascript
<Map
  style={styles.map}
  mapStyle="https://maps.mapvina.com/styles/v2/streets.json?key=public_key"
  compassEnabled={true}
  zoomEnabled={true}
  scrollEnabled={true}
  rotateEnabled={true}
  onPress={(feature) => {
    console.log('Map pressed:', feature.geometry.coordinates);
  }}
  onDidFinishLoadingMap={() => {
    console.log('Map is ready');
  }}
>
  <Camera zoomLevel={14} centerCoordinate={[106.6297, 10.8231]} />
</Map>
```

### 5. Camera animation

```javascript
<Camera
  zoomLevel={15}
  centerCoordinate={[106.6297, 10.8231]}
  animationMode="flyTo"      // "flyTo" | "easeTo" | "linearTo"
  animationDuration={2000}   // milliseconds
/>
```

## Xử lý lỗi phổ biến

### Lỗi runtime

1. **Bản đồ không hiển thị (màn hình trắng/trống)**
   - Kiểm tra `MLNSettings.use(.mapVina)` và `MLNSettings.apiKey` đã được gọi trong `AppDelegate` (iOS)
   - Kiểm tra `MapVina.getInstance(this, "public_key", WellKnownTileServer.MapVina)` đã được gọi trong `MainApplication.kt` (Android)
   - Xác nhận kết nối internet
   - Kiểm tra URL style map hợp lệ: `https://maps.mapvina.com/styles/v2/streets.json?key=public_key`

2. **App crash (SIGABRT) trong `ResourceLoaderThread` khi tải map style**
   - **Nguyên nhân**: Thiếu `MLNSettings.use(.mapVina)` trong iOS AppDelegate
   - **Khắc phục**: Thêm cấu hình `MLNSettings` vào `AppDelegate.swift` (xem [Bước 3 Expo](#bước-3-cấu-hình-ios-appdelegate) hoặc [Bước 3 RN CLI](#bước-3-cấu-hình-ios-appdelegate))

3. **Vị trí người dùng không hiển thị**
   - Kiểm tra quyền truy cập vị trí đã được cấp
   - Xác nhận GPS/Location đã được bật
   - Kiểm tra cấu hình trong `Info.plist` (iOS) và `AndroidManifest.xml` (Android)
   - Đảm bảo `LocationManager.requestPermissions()` được gọi trước khi `LocationManager.start()`
   - Chỉ render `<NativeUserLocation />` sau khi map ready và permission granted

4. **Marker không hiển thị**
   - Xác nhận tọa độ marker hợp lệ (format `[longitude, latitude]`)
   - Kiểm tra component `Marker` được import đúng từ `@mapvina-com/mapvina-react-native`
   - Đảm bảo marker nằm trong vùng nhìn thấy của camera

5. **iOS Simulator: Map tải chậm hoặc timeout**
   - **Nguyên nhân**: QUIC/HTTP3 timeout trong iOS Simulator
   - **Khắc phục**: Đảm bảo cap TLS at 1.2 trong AppDelegate:
   ```swift
   networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12
   ```

6. **Không sử dụng `userTrackingMode` property**
   - MapVina không hỗ trợ `userTrackingMode`. Sử dụng `Camera` với `followUserLocation` thay thế.

7. **App crash khi cold launch: `std::domain_error` trong `mbgl::EdgeInsets` (uncaught C++ exception)**
   - **Triệu chứng**: App render map ở lần chạy đầu nhưng crash (`libc++abi: terminating due to uncaught exception of type std::domain_error`) ở các lần cold launch tiếp theo. Stack trace đi qua `mbgl::EdgeInsets` → `-[MLNMapView cameraOptionsObjectForAnimatingToCamera:edgePadding:]` → `-[MLRNCamera _setInitialCamera]`.
   - **Nguyên nhân**: `<Camera>` được mount ngay khi map view chưa được layout (frame = `{0,0}`). `CameraUpdateItem._clippedPadding` khi đó tính ra edge inset **âm**, và `mbgl::EdgeInsets` ném `std::domain_error` (inset không được âm). Đây là một race condition về layout/timing.
   - **Khắc phục**: Chỉ mount `<Camera>` (và `<Marker>`) **sau khi** map đã sẵn sàng (`onDidFinishLoadingMap`), giống như quy tắc đã áp dụng cho `<NativeUserLocation />`:
   ```jsx
   const [isMapReady, setIsMapReady] = useState(false);

   <Map
     mapStyle={MAPVINA_STYLE_URL}
     onDidFinishLoadingMap={() => setIsMapReady(true)}
   >
     {isMapReady && (
       <Camera zoomLevel={14} centerCoordinate={[106.6297, 10.8231]} />
     )}
   </Map>
   ```
   > Quy tắc chung: mount `<Camera>`, `<Marker>`, `<NativeUserLocation />` chỉ sau `onDidFinishLoadingMap` để đảm bảo map view đã có kích thước hợp lệ.

8. **App crash ngay khi khởi động (cold launch) trên iOS — "Cannot find the keyWindow" (Expo dev-client, SDK 54)**
   - **Triệu chứng**: App crash `EXC_BREAKPOINT (SIGTRAP)` ngay trong `application:didFinishLaunchingWithOptions:`, trước khi vào được danh sách/bản đồ. Log: `EXDevLauncher/ExpoDevLauncherAppDelegateSubscriber.swift: Fatal error: Cannot find the keyWindow`. Có thể kèm `[EXDevLauncherController autoSetupStart:] was called before autoSetupPrepare:`.
   - **Nguyên nhân**: Từ Expo SDK 54, `EXAppDelegateWrapper` **không còn** kế thừa `RCTAppDelegate` nên **không tự tạo** React Native factory + `UIWindow` trong lúc khởi động. Nếu `AppDelegate` (Objective-C) còn dùng template cũ (chỉ set `moduleName` rồi gọi `[super ...]`), app sẽ không có key window và không có React bridge → `expo-dev-launcher` subscriber gọi `fatalError`.
   - **Khắc phục**: Theo đúng pattern SDK 54 (giống `AppDelegate.swift` của Expo template mới) — tạo `ExpoReactNativeFactory`, `bindReactNativeFactory`, tạo `UIWindow` và gọi `startReactNative...inWindow:` **trước** `[super application:...]`, để key window tồn tại trước khi dev-launcher subscriber chạy. Xem `sample/ios/MapVinaSample/AppDelegate.mm` để tham khảo (delegate được định nghĩa bằng Swift vì `ExpoReactNativeFactoryDelegate` là `objc_subclassing_restricted`). Cách đơn giản nhất: dùng Swift `AppDelegate` từ template Expo SDK 54 mới nhất.

### Lỗi build iOS

#### 1. Lỗi Hermes Engine
```bash
[!] Invalid `hermes-engine.podspec` file: No such file or directory
```

**Nguyên nhân:** Thiếu file package.json trong thư mục react-native, dependencies chưa cài đặt đầy đủ.

**Cách khắc phục:**
```bash
yarn install  # hoặc npm install
cd ios
rm -rf Pods
pod install
```

#### 2. Lỗi `fmt` consteval (Apple Clang 20+ / Xcode 26)

```bash
error: consteval function cannot be used in a constant expression
```

**Nguyên nhân:** Apple Clang 20+ (Xcode 26) có bug với `consteval` trong thư viện `fmt`.

**Cách khắc phục:** Thêm vào `post_install` hook trong Podfile (xem [Bước 1 RN CLI](#bước-1-cấu-hình-ios-podfile)):
```ruby
if target.name == 'fmt'
  target.build_configurations.each do |config|
    config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
  end
end

# Patch fmt/base.h
fmt_base_h = File.join(installer.sandbox.pod_dir('fmt').to_s, 'include', 'fmt', 'base.h')
if File.exist?(fmt_base_h)
  content = File.read(fmt_base_h)
  old_line = "#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L\n#  define FMT_USE_CONSTEVAL 0"
  new_line = old_line + "\n#elif defined(__apple_build_version__) && __apple_build_version__ >= 20000000L\n#  define FMT_USE_CONSTEVAL 0"
  if content.include?(old_line) && !content.include?("Apple clang 20+")
    FileUtils.chmod(0644, fmt_base_h)
    File.write(fmt_base_h, content.sub(old_line, new_line))
  end
end
```

#### 3. Lỗi `folly/coro/Coroutine.h` not found (RNReanimated)

```bash
fatal error: 'folly/coro/Coroutine.h' file not found
```

**Cách khắc phục:** Thêm vào `post_install` hook trong Podfile:
```ruby
if target.name == 'RNReanimated'
  target.build_configurations.each do |config|
    config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
    config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
  end
end
```

#### 4. Lỗi glog build (iOS deployment target)

**Cách khắc phục:** Thêm vào `post_install` hook trong Podfile:
```ruby
if target.name == 'glog'
  target.build_configurations.each do |config|
    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
    config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
    config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
  end
end
```

#### 5. Lỗi "Missing package product 'MapVina'" (RN CLI)

**Nguyên nhân:** Podfile thiếu cấu hình local SPM path.

**Cách khắc phục:** Đảm bảo Podfile có `add_local_spm` trong `post_install` với đúng `spm_path` trỏ tới `mapvina-gl-native-distribution` (xem [Bước 1 RN CLI](#bước-1-cấu-hình-ios-podfile)).

#### 6. Lỗi `$MLRN.post_install(installer)` không định nghĩa (Expo)

**Cách khắc phục:**
```bash
rm -rf ios
npx expo prebuild --platform ios
```

### Lỗi build Android

#### 1. MapVina native library không tìm thấy

**Cách khắc phục:**
```bash
cd android
./gradlew clean
cd ..
yarn android  # hoặc npx expo run:android
```

#### 2. Lỗi Kotlin internal compiler error

**Cách khắc phục:** Thêm vào `android/gradle.properties`:
```properties
kotlin.compiler.execution.strategy=daemon
kotlin.compiler.useK2=false
```

### Lỗi Metro Bundler

```bash
# Expo
npx expo start --clear

# React Native CLI
yarn start --reset-cache
```

### Mẹo Debug
- Sử dụng `console.log` để theo dõi các sự kiện bản đồ (`onPress`, `onDidFinishLoadingMap`)
- Kiểm tra logcat (Android) / Console (iOS) cho thông báo lỗi MapVina
- Xác minh tất cả dependencies đã được cài đặt đúng cách
- Đảm bảo New Architecture đã được bật

## Tài liệu tham khảo

### Repository Chính Thức
- [MapVina React Native](https://github.com/mapvina/mapvina-react-native)
- [MapVina Native](https://github.com/mapvina/mapvina-gl-native)
- [MapVina GL Native Distribution](https://github.com/mapvina/mapvina-gl-native-distribution)
- [Tài Liệu MapVina](https://mapvina.com)

### Một số hình ảnh minh họa

<p align="center">
<strong>Android Demo</strong><br/>
<img src="/images/android_1.png" alt="Android Demo 1" width="18%">
<img src="/images/android_2.png" alt="Android Demo 2" width="18%">
<img src="/images/android_3.png" alt="Android Demo 3" width="18%">
<img src="/images/android_4.png" alt="Android Demo 4" width="18%">
<img src="/images/android_5.png" alt="Android Demo 5" width="18%">
</p>

<p align="center">
<strong>iOS Demo</strong><br/>
<img src="/images/ios_1.png" alt="iOS Demo 1" width="18%">
<img src="/images/ios_2.png" alt="iOS Demo 2" width="18%">
<img src="/images/ios_3.png" alt="iOS Demo 3" width="18%">
<img src="/images/ios_4.png" alt="iOS Demo 4" width="18%">
</p>

<p align="center">
<strong>Ảnh minh họa lỗi</strong><br/>
<img src="/images/error_1.png" alt="Error Screenshot 1" width="30%">
<img src="/images/error_2.png" alt="Error Screenshot 2" width="30%">
<img src="/images/error_3.png" alt="Error Screenshot 3" width="30%">
</p>

## 📁 Dự Án Mẫu

Repository này bao gồm 3 dự án mẫu hoàn chỉnh để bạn tham khảo và học tập:

### 🚀 MapVina-expo-app/

**Ứng dụng React Native Expo tích hợp MapVina** - Dành cho dự án sử dụng Expo

**Đặc điểm:**
- ✅ **Framework**: Expo với Prebuild workflow
- ✅ **MapVina SDK**: v1.0.1 (npm `@mapvina-com/mapvina-react-native`)
- ✅ **React Native**: v0.81.5, Expo SDK 54
- ✅ **Native Integration**: Sử dụng Expo Plugin system
- ✅ **iOS Configuration**: Swift Package Manager thông qua plugin
- ✅ **TypeScript**: Hỗ trợ đầy đủ với type safety

**Tính năng chính:**
- 🗺️ Hiển thị bản đồ MapVina với giao diện đẹp
- 📍 Custom marker và point annotations
- 👆 Xử lý sự kiện tap trên bản đồ
- 📱 UI hiện đại với header/footer
- 🎨 Shadow effects và border radius

**Cách sử dụng:**
```bash
cd MapVina-expo-app
npm install
npx expo prebuild    # Tạo native directories
# Sau prebuild: chỉnh sửa AppDelegate.swift và MainApplication.kt (xem hướng dẫn phía trên)
npm run ios          # Chạy trên iOS
npm run android      # Chạy trên Android
```

> **Quan trọng**: Sau khi chạy `npx expo prebuild`, bạn cần thêm cấu hình `MLNSettings` vào `AppDelegate.swift` và `MapVina.getInstance()` vào `MainApplication.kt` thủ công. Plugin chỉ tự động cấu hình Podfile, không sửa AppDelegate/MainApplication.

**Phù hợp cho:**
- Dự án mới bắt đầu với Expo
- Ứng dụng cần deploy lên App Store/Play Store
- Team muốn tận dụng Expo ecosystem

---

### ⚡ MapVina-react-native-app/

**Ứng dụng React Native thuần túy** - Dành cho dự án không sử dụng Expo

**Đặc điểm:**
- ✅ **Framework**: Pure React Native CLI
- ✅ **MapVina SDK**: v1.0.1
- ✅ **React Native**: v0.81.5
- ✅ **Package Manager**: Yarn v4 với `nodeLinker: node-modules`
- ✅ **iOS Setup**: Manual Podfile configuration với local SPM
- ✅ **Android Setup**: `io.github.mapvina:android-sdk-opengl:1.0.1` dependency
- ✅ **TypeScript**: Support với custom types

**Tính năng chính:**
- 🗺️ Component bản đồ tương tự Expo app
- 📍 Point annotations với custom styling  
- 🎯 Event handling cho map interactions
- 🏗️ Architecture sạch với component separation
- ⚙️ Manual native configuration

**Cách sử dụng:**
```bash
cd MapVina-react-native-app
yarn install
cd ios && pod install && cd ..
yarn ios            # Chạy trên iOS  
yarn android         # Chạy trên Android
```

**Phù hợp cho:**
- Dự án React Native hiện có
- Ứng dụng cần custom native modules
- Team có kinh nghiệm với native development

---

### 🎯 sample/

**Comprehensive Examples Collection** - Bộ sưu tập ví dụ đầy đủ nhất

**Đặc điểm:**
- ✅ **Architecture**: Expo với shared workspace
- ✅ **MapVina SDK**: v1.0.1
- ✅ **React Native**: v0.81.5, Expo SDK 54
- ✅ **Navigation**: React Navigation với nested screens
- ✅ **Workspace**: Monorepo setup với shared code
- ✅ **Examples**: 50+ ví dụ được tổ chức theo categories

**Bao gồm các examples:**

📍 **Map Features:**
- Show Map, Local Style JSON, Show Click
- Two Map Views, Offline Region, Pixel Point
- Layer Visibility, Change Colors, Tint Color

📷 **Camera Controls:**
- Fit Bounds, Set Pitch/Heading, Fly To
- Restrict Bounds, Take Snapshots, Yo-yo Effect
- Get Zoom/Center, Compass View

👤 **User Location:**
- Follow User Location (Alignment & Render Mode)
- User Location for Navigation
- Location Updates & Displacement
- Android FPS Configuration

🏷️ **Annotations & Markers:**
- Point Annotations & Anchors
- Custom Icons, Marker Views, Heatmaps
- Custom Callouts, Symbol Layers

🎨 **Styling & Layers:**
- GeoJSON Source, Raster Tiles, Indoor Maps
- Vector Sources, Image Overlays
- Gradient Lines, PMTiles Support

⚡ **Animations:**
- Animate Circle Along Line
- Animated Length/Morph/Size
- Reanimated Points

🔧 **Advanced Features:**
- Clustering (Earthquakes example)
- Data-driven Circle Colors
- Query Features (Point & Bounding Box)
- Cache Management

**Cách sử dụng:**
```bash
cd sample
yarn install
yarn start           # Expo development server
yarn ios             # iOS Simulator
yarn android         # Android Emulator
```

**Phù hợp cho:**
- Học tập và tham khảo implementation
- Test các tính năng trước khi tích hợp
- Hiểu rõ API và best practices

---

### 🚀 Cách chọn dự án phù hợp

| Tiêu chí | MapVina-expo-app | MapVina-react-native-app | sample |
|----------|-------------------|---------------------------|---------|
| **Độ phức tạp** | Đơn giản | Trung bình | Cao |
| **Expo** | ✅ Có | ❌ Không | ✅ Có |
| **Learning curve** | Thấp | Trung bình | Cao |
| **Examples** | Basic | Basic | Comprehensive |
| **Production ready** | ✅ | ✅ | ❌ (Demo only) |

**Khuyến nghị:**
- **Bắt đầu mới**: `MapVina-expo-app`
- **Dự án RN hiện có**: `MapVina-react-native-app`  
- **Học tập/Research**: `sample`

Clone repository và khám phá các ví dụ để hiểu rõ hơn cách triển khai các tính năng cụ thể.

### Hỗ Trợ Cộng Đồng
Nếu bạn gặp vấn đề hoặc có câu hỏi:
- Tạo issue trên GitHub
- Kiểm tra các issue hiện có để tìm giải pháp
- Đóng góp cho dự án bằng cách gửi pull requests

## Giấy phép

MapVina React Native SDK được phát hành dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## ✅ Kết quả kiểm thử (Verification)

Cả 3 dự án mẫu đã được build và chạy thực tế trên **iOS Simulator (iPhone 16, Xcode 26.4)** và **Android Emulator (Pixel 7, API 36)**. Mỗi app được mở vào màn hình bản đồ, xác nhận style MapVina (`https://maps.mapvina.com/styles/v2/streets.json?key=public_key`) tải và hiển thị đúng (không trắng màn hình, không crash), có chụp màn hình minh chứng.

| Dự án | iOS | Android | Ghi chú |
|-------|-----|---------|---------|
| **MapVina-expo-app** | ✅ Hiển thị bản đồ | ✅ Hiển thị bản đồ | zoom 5 — vùng Nam Bộ (đất liền + biển) |
| **MapVina-react-native-app** | ✅ Hiển thị bản đồ | ✅ Hiển thị bản đồ | zoom 5 — vùng Nam Bộ (đất liền + biển) |
| **sample** | ✅ Hiển thị bản đồ | ✅ Hiển thị bản đồ | zoom 14 — chi tiết đường/nước + marker |

Tiêu chí PASS: bề mặt bản đồ hiển thị (light map surface, có nước/đường), log runtime xác nhận `onDidFinishLoadingMap` ("MapVina Map is ready") và tải style/tile thành công, không có `SIGABRT` / `std::domain_error` / FATAL EXCEPTION.

<p align="center">
<strong>iOS — MapVina rendered</strong><br/>
<img src="/images/verify_ios_expo.png" alt="iOS Expo app" width="24%">
<img src="/images/verify_ios_rn.png" alt="iOS RN CLI app" width="24%">
<img src="/images/verify_ios_sample.png" alt="iOS sample app" width="24%">
</p>

<p align="center">
<strong>Android — MapVina rendered</strong><br/>
<img src="/images/verify_android_expo.png" alt="Android Expo app" width="24%">
<img src="/images/verify_android_rn.png" alt="Android RN CLI app" width="24%">
<img src="/images/verify_android_sample.png" alt="Android sample app" width="24%">
</p>

### Sửa lỗi phát hiện trong quá trình kiểm thử

1. **Cold-launch crash (`std::domain_error` / `mbgl::EdgeInsets`)** — đã gate `<Camera>`/`<Marker>` sau `onDidFinishLoadingMap` (isMapReady) trong cả 3 app:
   - `MapVina-expo-app/components/MapVinaMapView.tsx`
   - `MapVina-react-native-app/components/MapVinaMapView.tsx`
   - `sample/src/components/Map.tsx`
   Xem chi tiết ở [Lỗi runtime #7](#xử-lý-lỗi-phổ-biến).
2. **iOS Simulator QUIC/HTTP3 timeout gây map trắng** — đã cap TLS 1.2 trong AppDelegate:
   - `MapVina-expo-app/ios/.../AppDelegate.swift` (`networkConfig.tlsMaximumSupportedProtocolVersion = .TLSv12`)
   - `sample/ios/MapVinaSample/AppDelegate.mm` (`nc.TLSMaximumSupportedProtocolVersion = tls_protocol_version_TLSv12;`)
   Xem [Lỗi runtime #5](#xử-lý-lỗi-phổ-biến).

> Công cụ kiểm tra ảnh chụp tự động ở `verification/check_map.py` (phân loại RENDERED / BLANK / ERROR dựa trên độ đa dạng màu của vùng bản đồ).

