package com.example.authentification

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.example.data.model.UserModel
import java.time.LocalDateTime
import java.time.ZoneOffset

class JwtService {

    private val issuer = "wishlist-server"
    private val jwtSecret = System.getenv("JWT_SECRET")
    private val algoritm = Algorithm.HMAC512(jwtSecret)

    private val verifier: JWTVerifier = JWT
        .require(algoritm)
        .withIssuer(issuer)
        .build()

    fun generateToken(user: UserModel): String {
        return JWT.create()
            .withSubject("WIshlistAuth")
            .withIssuer(issuer)
            .withClaim("email", user.email)
            .withExpiresAt(LocalDateTime.now().plusDays(1).toInstant(ZoneOffset.UTC))
            .sign(algoritm)
    }

    fun getVerifier(): JWTVerifier = verifier
}