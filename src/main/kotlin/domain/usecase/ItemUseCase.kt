package com.example.domain.usecase

import com.example.data.model.ItemModel
import com.example.domain.repository.ItemRepository

class ItemUseCase(
    private val itemRepository: ItemRepository
) {

    suspend fun addItem(item: ItemModel): Int {
        return itemRepository.addItem(item = item)
    }

    suspend fun getAllWishlistItems(parentListId: Int): List<ItemModel> {
        return itemRepository.getAllWishlistItems(parentListId)
    }

    suspend fun updateItem(item: ItemModel, parentListId: Int) {
        itemRepository.updateItem(item = item, parentListId = parentListId)
    }

    suspend fun deleteItem(itemId: Int, parentListId: Int) {
        itemRepository.deleteItem(itemId = itemId, parentListId = parentListId)
    }
}
