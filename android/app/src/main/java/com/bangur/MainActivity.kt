package com.shree.mati

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.shreemati.sslcertcheck.FridaDetector

import android.os.Handler
import android.os.Looper
import android.util.Log

import android.app.Activity;
import android.os.Bundle;
import android.os.Process;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class MainActivity : ReactActivity() {

  private val handler = Handler(Looper.getMainLooper())
    private val checkInterval: Long = 10_000 // 10 seconds
 
    private val fridaCheckRunnable = object : Runnable {
        override fun run() {
            if (FridaDetector.isFridaServerRunning() ||
                FridaDetector.isFridaDetected() ||
                FridaDetector.scanForFridaLibraries() ||
                FridaDetector.isTracerAttached()
            ) {
                Log.e("FRIDA DETECTION", "⚠️ Frida activity detected!")
                System.exit(-1)
                // Optionally, terminate the app or notify a server
            } else {
                Log.i("FRIDA DETECTION", "✅ No Frida activity detected.")
            }
            handler.postDelayed(this, checkInterval)
        }
    }
 
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        handler.post(fridaCheckRunnable)
    }
 
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(fridaCheckRunnable)
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Shreemati"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
