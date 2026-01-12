package com.example.data.model.tables

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

// Взнос на делимый item: у каждого пользователя максимум один активный взнос на item
object ItemContributions : Table() {
    val itemId: Column<Int> = integer("item_id").references(ItemTable.id)
    val userId: Column<Int> = integer("user_id").references(UserTable.id)
    val amountCents: Column<Long> = long("amount_cents")

    override val primaryKey = PrimaryKey(itemId, userId, name = "pk_item_contributions")
}
