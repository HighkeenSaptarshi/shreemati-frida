package com.shreemati.sslcertcheck

import android.util.Base64
import android.util.Log
import java.io.InputStream
import java.net.URL
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.net.ssl.HttpsURLConnection

object SSLPinningUtil {

    @Throws(Exception::class)
    fun matchCertificate(apiUrl: String, localCertInputStream: InputStream): Boolean {
        val certFactory = CertificateFactory.getInstance("X.509")

        // Fetch server certificate from the API URL
        val serverCertificate: X509Certificate = getServerCertificate(apiUrl)
        val serverCertPublicKey = Base64.encodeToString(serverCertificate.publicKey.encoded, Base64.NO_WRAP)

        // Load local certificate from assets
        val localCertificate = certFactory.generateCertificate(localCertInputStream) as X509Certificate
        val localCertPublicKey = Base64.encodeToString(localCertificate.publicKey.encoded, Base64.NO_WRAP)

        // Compare the public keys of both certificates
        if (!serverCertPublicKey.equals(localCertPublicKey)) {
            Log.i("server key", "Did not match")
            throw Exception("Certificate mismatch: The server certificate does not match the local certificate.")
        }
        Log.i("server key", "Matched")

        return true
    }

    private fun getServerCertificate(apiUrl: String): X509Certificate {
        val url = URL(apiUrl)
        val connection = url.openConnection() as HttpsURLConnection

        try {
            // Connect to the server to initiate the SSL handshake
            connection.connect()

            // Fetch the server's certificate chain
            val certificates = connection.serverCertificates
            if (certificates.isNotEmpty() && certificates[0] is X509Certificate) {
                return certificates[0] as X509Certificate
            } else {
                throw Exception("No valid certificate found from server.")
            }
        } finally {
            connection.disconnect()
        }
    }
}
