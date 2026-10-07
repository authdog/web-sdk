// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Authdog",
    platforms: [
        .macOS(.v12),
        .iOS(.v15),
    ],
    products: [
        .library(name: "Authdog", targets: ["Authdog"]),
    ],
    targets: [
        .target(name: "Authdog"),
        .testTarget(name: "AuthdogTests", dependencies: ["Authdog"]),
    ]
)
