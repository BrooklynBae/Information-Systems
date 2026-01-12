package com.example

import com.example.plugins.DatabaseFactory.initializateDatabase
import com.example.plugins.configureHttp
import com.example.plugins.configureRouting
import com.example.plugins.configureSecurity
import com.example.plugins.configureSerialization
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    initializateDatabase()
    configureSerialization()
    configureHttp()
    configureSecurity()
    configureRouting()
}
