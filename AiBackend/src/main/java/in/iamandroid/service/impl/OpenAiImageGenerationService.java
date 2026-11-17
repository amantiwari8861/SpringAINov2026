package in.iamandroid.service.impl;

import in.iamandroid.service.ImageGenerationService;
import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@Profile("openai")
public class OpenAiImageGenerationService implements ImageGenerationService {

    private final ImageModel imageModel;
    public OpenAiImageGenerationService(ImageModel imageModel) {
        this.imageModel = imageModel;
    }

    @Override
    public ImageResponse generateImage(String prompt) {
        return null;
    }


    @Override
    public String generateImageBase64(String message) {

        System.out.println("OpenAiImageGenerationService.generateImageBase64");
        ImagePrompt imagePrompt = new ImagePrompt(message);
        System.out.println("OpenAiImageGenerationService.generateImageBase64 2");
        ImageResponse response = imageModel.call(imagePrompt);
        System.out.println(response.toString());
        String image = response
                .getResult()
                .getOutput()
                .getB64Json();
        byte[] imageBytes = Base64.getDecoder().decode(image);

        Path imageDirectory = Path.of("images");

        try {
            Files.createDirectories(imageDirectory);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String fileName = UUID.randomUUID()
                + "_"
                + LocalDateTime.now()
                .toString()
                .replace(":", "_")
                + ".png";

        Path path = imageDirectory.resolve(fileName);

        try (BufferedOutputStream bos = new BufferedOutputStream(
                Files.newOutputStream(path))) {

            bos.write(imageBytes);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return "data:image/png;base64," + image;
    }
}
