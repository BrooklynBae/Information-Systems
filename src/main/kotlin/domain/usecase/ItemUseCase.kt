package com.example.domain.usecase

import com.example.data.model.ItemModel
import com.example.domain.repository.ItemRepository

class ItemUseCase(
    private val itemRepository: ItemRepository
) {

    suspend fun addItem(item: ItemModel) {
        itemRepository.addItem(item = item)
    }

    suspend fun getAllWishlistItems(parentListId: Int): List<ItemModel> {
        return itemRepository.getAllWishlistItems(parentListId)
    }

    suspend fun updateList(item: ItemModel, parentListId: Int) {
        return itemRepository.updateItem(item = item, parentListId = parentListId)
    }

    suspend fun deleteItem(itemId: Int, parentListId: Int) {
        return itemRepository.deleteItem(itemId = itemId, parentListId = parentListId)
    }
}