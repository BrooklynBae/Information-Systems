package com.example.data.repository

import com.example.data.model.tables.ItemContributions
import com.example.plugins.DatabaseFactory.dbQuery
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class ContributionRepository {

    // upsert: если взнос был — обновляем, если не было — вставляем
    suspend fun upsertContribution(itemId: Int, userId: Int, amountCents: Long) {
        dbQuery {
            val updated = ItemContributions.update(
                where = { (ItemContributions.itemId eq itemId) and (ItemContributions.userId eq userId) }
            ) {
                it[ItemContributions.amountCents] = amountCents
            }

            if (updated == 0) {
                ItemContributions.insert {
                    it[ItemContributions.itemId] = itemId
                    it[ItemContributions.userId] = userId
                    it[ItemContributions.amountCents] = amountCents
                }
            }
        }
    }

    suspend fun deleteContribution(itemId: Int, userId: Int): Int {
        return dbQuery {
            ItemContributions.deleteWhere {
                (ItemContributions.itemId eq itemId) and (ItemContributions.userId eq userId)
            }
        }
    }

    // Суммы всех взносов по списку itemId
    suspend fun sumByItems(itemIds: List<Int>): Map<Int, Long> {
        if (itemIds.isEmpty()) return emptyMap()

        return dbQuery {
            val sumExpr = ItemContributions.amountCents.sum()
            ItemContributions
                .slice(ItemContributions.itemId, sumExpr)
                .select { ItemContributions.itemId inList itemIds }
                .groupBy(ItemContributions.itemId)
                .associate { row ->
                    val id = row[ItemContributions.itemId]
                    val sum = row[sumExpr] ?: 0L
                    id to sum
                }
        }
    }

    // Количество участников (взносов) по itemId
    suspend fun countContributorsByItems(itemIds: List<Int>): Map<Int, Int> {
        if (itemIds.isEmpty()) return emptyMap()

        return dbQuery {
            val cntExpr = ItemContributions.userId.count()
            ItemContributions
                .slice(ItemContributions.itemId, cntExpr)
                .select { ItemContributions.itemId inList itemIds }
                .groupBy(ItemContributions.itemId)
                .associate { row ->
                    val id = row[ItemContributions.itemId]
                    val cnt = row[cntExpr].toInt()
                    id to cnt
                }
        }
    }

    // Взнос текущего пользователя по itemId
    suspend fun myContributions(itemIds: List<Int>, userId: Int): Map<Int, Long> {
        if (itemIds.isEmpty()) return emptyMap()

        return dbQuery {
            ItemContributions
                .select { (ItemContributions.itemId inList itemIds) and (ItemContributions.userId eq userId) }
                .associate { row ->
                    row[ItemContributions.itemId] to row[ItemContributions.amountCents]
                }
        }
    }
}
