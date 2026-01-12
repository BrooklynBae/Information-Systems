package com.example.data.repository

import com.example.data.model.ListModel
import com.example.data.model.tables.ListTable
import com.example.domain.repository.ListRepository
import com.example.plugins.DatabaseFactory.dbQuery
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class ListRepositoryImpl: ListRepository {
    override suspend fun addList(list: ListModel): Int {
        return dbQuery {
            val stmt = ListTable.insert { table ->
                table[name] = list.name
                table[description] = list.description
                table[owner] = list.owner
            }
            stmt[ListTable.id]
        }
    }
    override suspend fun getListById(listId: Int, ownerId: Int): ListModel? {
        return dbQuery {
            ListTable
                .select { ListTable.id.eq(listId) and ListTable.owner.eq(ownerId) }
                .mapNotNull { rowToList(it) }
                .singleOrNull()
        }
    }

    override suspend fun getAllOwnerslLists(ownerId: Int): List<ListModel> {
        return dbQuery {
            ListTable
                .select {
                    ListTable.owner.eq(ownerId)
                }
                .mapNotNull { rowToList(it) }
        }
    }

    override suspend fun updateList(list: ListModel, ownerId: Int) {
        dbQuery {
            ListTable.update(
                where = {
                    ListTable.owner.eq(ownerId) and ListTable.id.eq(list.id)
                }
            ) {table ->
                table[name] = list.name
                table[description] = list.description
            }
        }
    }

    override suspend fun deleteList(listId: Int, ownerId: Int) {
        dbQuery {
            ListTable.deleteWhere { ListTable.id.eq(listId) and ListTable.owner.eq(ownerId) }
        }
    }

    private fun rowToList(row: ResultRow?): ListModel? {
        if (row == null) {
            return null
        }

        return ListModel(
            id = row[ListTable.id],
            name = row[ListTable. name],
            description = row[ListTable.description],
            owner = row[ListTable.owner]
        )
    }
}