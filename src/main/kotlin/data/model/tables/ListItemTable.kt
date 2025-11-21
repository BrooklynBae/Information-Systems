package com.example.data.model.tables

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

object ListItemTable: Table() {
    private val listId: Column<Int> = integer("list_id").references(ListTable.id)
    private val itemId: Column<Int> = integer("item_id").references(ItemTable.id)

    override val primaryKey = PrimaryKey(listId, itemId, name = "pk_list_item_id")
}