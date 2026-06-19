# MapVina Map App - Expo

Ứng dụng React Native Expo tích hợp bản đồ MapVina, được phát triển dựa trên dự án MapVina-react-native-app gốc.

## 🌟 Tính năng

- 🗺️ Hiển thị bản đồ MapVina với giao diện đẹp
- 📍 Đánh dấu vị trí trên bản đồ
- 👆 Tương tác với bản đồ (tap để hiện thông tin tọa độ)
- 📱 Tương thích với cả iOS và Android
- 🎨 Giao diện hiện đại và thân thiện

## 🚀 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Cài đặt dependencies

```bash
npm install
```

## 🏃‍♂️ Chạy ứng dụng

### Chạy trên Expo Go

```bash
npm start
```

Sau đó scan QR code bằng Expo Go app trên điện thoại.

### Chạy trên emulator/simulator

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🗂️ Cấu trúc dự án

```
├── App.tsx                 # Component chính của ứng dụng
├── components/
│   └── MapVinaMapView.tsx # Component bản đồ MapVina
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
├── jest.config.js
└── README.md
```

## 📱 Component chính

### MapVinaMapView

Component này cung cấp giao diện bản đồ MapVina với các tính năng:

- Hiển thị bản đồ với tọa độ mặc định tại TP.HCM
- Marker tùy chỉnh
- Xử lý sự kiện tap trên bản đồ
- Animation khi thay đổi vị trí camera

### App

Component gốc chứa:

- Header với tiêu đề ứng dụng
- Map container với shadow effect
- Footer thông tin

## 🛠️ Scripts có sẵn

```bash
npm start          # Khởi động Expo development server
npm run android    # Chạy trên Android
npm run ios        # Chạy trên iOS  
npm run web        # Chạy trên web browser
npm run lint       # Kiểm tra code với ESLint
npm run test       # Chạy unit tests
```

## 📦 Dependencies chính

- **@mapvina/mapvina-react-native**: SDK bản đồ MapVina
- **expo**: Framework phát triển React Native
- **react**: Library UI
- **react-native**: Framework mobile

## 🔧 Cấu hình

### MapVina

```typescript
// Trong MapVinaMapView.tsx
MapVinaGL.setAccessToken(null); // Không cần token cho basic usage
```

### Tọa độ mặc định

```typescript
centerCoordinate: [106.6297, 10.8231] // TP. Hồ Chí Minh
```

## 🎨 Tùy chỉnh

### Thay đổi vị trí mặc định

Sửa `centerCoordinate` trong `App.tsx`:

```typescript
<MapVinaMapView
  centerCoordinate={[longitude, latitude]}
  zoomLevel={12}
/>
```

### Tùy chỉnh marker

Sửa style trong `MapVinaMapView.tsx`:

```typescript
const styles = StyleSheet.create({
  marker: {
    backgroundColor: 'your-color',
    borderRadius: 20,
    // ... other styles
  },
});
```

## 🐛 Xử lý lỗi thường gặp

### Lỗi Metro bundler

```bash
npx expo start --clear
```

### Lỗi dependencies

```bash
rm -rf node_modules
npm install
```

### Lỗi trên macos M1 
Installing glog (0.3.5) bị đứng không chạy tiếp - Khắc phục là khởi động lại máy và chạy pod install lại

## 📝 License

Dự án này được phát triển dựa trên MapVina React Native SDK.

## 🤝 Đóng góp

Chào mừng mọi đóng góp để cải thiện dự án!

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📞 Liên hệ

Nếu có vấn đề hay góp ý, vui lòng tạo issue trên GitHub repository. 