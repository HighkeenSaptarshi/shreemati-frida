package com.shreemati.sslcertcheck 
 
import android.os.Debug
import java.io.BufferedReader
import java.io.File
import java.io.FileReader
import java.io.InputStreamReader
 
object FridaDetector {
 
    fun isFridaServerRunning(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("netstat")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            reader.useLines { lines ->
                lines.any { it.contains("27042") || it.contains("27043") }
            }
        } catch (e: Exception) {
            false
        }
    }
 
    fun isFridaDetected(): Boolean {
        val knownFridaProcesses = listOf("frida-server", "frida", "gum-js-loop")
        return try {
            val process = Runtime.getRuntime().exec("ps")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            reader.useLines { lines ->
                lines.any { line -> knownFridaProcesses.any { line.contains(it) } }
            }
        } catch (e: Exception) {
            false
        }
    }
 
    fun scanForFridaLibraries(): Boolean {
        return try {
            val reader = BufferedReader(FileReader("/proc/self/maps"))
            reader.useLines { lines ->
                lines.any { it.contains("frida") || it.contains("gum-js") }
            }
        } catch (e: Exception) {
            false
        }
    }
 
    fun isTracerAttached(): Boolean {
        return try {
            val reader = BufferedReader(FileReader("/proc/self/status"))
            reader.useLines { lines ->
                lines.any {
                    it.startsWith("TracerPid:") && it.split("\\s+".toRegex())[1] != "0"
                }
            }
        } catch (e: Exception) {
            false
        }
    }
}