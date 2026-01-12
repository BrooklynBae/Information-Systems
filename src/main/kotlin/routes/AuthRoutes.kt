package com.example.routes

import com.example.authentification.*
import com.example.data.model.UserModel
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.UserUseCase
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.mindrot.jbcrypt.BCrypt

fun Route.authRoutes(userUseCase: UserUseCase) {

    route("/api/auth") {

        post("/register") {
            val req = call.receive<RegisterRequest>()

            if (req.login.isBlank() || req.email.isBlank() || req.password.length < 6) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid data"))
                return@post
            }

            if (userUseCase.findUserByEmail(req.email) != null) {
                call.respond(HttpStatusCode.Conflict, mapOf("message" to "Email already exists"))
                return@post
            }

            // если добавишь findUserByLogin - проверь и его
            val hashed = BCrypt.hashpw(req.password, BCrypt.gensalt())

            userUseCase.createUser(
                UserModel(id = 0, email = req.email, login = req.login, password = hashed)
            )

            val created = userUseCase.findUserByEmail(req.email)!!

            val token = userUseCase.generateToken(created)

            call.respond(
                AuthResponse(
                    token = token,
                    user = UserPublic(created.id, created.login, created.email)
                )
            )
        }

        post("/login") {
            val req = call.receive<Map<String, String>>() // чтобы не переделывать форму сразу
            val login = req["login"] ?: ""
            val password = req["password"] ?: ""

            if (login.isBlank() || password.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid data"))
                return@post
            }

            val user = userUseCase.findUserByLogin(login)  // добавь в usecase
            if (user == null || !BCrypt.checkpw(password, user.password)) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Invalid credentials"))
                return@post
            }

            val token = userUseCase.generateToken(user)

            call.respond(
                AuthResponse(
                    token = token,
                    user = UserPublic(user.id, user.login, user.email)
                )
            )
        }
    }
}
