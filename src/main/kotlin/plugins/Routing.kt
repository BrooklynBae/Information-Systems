package com.example.plugins

import com.example.authentification.JwtService
import com.example.data.repository.*
import com.example.domain.usecase.ItemUseCase
import com.example.domain.usecase.ListUseCase
import com.example.domain.usecase.UserUseCase
import com.example.routes.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*


fun Application.configureRouting() {

    val jwtService = JwtService()
    val userRepo = UserRepositoryImpl()
    val userUseCase = UserUseCase(userRepo, jwtService)

    val listUseCase = ListUseCase(ListRepositoryImpl())
    val itemUseCase = ItemUseCase(ItemRepositoryImpl())

    val reservationRepo = ReservationRepository()
    val contributionRepo = ContributionRepository()

    routing {
        get("/") { call.respondText("Hello World!") }

        authRoutes(userUseCase)
        profileRoutes(userRepo)

        wishlistRoutes(
            userRepo = userRepo,
            listUseCase = listUseCase,
            itemUseCase = itemUseCase
        )

        itemRoutes(
            userRepo = userRepo,
            listUseCase = listUseCase,
            itemUseCase = itemUseCase
        )

        publicBrowseRoutes(
            userRepo = userRepo,
            listUseCase = listUseCase,
            itemUseCase = itemUseCase,
            reservationRepo = reservationRepo,
            contributionRepo = contributionRepo
        )

        contributionAndReserveRoutes(
            userRepo = userRepo,
            reservationRepo = reservationRepo,
            contributionRepo = contributionRepo
        )
    }
}
