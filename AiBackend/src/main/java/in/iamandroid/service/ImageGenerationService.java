package in.iamandroid.service;

import org.springframework.ai.image.ImageResponse;

public interface ImageGenerationService {
    ImageResponse generateImage(String prompt);
    String generateImageBase64(String message);
}
