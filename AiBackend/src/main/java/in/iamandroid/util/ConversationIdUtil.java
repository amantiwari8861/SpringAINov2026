package in.iamandroid.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.UUID;

public class ConversationIdUtil {

    public static boolean isConvIdExistsInCookies(String conversationId){
        System.out.println("conversationId Found :"+conversationId);
        return conversationId != null && !conversationId.isBlank();
    }

    public static String generateConvId(String conversationId, HttpServletResponse response) {
        if (!isConvIdExistsInCookies(conversationId)) {

            conversationId = UUID.randomUUID().toString();

            ResponseCookie cookie = ResponseCookie
                    .from("conversationId", conversationId)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(30))
                    .build();

            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    cookie.toString()
            );
        }
        return conversationId;
    }
}
