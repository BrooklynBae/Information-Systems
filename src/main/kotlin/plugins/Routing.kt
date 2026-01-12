package com.example.plugins

import com.example.authentification.JwtService
import com.example.data.repository.ItemRepositoryImpl
import com.example.data.repository.ListRepositoryImpl
import com.example.data.repository.UserRepositoryImpl
import com.example.domain.usecase.ItemUseCase
import com.example.domain.usecase.ListUseCase
import com.example.domain.usecase.UserUseCase
import com.example.routes.authRoutes
import com.example.routes.profileRoutes
import com.example.routes.wishlistRoutes
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {

    val jwtService = JwtService()
    val userRepo = UserRepositoryImpl()
    val userUseCase = UserUseCase(userRepo, jwtService)

    val listUseCase = ListUseCase(ListRepositoryImpl())
    val itemUseCase = ItemUseCase(ItemRepositoryImpl())

    routing {
        get("/") { call.respondText("Hello World!") }

        authRoutes(userUseCase)
        profileRoutes(userRepo)

        wishlistRoutes(
            userRepo = userRepo,
            listUseCase = listUseCase,
            itemUseCase = itemUseCase
        )
    }
}
