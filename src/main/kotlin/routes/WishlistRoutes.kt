package com.example.routes

import com.example.data.model.ItemModel
import com.example.data.model.ListModel
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.ItemUseCase
import com.example.domain.usecase.ListUseCase
import com.example.routes.dto.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private suspend fun ApplicationCall.currentUserId(userRepo: UserRepositoryImpl): Int {
    val principal = principal<JWTPrincipal>() ?: throw IllegalStateException("No JWT principal")
    val email = principal.payload.getClaim("email").asString()
    val user = userRepo.getUserByEmail(email) ?: return -1
    return user.id
}

fun Route.wishlistRoutes(
    userRepo: UserRepositoryImpl,
    listUseCase: ListUseCase,
    itemUseCase: ItemUseCase
) {
    authenticate("jwt") {

        // ---- WISHLISTS ----

        get("/api/wishlists") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@get
            }

            val lists = listUseCase.getAllOwnersLists(userId)
                .map { WishlistResponse(it.id, it.name, it.description) }

            call.respond(lists)
        }

        get("/api/wishlists/{id}") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@get
            }

            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid id"))
                return@get
            }

            val list = listUseCase.getListById(id, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@get
            }

            call.respond(WishlistResponse(list.id, list.name, list.description))
        }

        post("/api/wishlists") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@post
            }

            val req = call.receive<CreateWishlistRequest>()
            if (req.name.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Name is required"))
                return@post
            }

            val newId = listUseCase.addList(
                ListModel(id = 0, name = req.name, description = req.description, owner = userId)
            )

            call.respond(HttpStatusCode.Created, WishlistResponse(newId, req.name, req.description))
        }

        put("/api/wishlists/{id}") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@put
            }

            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid id"))
                return@put
            }

            val existing = listUseCase.getListById(id, userId)
            if (existing == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@put
            }

            val req = call.receive<CreateWishlistRequest>() // name/description
            listUseCase.updateList(
                ListModel(id = id, name = req.name, description = req.description, owner = userId),
                ownerId = userId
            )

            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }

        delete("/api/wishlists/{id}") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@delete
            }

            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid id"))
                return@delete
            }

            val existing = listUseCase.getListById(id, userId)
            if (existing == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@delete
            }

            listUseCase.deleteList(id, userId)
            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }

        // ---- ITEMS ----

        get("/api/wishlists/{listId}/items") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
                return@get
            }

            val listId = call.parameters["listId"]?.toIntOrNull()
            if (listId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid listId"))
                return@get
            }

            // защита: список должен принадлежать пользователю
            val list = listUseCase.getListById(listId, userId)
            if (list == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "Wishlist not found"))
                return@get
            }

            val items = itemUseCase.getAllWishlistItems(listId)
                .map { ItemResponse(it.id, it.name, it.link, it.isDivisible, it.parentListId) }

            call.respond(items)
        }

        post("/api/wishlists/{listId}/items") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
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
            itemUseCase.addItem(
                ItemModel(
                    id = 0,
                    name = req.name,
                    link = req.link,
                    isDivisible = req.isDivisible,
                    parentListId = listId
                )
            )

            call.respond(HttpStatusCode.Created, mapOf("ok" to true))
        }

        put("/api/wishlists/{listId}/items/{itemId}") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
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
            itemUseCase.updateItem(
                ItemModel(
                    id = itemId,
                    name = req.name,
                    link = req.link,
                    isDivisible = req.isDivisible,
                    parentListId = listId
                ),
                parentListId = listId
            )

            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }

        delete("/api/wishlists/{listId}/items/{itemId}") {
            val userId = call.currentUserId(userRepo)
            if (userId == -1) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "User not found"))
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

            itemUseCase.deleteItem(itemId, parentListId = listId)
            call.respond(HttpStatusCode.OK, mapOf("ok" to true))
        }
    }
}
