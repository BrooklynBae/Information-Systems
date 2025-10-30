package com.example

import com.example.DatabaseFactory.initializateDatabase
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    initializateDatabase()
    configureRouting()
}
