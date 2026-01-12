package com.example.routes.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateWishlistRequest(val name: String, val description: String)

@Serializable
data class UpdateWishlistRequest(val id: Int, val name: String, val description: String)

@Serializable
data class WishlistResponse(val id: Int, val name: String, val description: String)