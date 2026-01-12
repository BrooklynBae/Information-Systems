package com.example.plugins

import com.example.authentification.JwtService
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.UserUseCase
import com.example.routes.authRoutes
import com.example.routes.profileRoutes
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    val jwtService = JwtService()
    val userRepo = UserRepositoryImpl()
    val userUseCase = UserUseCase(userRepo, jwtService)

    routing {

        get("/") {
            call.respondText("Hello World!")
        }

        authRoutes(userUseCase)
        profileRoutes(userRepo)

        // ===== AUTH =====
        route("/api/auth") {
            post("/logout") {
                call.respond(mapOf("ok" to true))
            }
            get("/refresh") {
                call.respond(mapOf("token" to "new-jwt-token"))
            }
        }

        // ===== PROFILE =====
        route("/api/profile") {
            authenticate("jwt") {
                put {
                    val body = call.receive<Map<String, String>>()
                    call.respond(body)
                }
            }
        }

        // ===== USERS =====
        route("/api/users") {

            get {
                call.respond(
                    listOf(
                        mapOf("id" to 1, "login" to "admin", "email" to "admin@test.com")
                    )
                )
            }

            post {
                val body = call.receive<Map<String, String>>()
                call.respond(
                    mapOf(
                        "id" to 2,
                        "login" to body["login"],
                        "email" to body["email"]
                    )
                )
            }

            put("/{id}") {
                val body = call.receive<Map<String, String>>()
                call.respond(body)
            }

            delete("/{id}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }

        // ===== WISHLISTS =====
        route("/api/wishlists") {

            get("/{userId}") {
                call.respond(
                    listOf(
                        mapOf("id" to 1, "name" to "Подарки"),
                        mapOf("id" to 2, "name" to "Гаджеты")
                    )
                )
            }

            post {
                val body = call.receive<Map<String, String>>()
                call.respond(mapOf("id" to 100, "name" to body["name"]))
            }

            put("/{id}") {
                val body = call.receive<Map<String, String>>()
                call.respond(body)
            }

            delete("/{id}") {
                call.respond(HttpStatusCode.NoContent)
            }

            // ===== ITEMS =====
            get("/{id}/items/{itemId}") {
                call.respond(mapOf("id" to 1, "name" to "Item"))
            }

            post("/{id}/items") {
                val body = call.receive<Map<String, String>>()
                call.respond(mapOf("id" to 1, "name" to body["name"]))
            }

            put("/{id}/items/{itemId}") {
                val body = call.receive<Map<String, String>>()
                call.respond(body)
            }

            delete("/{id}/items/{itemId}") {
                call.respond(HttpStatusCode.NoContent)
            }

            get("/search") {
                val q = call.request.queryParameters["q"]
                call.respond(
                    listOf(
                        mapOf("id" to 1, "name" to "Found: $q")
                    )
                )
            }
        }

        // ===== UPLOAD =====
        post("/api/upload") {
            call.respond(mapOf("url" to "https://via.placeholder.com/150"))
        }
    }
}
