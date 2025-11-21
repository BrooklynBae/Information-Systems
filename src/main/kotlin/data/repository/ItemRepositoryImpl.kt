package com.example.data.repository

import com.example.data.model.ItemModel
import com.example.data.model.tables.ItemTable
import com.example.domain.repository.ItemRepository
import com.example.plugins.DatabaseFactory.dbQuery
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class ItemRepositoryImpl: ItemRepository {

    override suspend fun addItem(item: ItemModel) {
        dbQuery {
            ItemTable.insert { table ->
                table[name] = item.name
                table[link] = item.link
                table[isDivisible] = item.isDivisible
                table[parentListId] = item.parentListId
            }
        }
    }

    override suspend fun getAllWishlistItems(parentListId: Int): List<ItemModel> {
        return dbQuery {
            ItemTable
                .select {
                    ItemTable.parentListId.eq(parentListId)
                }
                .mapNotNull { rowToItem(it) }
        }
    }

    override suspend fun updateItem(item: ItemModel, parentListId: Int) {
        dbQuery {
            ItemTable.update(
                where = {
                    ItemTable.parentListId.eq(parentListId) and ItemTable.id.eq(item.id)
                }
            ) { table ->
                table[name] = item.name
                table[link] = item.link
                table[isDivisible] = item.isDivisible
            }
        }
    }

    override suspend fun deleteItem(itemId: Int, parentListId: Int) {
        dbQuery {
            ItemTable.deleteWhere { ItemTable.id.eq(itemId) and ItemTable.parentListId.eq(parentListId) }
        }
    }

    private fun rowToItem(row: ResultRow?): ItemModel? {
        if (row == null) {
            return null
        }

        return ItemModel(
            id = row[ItemTable.id],
            name = row[ItemTable.name],
            link = row[ItemTable.link],
            isDivisible = row[ItemTable.isDivisible],
            parentListId = row[ItemTable.parentListId]
        )
    }
}