package io.github.blocappbuilder.bloc

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * Puls aus Health Connect (Android): Uhren wie Pixel Watch, Galaxy Watch oder Garmin schreiben ihre Messwerte
 * über ihre eigene App dorthin. BLOC liest nur die Herzfrequenz, und nur für den Zeitraum eines eigenen Laufs.
 * Nichts wird geschrieben, nichts verlässt das Gerät. Die Auswertung (Durchschnitt, Zonen) macht die Web-Seite.
 */
@CapacitorPlugin(name = "BlocPuls")
class BlocPulsPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val rechte = setOf(HealthPermission.getReadPermission(HeartRateRecord::class))
    private val vertrag = PermissionController.createRequestPermissionResultContract()

    override fun handleOnDestroy() {
        scope.cancel()
    }

    /** "ok" | "installieren" (Health Connect fehlt oder braucht ein Update) | "nicht" (Gerät zu alt) */
    private fun zustand(): String {
        if (Build.VERSION.SDK_INT < 28) return "nicht"
        return when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> "ok"
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "installieren"
            else -> if (Build.VERSION.SDK_INT >= 34) "nicht" else "installieren"
        }
    }

    /** { status, erlaubt } */
    @PluginMethod
    fun status(call: PluginCall) {
        val z = zustand()
        if (z != "ok") {
            call.resolve(JSObject().put("status", z).put("erlaubt", false))
            return
        }
        scope.launch {
            try {
                val da = HealthConnectClient.getOrCreate(context).permissionController.getGrantedPermissions()
                call.resolve(JSObject().put("status", z).put("erlaubt", da.containsAll(rechte)))
            } catch (e: Exception) {
                call.resolve(JSObject().put("status", z).put("erlaubt", false))
            }
        }
    }

    /** Fragt die Erlaubnis zum Lesen der Herzfrequenz (Health-Connect-Dialog). -> { erlaubt } */
    @PluginMethod
    fun erlauben(call: PluginCall) {
        if (zustand() != "ok") {
            call.resolve(JSObject().put("erlaubt", false))
            return
        }
        startActivityForResult(call, vertrag.createIntent(context, rechte), "erlaubenFertig")
    }

    @ActivityCallback
    private fun erlaubenFertig(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val bekommen = vertrag.parseResult(result.resultCode, result.data)
        call.resolve(JSObject().put("erlaubt", bekommen.containsAll(rechte)))
    }

    /** Health Connect im Play Store öffnen (installieren oder aktualisieren) */
    @PluginMethod
    fun installieren(call: PluginCall) {
        val paket = "com.google.android.apps.healthdata"
        val uri = Uri.parse("market://details?id=$paket&url=healthconnect%3A%2F%2Fonboarding")
        try {
            val i = Intent(Intent.ACTION_VIEW, uri).setPackage("com.android.vending").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(i)
        } catch (e: Exception) {
            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$paket")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        }
        call.resolve()
    }

    /** Herzfrequenz im Zeitraum { von, bis } (ms seit 1970) -> { werte:[[ms, bpm], …] } zeitlich sortiert */
    @PluginMethod
    fun lesen(call: PluginCall) {
        val von = call.getLong("von")
        val bis = call.getLong("bis")
        if (von == null || bis == null || bis <= von || zustand() != "ok") {
            call.reject("ungueltig")
            return
        }
        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val proben = ArrayList<Pair<Long, Long>>()
                var seite: String? = null
                var runden = 0
                do {
                    val antwort = client.readRecords(
                        ReadRecordsRequest(
                            HeartRateRecord::class,
                            TimeRangeFilter.between(Instant.ofEpochMilli(von), Instant.ofEpochMilli(bis)),
                            pageSize = 1000,
                            pageToken = seite
                        )
                    )
                    for (rec in antwort.records) {
                        for (p in rec.samples) {
                            val ms = p.time.toEpochMilli()
                            if (ms in von..bis && p.beatsPerMinute in 25..250) proben.add(Pair(ms, p.beatsPerMinute))
                        }
                    }
                    seite = antwort.pageToken
                    runden++
                } while (seite != null && runden < 20)
                proben.sortBy { it.first }
                val werte = JSArray()
                for ((ms, bpm) in proben) werte.put(JSArray().put(ms).put(bpm))
                call.resolve(JSObject().put("werte", werte))
            } catch (e: SecurityException) {
                call.reject("keineErlaubnis")
            } catch (e: Exception) {
                call.reject("fehler")
            }
        }
    }
}
