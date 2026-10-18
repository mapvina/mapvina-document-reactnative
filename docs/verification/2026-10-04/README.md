# mapvina-document-reactnative: verification 04/10/2026

**Status: BLOCKED.**

npm public `@mapvina-com/mapvina-react-native@1.0.2`; main sample manifests/locks still target older dependency state.

Source baseline: `35bffd6fd02a65044e2038696192ce68bdd9ea16` (`origin/main` plus the sample/doc changes in this PR).

Audit only: no SDK API/version changes, tags, publishing or main merge.

## Kiểm chứng package npm public, không dùng wrapper source local

RN CLI và Expo đều được thử với package public `1.0.2` bằng lệnh sau trong
từng sample. Lệnh audit cố ý không rewrite manifest/lockfile hiện có:

Set `AUDIT` to this report's `evidence` directory (absolute path). The init script
removes Maven local from dependency repositories; it does not alter SDK source.

```bash
export AUDIT="$(pwd)/docs/verification/2026-10-04/evidence"
cd MapVina-react-native-app
npm install --no-save --package-lock=false --ignore-scripts --legacy-peer-deps \
  @mapvina-com/mapvina-react-native@1.0.2
node -p 'require("./node_modules/@mapvina-com/mapvina-react-native/package.json").version'
cd android
./gradlew -I "$AUDIT/public-repositories.gradle" :app:assembleDebug --console=plain
```

Lặp lại từ repo root với `cd MapVina-expo-app` để thử Expo; giữ `AUDIT` là
đường dẫn absolute của evidence repo, không tính lại sau khi `cd`.

Install và version check PASS. Android RN CLI và Expo đều BLOCKED tại
`:mapvina-com_mapvina-react-native:compileDebugKotlin`, `Unresolved reference
'plugins'` và các class annotation (`Symbol`, `SymbolManager`, ...).
Lượt public-only có Gradle init script loại Maven local; xem log tương ứng.
GeoJSON `1.0.1` xuất hiện trên classpath nhờ native core transitive dependency;
không khẳng định GeoJSON là lỗi hiện tại chỉ dựa vào log cũ tháng 9.

AAR annotation `1.0.0` chứa `com/mapvina/android/plugins/annotation/Symbol.class`,
không có class trong `io/github/mapvina/android/plugins/`. Wrapper npm import
namespace mới. Đây là blocker cần sửa/phát hành ở SDK, không sửa trong PR docs.

iOS của cả hai sample thử `pod install --deployment`: BLOCKED vì lockfile/spec
checksums không khớp package đang audit. Không đổi Podfile.lock để ép vượt gate;
Xcode build và iOS runtime được ghi NOT TESTED, không suy ra từ native iOS sample.
SPM public hiện chỉ `1.0.0` và còn logo cũ. Cần sample lockfile mới được kiểm chứng
sau khi wrapper sửa namespace, trước khi quảng bá hướng dẫn production.

Node 22.22.3, RN 0.81.5, Expo 54 trong sample. Package publish dùng scope
`@mapvina-com`, không phải `@mapvina`. Không publish npm hoặc merge migration.

## Evidence and acceptance boundary

- [rn-install.log](evidence/rn-install.log)
- [expo-install.log](evidence/expo-install.log)
- [rn-android-public.log](evidence/rn-android-public.log)
- [expo-android-public.log](evidence/expo-android-public.log)
- [rn-ios-pods.log](evidence/rn-ios-pods.log)
- [expo-ios-pods.log](evidence/expo-ios-pods.log)

[Cross-repository artifact and runtime audit](https://github.com/mapvina/mapvina-document-android/blob/codex/docs-verification-20261004/docs/verification/2026-10-04/README.md).

PASS applies only to the named checks. BLOCKED is a reproduced failure; NOT TESTED is not a pass.

## Separate follow-up

[Reproduced blocker issue](https://github.com/mapvina/mapvina-react-native/issues/18). SDK/infra fixes are outside this PR.
