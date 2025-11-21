package com.example.domain.repository

import com.example.data.model.ListModel

interface ListRepository {

    suspend fun addList(list: ListModel)

    suspend fun getAllOwnerslLists(ownerId: Int): List<ListModel>

    suspend fun updateList(list: ListModel, ownerId: Int)

    suspend fun deleteList(listId: Int, ownerId: Int)
}