package com.example.data.model.tables

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

object ItemTable: Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val name: Column<String> = varchar("name", 100)
    val link: Column<String> = varchar("link", 33000)
    val isDivisible: Column<Boolean> = bool("is_divisible")
    val parentListId: Column<Int> = integer("parent_list_id").references(ListTable.id)

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}