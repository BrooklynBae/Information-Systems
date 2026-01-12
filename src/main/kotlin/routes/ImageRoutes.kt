package com.example.routes

import com.example.data.repository.UserRepositoryImpl
import com.example.storage.YandexStorageService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.content.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


private suspend fun ApplicationCall.currentUserId(userRepo: UserRepositoryImpl): Int {
    val principal = principal<JWTPrincipal>() ?: throw IllegalStateException("No JWT principal")
    val email = principal.payload.getClaim("email").asString()
    val user = userRepo.getUserByEmail(email) ?: return -1
    return user.id
}

fun Route.imageRoutes(
    userRepo: UserRepositoryImpl,
    yandexStorage: YandexStorageService
) {
    authenticate("jwt") {
        post("/api/upload/image") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@post
            }

            val multipart = call.receiveMultipart()
            var fileBytes: ByteArray? = null
            var fileName: String? = null

            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        fileName = part.originalFileName ?: "image.jpg"
                        fileBytes = withContext(Dispatchers.IO) {
                            part.streamProvider().readBytes()
                        }
                    }
                    else -> {}
                }
                part.dispose()
            }


            if (fileBytes == null || fileName == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "No file provided"))
                return@post
            }

            val url = yandexStorage.uploadImage(fileBytes!!, fileName!!)
            call.respond(HttpStatusCode.Created, mapOf("url" to url))
        }
    }
}
