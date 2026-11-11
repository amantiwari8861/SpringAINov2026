package in.iamandroid.service.impl;

import in.iamandroid.service.OpenAiService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

@Service
public class OpenAiServiceImpl implements OpenAiService {

    private final ChatClient chatClient;
    public OpenAiServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String chat(String convId, String prompt) {
        return chatClient
                .prompt(prompt)
                .advisors(advisor -> advisor
                        .param(
                                ChatMemory.CONVERSATION_ID,
                                convId
                        )
                )
                .call().content();
    }
}
