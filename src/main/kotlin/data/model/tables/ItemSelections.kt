package com.example.data.model.tables

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

object ItemSelections : Table() {
    val userId: Column<Int> = integer("user_id").references(UserTable.id)
    val itemId: Column<Int> = integer("item_id").references(ItemTable.id)

    override val primaryKey = PrimaryKey(userId, itemId, name = "pk_item_selections")
}
