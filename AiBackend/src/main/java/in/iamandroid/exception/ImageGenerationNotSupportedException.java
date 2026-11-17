package in.iamandroid.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
public class ImageGenerationNotSupportedException extends RuntimeException {

    public ImageGenerationNotSupportedException(String message) {
        super(message);
    }
}