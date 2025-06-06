// android/app/src/main/java/com/debugSecurityApp/SecurityServices/SecurityServiceManager.kt

package com.shreemati.SecurityService

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.BatteryManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedReader
import java.io.File
import java.io.FileReader
import java.io.IOException
import java.io.InputStreamReader
import java.net.Socket

class SecurityServiceManager(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SecurityServiceManager"
    }

    private val sensorManager: SensorManager =
            reactContext.getSystemService(ReactApplicationContext.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = null

    private val GENY_FILES = arrayOf("/dev/socket/genyd", "/dev/socket/baseband_genyd")

    private val PIPES = arrayOf("/dev/socket/qemud", "/dev/qemu_pipe")

    private val X86_FILES =
            arrayOf(
                    "ueventd.android_x86.rc",
                    "x86.prop",
                    "ueventd.ttVM_x86.rc",
                    "init.ttVM_x86.rc",
                    "fstab.ttVM_x86",
                    "fstab.vbox86",
                    "init.vbox86.rc",
                    "ueventd.vbox86.rc"
            )

    private val ANDY_FILES = arrayOf("fstab.andy", "ueventd.andy.rc")

    private val NOX_FILES = arrayOf("fstab.nox", "init.nox.rc", "ueventd.nox.rc")

    fun checkFiles(targets: Array<String>): Boolean {
        for (pipe in targets) {
            val file = File(pipe)
            if (file.exists()) {
                return true
            }
        }
        return false
    }

    fun checkEmulatorFiles(): Boolean {
        val ress =
                (checkFiles(GENY_FILES) ||
                        checkFiles(ANDY_FILES) ||
                        checkFiles(NOX_FILES) ||
                        checkFiles(X86_FILES) ||
                        checkFiles(PIPES))

        return ress
    }

    @ReactMethod
    private fun isFridaRunning(): Boolean {
        val fridaPorts = listOf(27042, 27043, 62001) // Default ports used by Frida
        for (port in fridaPorts) {
            try {
                val socket = Socket("localhost", port)
                socket.close()
                return true
            } catch (e: IOException) {
                // Port is not open
            }
        }
        return false
    }

    @ReactMethod
    fun isDeviceRooted(promise: Promise) {
        val rooted = checkRootMethod1() || checkRootMethod2() || checkRootMethod3()

        promise.resolve(rooted)
    }

    @ReactMethod
    fun isEmulator(promise: Promise) {
        val context = getReactApplicationContext()

        val osName = System.getProperty("os.name").lowercase()
        val isEmulator =
                (isEmulatorByCpuInfo() ||
                        checkEmulatorFiles() ||
                        isEmulatorByBattery(context) ||
                        //!checkSensors(sensorManager) ||
                        Build.FINGERPRINT.startsWith("generic") ||
                        Build.FINGERPRINT.startsWith("unknown") ||
                        Build.MODEL.contains("Emulator") ||
                        Build.MODEL.contains("Android SDK built for x86") ||
                        Build.MODEL.contains("sdk") ||
                        Build.MODEL.contains("google_sdk") ||
                        Build.MODEL.startsWith("generic") && Build.DEVICE.startsWith("generic") ||
                        "google_sdk" == Build.PRODUCT ||
                        Build.HARDWARE == "goldfish" ||
                        Build.HARDWARE == "ranchu" ||
                        Build.MANUFACTURER == "Genymotion" ||
                        Build.PRODUCT == "sdk_google" ||
                        Build.MODEL.toLowerCase().contains("droid4x") ||
                        Build.PRODUCT == "sdk" ||
                        Build.HARDWARE == "vbox86" ||
                        Build.PRODUCT == "sdk_x86" ||
                        Build.PRODUCT == "vbox86p" ||
                        Build.HARDWARE.toLowerCase().contains("nox") ||
                        Build.PRODUCT.toLowerCase().contains("nox") ||
                        Build.BOARD.toLowerCase().contains("nox") ||
                        Build.PRODUCT == "sdk_gphone64_arm64")

        promise.resolve(isEmulator)
    }

    private fun checkRootMethod1(): Boolean {
        val paths =
                arrayOf(
                        "/system/app/Superuser.apk",
                        "/sbin/su",
                        "/system/bin/su",
                        "/system/xbin/su",
                        "/data/local/xbin/su",
                        "/data/local/bin/su",
                        "/system/sd/xbin/su",
                        "/system/bin/failsafe/su",
                        "/data/local/su",
                        "/data/local/tmp/frida-server",
                        "/system/lib/frida-server",
                        "/data/data/com.frida.server",
                        "/data/local/tmp/frida",
                )
        for (path in paths) {
            if (File(path).exists()) return true
        }
        return false
    }

    private fun checkRootMethod2(): Boolean {
        try {
            val process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            val inStream = BufferedReader(InputStreamReader(process.inputStream))

            return inStream.readLine() != null
        } catch (e: Exception) {
            return false
        }
    }

    private fun checkRootMethod3(): Boolean {
        return Build.TAGS?.contains("test-keys") == true
    }

    private fun isEmulatorByCpuInfo(): Boolean {
        var isEmulator = false
        try {
            BufferedReader(FileReader("/proc/cpuinfo")).use { reader ->
                reader.forEachLine { line ->
                    // Check for emulator-specific hardware values
                    if (line.contains("Goldfish") ||
                                    line.contains("Ranchu") ||
                                    line.contains("Intel") ||
                                    line.contains("AMD") ||
                                    line.contains("qemu") ||
                                    line.contains("KVM") ||
                                    line.contains("i686")
                    ) {
                        isEmulator = true
                        return@forEachLine // Exit the lambda function
                    }
                }
            }
        } catch (e: IOException) {
            Log.e("isEmulatorByCpuInfo", "Error reading /proc/cpuinfo", e)
        }
        return isEmulator
    }

    private fun isEmulatorByBattery(context: Context): Boolean {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        return batteryLevel == 100 ||
                batteryLevel == 0 // Emulators often show full or empty battery
    }

    private fun checkSensors(sensorManager: SensorManager): Boolean {
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

        // Emulators may not simulate accelerometer or gyroscope well
        return accelerometer != null && gyroscope != null
    }
}