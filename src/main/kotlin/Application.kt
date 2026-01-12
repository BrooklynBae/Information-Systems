package com.example

import com.example.plugins.*
import com.example.plugins.DatabaseFactory.initializateDatabase
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    initializateDatabase()
    configureSerialization()
    configureHttp()
    configureSecurity()
    configureMonitoring()
    configureRouting()
}
