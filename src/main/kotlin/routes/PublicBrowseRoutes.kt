package com.example.routes

import com.example.data.repository.ContributionRepository
import com.example.data.repository.ReservationRepository
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.ItemUseCase
import com.example.domain.usecase.ListUseCase
import com.example.routes.dto.ItemPublicResponse
import com.example.routes.dto.UserPublicDto
import com.example.routes.dto.WishlistPublicResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private suspend fun ApplicationCall.currentUserId(userRepo: UserRepositoryImpl): Int? {
    val principal = principal<JWTPrincipal>() ?: return null
    val email = principal.payload.getClaim("email").asString()
    val user = userRepo.getUserByEmail(email) ?: return null
    return user.id
}

fun Route.publicBrowseRoutes(
    userRepo: UserRepositoryImpl,
    listUseCase: ListUseCase,
    itemUseCase: ItemUseCase,
    reservationRepo: ReservationRepository,
    contributionRepo: ContributionRepository
) {

    get("/api/users/{login}") {
        val login = call.parameters["login"] ?: ""
        val user = userRepo.getUserByLogin(login)
        if (user == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("message" to "User not found"))
            return@get
        }
        call.respond(UserPublicDto(user.id, user.login))
    }

    get("/api/users/{login}/wishlists") {
        val login = call.parameters["login"] ?: ""
        val owner = userRepo.getUserByLogin(login)
        if (owner == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("message" to "User not found"))
            return@get
        }
        val lists = listUseCase.getAllOwnersLists(owner.id)
            .map { WishlistPublicResponse(it.id, it.name, it.description) }
        call.respond(lists)
    }

    authenticate("jwt") {

        // 3) Read-only: айтемы конкретного вишлиста пользователя + бронь/взносы
        get("/api/users/{login}/wishlists/{listId}/items") {
            val viewerId = call.currentUserId(userRepo)
            if (viewerId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@get
            }

            val login = call.parameters["login"] ?: ""
            val owner = userRepo.getUserByLogin(login)
            if (owner == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "User not found"))
                return@get
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            if (listId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid listId"))
                return@get
            }

            val list = listUseCase.getListById(listId, owner.id)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@get
            }

            val items = itemUseCase.getAllWishlistItems(listId)
            val itemIds = items.map { it.id }

            // неделимые: бронь
            val reservedByLogin = reservationRepo.reservedByLoginForItems(itemIds)
            val reservedByMe = reservationRepo.reservedItemIdsByUser(itemIds, viewerId)

            // делимые: взносы
            val sums = contributionRepo.sumByItems(itemIds)
            val counts = contributionRepo.countContributorsByItems(itemIds)
            val my = contributionRepo.myContributions(itemIds, viewerId)

            val response = items.map { it ->
                ItemPublicResponse(
                    id = it.id,
                    name = it.name,
                    link = it.link,
                    isDivisible = it.isDivisible,
                    priceCents = it.priceCents,
                    parentListId = it.parentListId,

                    // неделимый
                    reservedByLogin = if (!it.isDivisible) reservedByLogin[it.id] else null,
                    reservedByMe = if (!it.isDivisible) reservedByMe.contains(it.id) else false,

                    // делимый
                    contributedCents = if (it.isDivisible) (sums[it.id] ?: 0L) else 0L,
                    myContributionCents = if (it.isDivisible) (my[it.id] ?: 0L) else 0L,
                    contributorsCount = if (it.isDivisible) (counts[it.id] ?: 0) else 0
                )
            }

            call.respond(response)
        }
    }
}
