package com.example.data.model

data class ItemModel(
    val id: Int,
    val name: String,
    val link: String,
    val isDivisible: Boolean,
    val parentListId: Int
)
