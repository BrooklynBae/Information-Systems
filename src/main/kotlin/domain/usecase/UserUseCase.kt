package com.example.domain.usecase

import com.example.authentification.JwtService
import com.example.data.model.UserModel
import com.example.domain.repository.UserRepository

class UserUseCase(
    private val repositoryImpl: UserRepository,
    private val jwtService: JwtService
) {
    suspend fun createUser(userModel: UserModel) = repositoryImpl.insertUser(userModel = userModel)

    suspend fun findUserByEmail(email: String) = repositoryImpl.getUserByEmail(email = email)

    suspend fun findUserByLogin(login: String) = repositoryImpl.getUserByLogin(login)

    fun generateToken(userModel: UserModel): String = jwtService.generateToken(user = userModel)
}