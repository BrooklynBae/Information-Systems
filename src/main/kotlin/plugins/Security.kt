package com.example.plugins

import com.example.authentification.JwtService
import io.ktor.server.application.*

fun Application.configureSecurity() {

    val jwtService = JwtService()
}