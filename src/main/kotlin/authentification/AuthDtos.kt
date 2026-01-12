package com.example.authentification

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(val login: String, val email: String, val password: String)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class UserPublic(val id: Int, val login: String, val email: String)

@Serializable
data class AuthResponse(val token: String, val user: UserPublic)
