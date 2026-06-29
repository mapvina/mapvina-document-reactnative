import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import MapVina

@_silgen_name("installCPPExceptionHandler")
func installCPPExceptionHandler()

// NSURLProtocol that intercepts MapVina requests and forces HTTP/1.1
// by using NSURLConnection (which doesn't support QUIC)
class HTTP1Protocol: URLProtocol {
  static var propertyKey = "HTTP1ProtocolHandled"

  override class func canInit(with request: URLRequest) -> Bool {
    guard let scheme = request.url?.scheme?.lowercased(),
          scheme == "https" || scheme == "http" else { return false }
    guard let host = request.url?.host?.lowercased(),
          host.contains("mapvina.com") else { return false }
    if URLProtocol.property(forKey: propertyKey, in: request) != nil {
      return false
    }
    return true
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    request
  }

  override func startLoading() {
    var newRequest = (request as NSURLRequest).mutableCopy() as! NSMutableURLRequest
    URLProtocol.setProperty(true, forKey: HTTP1Protocol.propertyKey, in: newRequest)

    // Use NSURLConnection which only supports HTTP/1.1 (no QUIC)
    DispatchQueue.global().async { [weak self] in
      guard let self = self else { return }
      var response: URLResponse?
      do {
        let data = try NSURLConnection.sendSynchronousRequest(
          newRequest as URLRequest,
          returning: &response
        )
        if let httpResponse = response as? HTTPURLResponse {
          DispatchQueue.main.async {
            self.client?.urlProtocol(self, didReceive: httpResponse, cacheStoragePolicy: .notAllowed)
            self.client?.urlProtocol(self, didLoad: data)
            self.client?.urlProtocolDidFinishLoading(self)
          }
        }
      } catch {
        DispatchQueue.main.async {
          self.client?.urlProtocol(self, didFailWithError: error)
        }
      }
    }
  }

  override func stopLoading() {}
}

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

    // Register HTTP1Protocol in MLNNetworkConfiguration to force HTTP/1.1
    // This fixes QUIC/HTTP3 timeout in the iOS simulator
    let sessionConfig = URLSessionConfiguration.default
    sessionConfig.timeoutIntervalForResource = 30
    sessionConfig.httpMaximumConnectionsPerHost = 8
    sessionConfig.requestCachePolicy = .reloadIgnoringLocalCacheData
    sessionConfig.urlCache = nil
    var protocols = sessionConfig.protocolClasses ?? []
    protocols.insert(HTTP1Protocol.self, at: 0)
    sessionConfig.protocolClasses = protocols
    MLNNetworkConfiguration.sharedManager.sessionConfiguration = sessionConfig
    NSLog("AppDelegate: registered HTTP1Protocol in MLNNetworkConfiguration")

    MLNSettings.use(.mapVina)
    MLNSettings.apiKey = "public_key"

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
