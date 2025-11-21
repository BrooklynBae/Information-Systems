package com.example.domain.repository

import com.example.data.model.ItemModel

interface ItemRepository {

    suspend fun addItem(item: ItemModel)

    suspend fun getAllWishlistItems(parentListId: Int): List<ItemModel>

    suspend fun updateItem(item: ItemModel, parentListId: Int)

    suspend fun deleteItem(itemId: Int, parentListId: Int)
}