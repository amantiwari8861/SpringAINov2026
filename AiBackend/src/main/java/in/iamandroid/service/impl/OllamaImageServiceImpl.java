package in.iamandroid.service.impl;

import in.iamandroid.exception.ImageGenerationNotSupportedException;
import in.iamandroid.service.ImageGenerationService;
import org.springframework.ai.image.ImageResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("ollama")
public class OllamaImageServiceImpl implements ImageGenerationService {
    @Override
    public ImageResponse generateImage(String prompt) {
        throw new ImageGenerationNotSupportedException(
                "Image generation is not supported "
                        + "with the Ollama profile. "
                        + "Please activate the OpenAI profile."
        );    }

    @Override
    public String generateImageBase64(String message) {
        throw new ImageGenerationNotSupportedException(
                "Image generation is not supported "
                        + "with the Ollama profile. "
                        + "Please activate the OpenAI profile."
        );
    }
}
