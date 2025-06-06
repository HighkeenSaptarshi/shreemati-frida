package com.shreemati.sslcertcheck

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class SSLPinningModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SSLPinning"
    }

    @ReactMethod
    fun validateCertificate(apiUrl: String, localCertAssetName: String, promise: Promise) {
        try {
            // Load the local certificate from the assets folder
            val localCertInputStream = reactApplicationContext.assets.open(localCertAssetName)

            // Perform SSL certificate validation
            var ress = SSLPinningUtil.matchCertificate(apiUrl, localCertInputStream)
            Log.i("SSL Pinning","Success")
            // If no exception, certificates match
            promise.resolve(ress)
        } catch (e: Exception) {
            // Reject the promise with the error message
            Log.i("SSL Pinning","Failed")
            promise.reject("CERT_ERROR", e.message, e)
        }
    }
}
