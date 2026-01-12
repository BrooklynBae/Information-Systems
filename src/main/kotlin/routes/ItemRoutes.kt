package com.example.routes

import com.example.data.model.ItemModel
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.ItemUseCase
import com.example.domain.usecase.ListUseCase
import com.example.routes.dto.CreateItemRequest
import com.example.routes.dto.ItemResponse
import com.example.routes.dto.UpdateItemRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private suspend fun ApplicationCall.currentUserId(userRepo: UserRepositoryImpl): Int? {
    val principal = principal<JWTPrincipal>() ?: return null
    val email = principal.payload.getClaim("email").asString()
    val user = userRepo.getUserByEmail(email) ?: return null
    return user.id
}

fun Route.itemRoutes(
    userRepo: UserRepositoryImpl,
    listUseCase: ListUseCase,
    itemUseCase: ItemUseCase
) {
    authenticate("jwt") {

        // GET /api/wishlists/{listId}/items
        get("/api/wishlists/{listId}/items") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@get
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            if (listId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid listId"))
                return@get
            }

            // защита: этот список должен принадлежать текущему пользователю
            val list = listUseCase.getListById(listId, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@get
            }

            val items = itemUseCase.getAllWishlistItems(listId)
                .map { ItemResponse(it.id, it.name, it.link, it.isDivisible, it.priceCents, it.parentListId) } // ✅

            call.respond(items)
        }

        // POST /api/wishlists/{listId}/items
        post("/api/wishlists/{listId}/items") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@post
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            if (listId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid listId"))
                return@post
            }

            val list = listUseCase.getListById(listId, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@post
            }

            val req = call.receive<CreateItemRequest>()
            if (req.name.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Name is required"))
                return@post
            }

            val newId = itemUseCase.addItem(
                ItemModel(
                    id = 0,
                    name = req.name,
                    link = req.link,
                    isDivisible = req.isDivisible,
                    priceCents = req.priceCents,
                    parentListId = listId
                )
            )

            call.respond(
                HttpStatusCode.Created,
                ItemResponse(newId, req.name, req.link, req.isDivisible, req.priceCents, listId) // ✅
            )
        }

        // PUT /api/wishlists/{listId}/items/{itemId}
        put("/api/wishlists/{listId}/items/{itemId}") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@put
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (listId == null || itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid ids"))
                return@put
            }

            val list = listUseCase.getListById(listId, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@put
            }

            val req = call.receive<UpdateItemRequest>()
            if (req.name.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Name is required"))
                return@put
            }

            itemUseCase.updateItem(
                item = ItemModel(
                    id = itemId,
                    name = req.name,
                    link = req.link,
                    isDivisible = req.isDivisible,
                    priceCents = req.priceCents,
                    parentListId = listId
                ),
                parentListId = listId
            )

            call.respond(
                HttpStatusCode.OK,
                ItemResponse(itemId, req.name, req.link, req.isDivisible, req.priceCents, listId) // ✅
            )
        }

        // DELETE /api/wishlists/{listId}/items/{itemId}
        delete("/api/wishlists/{listId}/items/{itemId}") {
            val userId = call.currentUserId(userRepo)
            if (userId == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Unauthorized"))
                return@delete
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            val itemId = call.parameters["itemId"]?.toIntOrNull()
            if (listId == null || itemId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid ids"))
                return@delete
            }

            val list = listUseCase.getListById(listId, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@delete
            }

            itemUseCase.deleteItem(itemId = itemId, parentListId = listId)
            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }
    }
}
