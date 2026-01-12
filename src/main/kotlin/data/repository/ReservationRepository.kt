package com.example.data.repository

import com.example.data.model.tables.ItemSelections
import com.example.data.model.tables.UserTable
import com.example.plugins.DatabaseFactory.dbQuery
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select

class ReservationRepository {

    suspend fun reserveNonDivisible(itemId: Int, userId: Int): ReserveResult {
        return dbQuery {
            // уже мной?
            val alreadyByMe = ItemSelections
                .select { (ItemSelections.itemId eq itemId) and (ItemSelections.userId eq userId) }
                .any()
            if (alreadyByMe) return@dbQuery ReserveResult.AlreadyReservedByMe

            // уже кем-то?
            val alreadyByOther = ItemSelections
                .select { ItemSelections.itemId eq itemId }
                .any()
            if (alreadyByOther) return@dbQuery ReserveResult.AlreadyReservedByOther

            ItemSelections.insert {
                it[ItemSelections.itemId] = itemId
                it[ItemSelections.userId] = userId
            }
            ReserveResult.Ok
        }
    }

    suspend fun unreserve(itemId: Int, userId: Int): Int {
        return dbQuery {
            ItemSelections.deleteWhere { (ItemSelections.itemId eq itemId) and (ItemSelections.userId eq userId) }
        }
    }

    suspend fun reservedByLoginForItems(itemIds: List<Int>): Map<Int, String> {
        if (itemIds.isEmpty()) return emptyMap()

        return dbQuery {
            (ItemSelections innerJoin UserTable)
                .slice(ItemSelections.itemId, UserTable.login)
                .select { ItemSelections.itemId inList itemIds }
                .associate { row ->
                    row[ItemSelections.itemId] to row[UserTable.login]
                }
        }
    }

    suspend fun reservedItemIdsByUser(itemIds: List<Int>, userId: Int): Set<Int> {
        if (itemIds.isEmpty()) return emptySet()

        return dbQuery {
            ItemSelections
                .slice(ItemSelections.itemId)
                .select { (ItemSelections.itemId inList itemIds) and (ItemSelections.userId eq userId) }
                .map { it[ItemSelections.itemId] }
                .toSet()
        }
    }

    sealed class ReserveResult {
        data object Ok : ReserveResult()
        data object AlreadyReservedByMe : ReserveResult()
        data object AlreadyReservedByOther : ReserveResult()
    }
}
