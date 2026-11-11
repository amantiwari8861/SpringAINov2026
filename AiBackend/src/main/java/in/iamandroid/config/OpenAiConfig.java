package in.iamandroid.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {

    @Bean
    public ChatClient openAiChatClient(ChatModel chatModel, ChatMemory chatMemory) {
        return ChatClient.builder(chatModel)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor()
                )
                .build();
    }


//    @Bean
//    public ChatClient openAiChatClient(@Qualifier("openAiChatModel")ChatModel chatModel) {
//        return ChatClient.builder(chatModel).defaultAdvisors(new SimpleLoggerAdvisor()).build();
//    }
//
//    @Bean
//    public ChatClient ollamaChatClient(@Qualifier("ollamaChatModel")ChatModel chatModel) {
//        return ChatClient.builder(chatModel).defaultAdvisors(new SimpleLoggerAdvisor()).build();
//    }
}
