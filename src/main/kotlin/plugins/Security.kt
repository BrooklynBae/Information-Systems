package com.example.plugins

import com.example.authentification.JwtService
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*

fun Application.configureSecurity() {
    val jwtService = JwtService()

    install(Authentication) {
        jwt("jwt") {
            verifier(jwtService.getVerifier())
            realm = "Service server"
            validate { credential ->
                val email = credential.payload.getClaim("email").asString()
                if (!email.isNullOrBlank()) JWTPrincipal(credential.payload) else null
            }
        }
    }
}
