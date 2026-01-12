package com.example.routes

import com.example.data.repository.UserRepositoryImpl
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.profileRoutes(userRepository: UserRepositoryImpl) {
    authenticate("jwt") {
        get("/api/profile") {
            val principal = call.principal<JWTPrincipal>()!!
            val email = principal.payload.getClaim("email").asString()
            val user = userRepository.getUserByEmail(email)
            call.respond(mapOf("email" to email, "login" to user?.login))
        }
    }
}
