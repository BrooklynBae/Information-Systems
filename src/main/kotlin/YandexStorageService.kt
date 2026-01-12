package com.example.storage

import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.GetPresignedObjectUrlArgs
import io.minio.http.Method
import java.io.ByteArrayInputStream
import java.util.UUID

class YandexStorageService {
    private val accessKey = System.getenv("YC_STORAGE_ACCESS_KEY")
        ?: error("YC_STORAGE_ACCESS_KEY not set")
    private val secretKey = System.getenv("YC_STORAGE_SECRET_KEY")
        ?: error("YC_STORAGE_SECRET_KEY not set")
    private val endpoint = System.getenv("YC_STORAGE_ENDPOINT") ?: "https://storage.yandexcloud.net"
    private val bucketName = System.getenv("YC_STORAGE_BUCKET") ?: "wishlist-images"

    private val minioClient = MinioClient.builder()
        .endpoint(endpoint)
        .credentials(accessKey, secretKey)
        .build()

    /**
     * Загружает изображение в Yandex Object Storage.
     * @param bytes Содержимое файла
     * @param filename Имя файла (например "photo.jpg")
     * @param generatePresignedUrl Если true, возвращает presigned URL для приватного доступа
     * @return URL изображения
     */
    suspend fun uploadImage(
        bytes: ByteArray,
        filename: String,
        generatePresignedUrl: Boolean = true
    ): String {

        // Генерация уникального имени объекта
        val objectName = "images/${UUID.randomUUID()}/$filename"

        // Определение content type
        val contentType = when {
            filename.endsWith(".png", ignoreCase = true) -> "image/png"
            filename.endsWith(".gif", ignoreCase = true) -> "image/gif"
            else -> "image/jpeg"
        }

        // Загрузка файла в bucket
        minioClient.putObject(
            PutObjectArgs.builder()
                .bucket(bucketName)
                .`object`(objectName)
                .stream(ByteArrayInputStream(bytes), bytes.size.toLong(), -1)
                .contentType(contentType)
                .build()
        )

        // Если приватный bucket — возвращаем presigned URL
        return if (generatePresignedUrl) {
            minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .`object`(objectName)
                    .expiry(24 * 60 * 60) // 1 день
                    .build()
            )
        } else {
            "$endpoint/$bucketName/$objectName"
        }
    }
}
