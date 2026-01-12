package com.example.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import org.slf4j.event.Level

fun Application.configureMonitoring() {
    install(CallLogging) {
        level = Level.INFO
    }

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            cause.printStackTrace() // <-- появится в консоли
            call.respond(
                io.ktor.http.HttpStatusCode.InternalServerError,
                mapOf("message" to (cause.message ?: "Internal error"))
            )
        }
    }
}
