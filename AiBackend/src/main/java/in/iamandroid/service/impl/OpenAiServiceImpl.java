package in.iamandroid.service.impl;

import in.iamandroid.service.OpenAiService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OpenAiServiceImpl implements OpenAiService {

    @Value("classpath:/prompts/sentimental.st")
    private Resource sentimentPrompt;

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

    /**
     * Placeholder for the review-keyword helper. The "Customers say" feature
     * performs its own keyword extraction in ReviewInsightsService, so this
     * returns an empty list until that logic is wired in.
     */
    @Override
    public String[] tellReviewKeywords() {
        return new String[0];
    }

    @Override
    public String explain(String topic) {

        return chatClient
                .prompt()
                .system("""
                    You are a Java instructor.
                    Explain concepts clearly for developers.
                    """)
                .user("""
                    Explain the following topic:

                    {topic}

                    Include:
                    1. Definition
                    2. How it works
                    3. Practical example
                    4. Common mistakes
                    """)
                .call()
                .content();
    }
    @Override
    public String analyzeSentiment(String text) {

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(sentimentPrompt);

        String systemPrompt = systemPromptTemplate.render(
                Map.of("text", text)
        );
        System.out.println(systemPrompt);

        return chatClient
                .prompt()
                .system(systemPrompt)
                .user("Analyze the sentiment.")
                .call()
                .content();
    }
}
