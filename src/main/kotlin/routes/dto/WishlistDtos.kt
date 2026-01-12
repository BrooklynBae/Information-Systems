package com.example.routes.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateWishlistRequest(val name: String, val description: String)

@Serializable
data class UpdateWishlistRequest(val id: Int, val name: String, val description: String)

@Serializable
data class WishlistResponse(val id: Int, val name: String, val description: String)

@Serializable
data class CreateItemRequest(val name: String, val link: String, val isDivisible: Boolean)

@Serializable
data class UpdateItemRequest(val id: Int, val name: String, val link: String, val isDivisible: Boolean)

@Serializable
data class ItemResponse(
    val id: Int,
    val name: String,
    val link: String,
    val isDivisible: Boolean,
    val parentListId: Int
)
