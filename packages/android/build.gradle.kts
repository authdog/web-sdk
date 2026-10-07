plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.serialization") version "2.2.0"
}

group = "com.authdog"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    testImplementation(kotlin("test"))
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

// Reuse the Kotlin language core (public key, cookies, redirects) without pulling
// the Ktor server adapter onto an Android classpath.
sourceSets {
    main {
        kotlin {
            srcDir("../kotlin/src/main/kotlin")
            exclude("com/authdog/Ktor.kt")
            exclude("com/authdog/Identity.kt")
        }
    }
}

tasks.test {
    useJUnitPlatform()
}
