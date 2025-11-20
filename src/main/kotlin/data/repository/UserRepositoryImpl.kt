package com.example.data.repository

import com.example.data.model.UserModel
import com.example.data.model.tables.UserTable
import com.example.domain.repository.UserRepository
import com.example.plugins.DatabaseFactory.dbQuery
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select

class UserRepositoryImpl: UserRepository {

    override suspend fun getUserByEmail(email: String): UserModel? {
        return dbQuery {
            UserTable.select { UserTable.email.eq(email) }
                .map { rowToUser(row = it) }
                .singleOrNull()
        }
    }

    override suspend fun insertUser(userModel: UserModel) {
        println("inserting user..")
        return dbQuery {
            try {
                UserTable.insert { table ->
                    table[email] = userModel.email
                    table[password] = userModel.password
                    table[login] = userModel.login
                }
                println("user inserted")
            } catch (e: Exception) {
                println("user not inserted")
                throw e
            }
        }
    }

    private fun rowToUser(row: ResultRow?): UserModel? {
        if (row == null) {
            return null
        }

        return UserModel(
            id = row[UserTable.id],
            email = row[UserTable.email],
            password = row[UserTable.password],
            login = row[UserTable.login]
        )
    }

}