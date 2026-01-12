package com.example.routes.dto

import kotlinx.serialization.Serializable

@Serializable
data class UserPublicDto(val id: Int, val login: String)

@Serializable
data class ItemPublicResponse(
    val id: Int,
    val name: String,
    val link: String,
    val isDivisible: Boolean,
    val priceCents: Long,
    val parentListId: Int,

    // Неделимые: кто забронировал
    val reservedByLogin: String? = null,
    val reservedByMe: Boolean = false,

    // Делимые: прогресс взносов
    val contributedCents: Long = 0,
    val myContributionCents: Long = 0,
    val contributorsCount: Int = 0
)

@Serializable
data class ContributionRequest(val amountCents: Long)
