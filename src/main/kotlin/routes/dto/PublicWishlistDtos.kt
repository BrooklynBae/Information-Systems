package com.example.routes.dto

import kotlinx.serialization.Serializable

@Serializable
data class WishlistPublicResponse(
    val id: Int,
    val name: String,
    val description: String
)
