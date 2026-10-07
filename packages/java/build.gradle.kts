plugins {
    `java-library`
}

group = "com.authdog"
version = "0.1.0"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.json:json:20250107")
    compileOnly("jakarta.servlet:jakarta.servlet-api:6.0.0")

    testImplementation("jakarta.servlet:jakarta.servlet-api:6.0.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")
    testImplementation("org.mockito:mockito-core:5.14.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}
