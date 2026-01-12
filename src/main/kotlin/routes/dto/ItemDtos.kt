package com.example.routes.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateItemRequest(
    val name: String,
    val link: String = "",
    val isDivisible: Boolean = false,
    val priceCents: Long = 0
)

@Serializable
data class UpdateItemRequest(
    val name: String,
    val link: String = "",
    val isDivisible: Boolean = false,
    val priceCents: Long = 0
)

@Serializable
data class ItemResponse(
    val id: Int,
    val name: String,
    val link: String,
    val isDivisible: Boolean,
    val priceCents: Long,
    val parentListId: Int
)
