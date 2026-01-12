package com.example.domain.usecase

import com.example.data.model.ListModel
import com.example.domain.repository.ListRepository

class ListUseCase(private val listRepository: ListRepository) {

    suspend fun addList(list: ListModel): Int =
        listRepository.addList(list)

    suspend fun getAllOwnersLists(ownerId: Int) =
        listRepository.getAllOwnerslLists(ownerId)

    suspend fun getListById(listId: Int, ownerId: Int) =
        listRepository.getListById(listId, ownerId)

    suspend fun updateList(list: ListModel, ownerId: Int) =
        listRepository.updateList(list, ownerId)

    suspend fun deleteList(listId: Int, ownerId: Int) =
        listRepository.deleteList(listId, ownerId)
}
