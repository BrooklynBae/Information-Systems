package com.example.routes

import com.example.data.model.tables.ItemTable
import com.example.data.repository.ContributionRepository
import com.example.data.repository.ReservationRepository
import com.example.data.repository.UserRepositoryImpl
import com.example.plugins.DatabaseFactory.dbQuery
import com.example.routes.dto.ContributionRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.select

private suspend fun ApplicationCall.currentUserId(userRepo: UserRepositoryImpl): Int? {
    val principal = principal<JWTPrincipal>() ?: return null
    val email = principal.payload.getClaim("email").asString()
    val user = userRepo.getUserByEmail(email) ?: return null
    return user.id
}

private suspend fun isDivisibleItem(itemId: Int): Boolean? {
    return dbQuery {
        ItemTable
            .slice(ItemTable.isDivisible)
            .select { ItemTable.id eq itemId }
            .singleOrNull()
            ?.get(ItemTable.isDivisible)
    }
}

fun Route.contributionAndReserveRoutes(
    userRepo: UserRepositoryImpl,
    reservationRepo: ReservationRepository,
    contributionRepo: ContributionRepository
) {
    authenticate("jwt") {

        // Бронь — ТОЛЬКО для неделимых items
        post("/api/items/{itemId}/reserve") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@post
            }

            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid itemId"))
                return@post
            }

            val divisible = isDivisibleItem(itemId)
            if (divisible == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Item not found"))
                return@post
            }
            if (divisible) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Divisible item: use contribution instead"))
                return@post
            }

            when (reservationRepo.reserveNonDivisible(itemId, userId)) {
                is ReservationRepository.ReserveResult.Ok ->
                    call.respond(HttpStatusCode.OK, mapOf("ok" to true))

                is ReservationRepository.ReserveResult.AlreadyReservedByMe ->
                    call.respond(HttpStatusCode.OK, mapOf("ok" to true)) // идемпотентно

                is ReservationRepository.ReserveResult.AlreadyReservedByOther ->
                    call.respond(HttpStatusCode.Conflict, mapOf("message" to "Item already reserved"))
            }
        }

        delete("/api/items/{itemId}/reserve") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@delete
            }

            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid itemId"))
                return@delete
            }

            val deleted = reservationRepo.unreserve(itemId, userId)
            if (deleted == 0) call.respond(HttpStatusCode.NotFound, mapOf("message" to "Reservation not found"))
            else call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }

        // ВЗНОС — ТОЛЬКО для делимых items
        put("/api/items/{itemId}/contribution") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@put
            }

            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid itemId"))
                return@put
            }

            val divisible = isDivisibleItem(itemId)
            if (divisible == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Item not found"))
                return@put
            }
            if (!divisible) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Non-divisible item: use reserve instead"))
                return@put
            }

            val req = call.receive<ContributionRequest>()
            if (req.amountCents <= 0) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "amountCents must be > 0"))
                return@put
            }

            contributionRepo.upsertContribution(itemId, userId, req.amountCents)
            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }

        delete("/api/items/{itemId}/contribution") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@delete
            }

            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid itemId"))
                return@delete
            }

            val divisible = isDivisibleItem(itemId)
            if (divisible == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Item not found"))
                return@delete
            }
            if (!divisible) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Non-divisible item: no contributions"))
                return@delete
            }

            val deleted = contributionRepo.deleteContribution(itemId, userId)
            if (deleted == 0) call.respond(HttpStatusCode.NotFound, mapOf("message" to "Contribution not found"))
            else call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }
    }
}
