package com.example.plugins

import com.example.authentification.JwtService
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.UserUseCase
import com.example.routes.authRoutes
import com.example.routes.profileRoutes
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {

    val jwtService = JwtService()
    val userRepo = UserRepositoryImpl()
    val userUseCase = UserUseCase(userRepo, jwtService)

    routing {
        get("/") { call.respondText("Hello World!") }

        authRoutes(userUseCase)
        profileRoutes(userRepo)
    }
}
