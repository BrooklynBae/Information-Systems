package com.example.data.model.tables

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

object ListTable: Table() {
    val id: Column<Int> = integer("list_id").autoIncrement()
    val name: Column<String> = varchar("list_name", 50)
    val description: Column<String> = varchar("list_description", 1000)
    val owner: Column<Int> = integer("list_owner").references(UserTable.id)

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}