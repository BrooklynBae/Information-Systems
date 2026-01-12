import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.http.Method
import io.ktor.server.application.*
import java.io.ByteArrayInputStream
import java.util.UUID

class YandexStorageService {
    private val minioClient = MinioClient.builder()
        .endpoint(System.getenv("YC_STORAGE_ENDPOINT") ?: "https://storage.yandexcloud.net")
        .credentials(
            System.getenv("YC_STORAGE_ACCESS_KEY")!!,
            System.getenv("YC_STORAGE_SECRET_KEY")!!
        )
        .build()

    private val bucketName = System.getenv("YC_STORAGE_BUCKET") ?: "wishlist-images"

    suspend fun uploadImage(bytes: ByteArray, filename: String): String {
        val objectName = "images/${UUID.randomUUID()}/$filename"

        minioClient.putObject(
            PutObjectArgs.builder()
                .bucket(bucketName)
                .`object`(objectName)
                .stream(
                    ByteArrayInputStream(bytes),
                    bytes.size.toLong(),
                    -1
                )
                .contentType("image/jpeg")
                .build()
        )

        return "https://storage.yandexcloud.net/$bucketName/$objectName"
    }
}
