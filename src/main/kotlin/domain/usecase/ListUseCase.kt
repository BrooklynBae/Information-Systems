package com.example.domain.usecase

import com.example.data.model.ListModel
import com.example.domain.repository.ListRepository

class ListUseCase(
    private val listRepository: ListRepository
) {
    suspend fun addList(list: ListModel) {
        listRepository.addList(list = list)
    }

    suspend fun getAllOwnersLists(ownerId: Int): List<ListModel> {
        return listRepository.getAllOwnerslLists(ownerId)
    }

    suspend fun updateList(list: ListModel, ownerId: Int) {
        return listRepository.updateList(list = list, ownerId = ownerId)
    }

    suspend fun deleteList(listId: Int, ownerId: Int) {
        return listRepository.deleteList(listId = listId, ownerId = ownerId)
    }
}