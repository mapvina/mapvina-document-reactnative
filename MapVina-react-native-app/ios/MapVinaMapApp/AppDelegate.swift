import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import MapVina

@_silgen_name("installCPPExceptionHandler")
func installCPPExceptionHandler()

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    NSSetUncaughtExceptionHandler { exception in
      let stack = exception.callStackSymbols.joined(separator: "\n")
      print("UNCAUGHT EXCEPTION: \(exception.name)\nReason: \(exception.reason ?? "nil")\nStack:\n\(stack)")
    }

    installCPPExceptionHandler()

    // Configure MapVina SDK before any map operations
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
    NSLog("AppDelegate: MLNSettings configured + TLS capped at 1.2 (no QUIC)")

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "MapVinaMapApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
