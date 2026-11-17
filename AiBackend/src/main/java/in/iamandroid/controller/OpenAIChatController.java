package in.iamandroid.controller;

import in.iamandroid.service.ImageGenerationService;
import in.iamandroid.service.OpenAiService;
import in.iamandroid.util.ConversationIdUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/openai")
@CrossOrigin(
        origins = {"http://localhost:3000","http://localhost:5173","http://iamandroid.in:5173","https://iamandroid.in",},
        allowCredentials = "true"
)
public class OpenAIChatController {

    private final OpenAiService openAiService;
    private final ImageGenerationService imageGenerationService;
    public OpenAIChatController(OpenAiService openAiService, ImageGenerationService imageGenerationService) {
        this.openAiService = openAiService;
        this.imageGenerationService = imageGenerationService;
    }

    @GetMapping("/chat") // GET http://localhost:8080/api/v1/openai/chat
    public String chat(@RequestParam("prompt") String message, @CookieValue(value = "conversationId", required = false)
    String conversationId, HttpServletResponse response) {
        final String convId=ConversationIdUtil.generateConvId(conversationId, response);
        return openAiService.chat(convId, message);
    }
    @PostMapping("/chat") // GET http://localhost:8080/api/v1/openai/chat
    public ChatResponse chat(@CookieValue(value = "conversationId", required = false)String conversationId,@RequestBody ChatRequest request, HttpServletResponse response) {
        final String convId=ConversationIdUtil.generateConvId(conversationId, response);
        final String reply=openAiService.chat(convId, request.message());
        return new ChatResponse(reply);
    }
    @PostMapping("/generate-image")
    public ResponseEntity<String> generateImage(@RequestBody @Valid ChatRequest request) {
        System.out.println("OpenAIChatController.generateImage");
        return ResponseEntity.status(201).body(imageGenerationService.generateImageBase64(request.message()));
    }


    // inmemory for chatMemory
//    SSE -> Server Sent Event
}
record ChatRequest(String message){}
record ChatResponse(String message){}