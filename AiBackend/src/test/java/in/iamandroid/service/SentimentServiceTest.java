package in.iamandroid.service;

import in.iamandroid.entity.Sentiment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the sentiment classifier. The chat model is mocked, so these
 * tests never call OpenAI or Ollama and cost nothing to run.
 */
@ExtendWith(MockitoExtension.class)
class SentimentServiceTest {

    @Mock
    private ChatModel chatModel;

    private SentimentService sentimentService;

    @BeforeEach
    void setUp() {
        // ChatClient may read the model's default options while building a request.
        lenient().when(chatModel.getDefaultOptions()).thenReturn(ChatOptions.builder().build());
        lenient().when(chatModel.getOptions()).thenReturn(ChatOptions.builder().build());
        sentimentService = new SentimentService(chatModel);
    }

    private static ChatResponse reply(String json) {
        return new ChatResponse(List.of(new Generation(new AssistantMessage(json))));
    }

    /* ------------------------------------------------------------------ */
    /* Happy path                                                          */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("returns the AI label with its confidence")
    void classify_returnsAiVerdict() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"POSITIVE\",\"confidence\":0.82}"));

        SentimentService.Classified result =
                sentimentService.classify("Excellent product, very happy with it", 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.POSITIVE);
        assertThat(result.confidence()).isEqualTo(0.82);
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_AI);
    }

    @Test
    @DisplayName("accepts lower-case labels from smaller models")
    void classify_acceptsLowerCaseEnum() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"negative\",\"confidence\":0.5}"));

        SentimentService.Classified result =
                sentimentService.classify("This broke after one week of use", 2);

        assertThat(result.sentiment()).isEqualTo(Sentiment.NEGATIVE);
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_AI);
    }

    @Test
    @DisplayName("clamps confidence into the 0..1 range")
    void classify_clampsConfidence() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"NEUTRAL\",\"confidence\":1.7}"));

        assertThat(sentimentService.classify("It is fine, nothing special", 3).confidence())
                .isEqualTo(1.0);
    }

    @Test
    @DisplayName("keeps confidence null when the model omits it")
    void classify_allowsMissingConfidence() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"NEUTRAL\"}"));

        SentimentService.Classified result =
                sentimentService.classify("It is fine, nothing special", 3);

        assertThat(result.sentiment()).isEqualTo(Sentiment.NEUTRAL);
        assertThat(result.confidence()).isNull();
    }

    /* ------------------------------------------------------------------ */
    /* Degraded paths                                                      */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("text that is too short is not sent to the model")
    void classify_shortText_skipsModel() {
        SentimentService.Classified result = sentimentService.classify("ok", 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(result.confidence()).isNull();
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_INVALID_TEXT);
        verifyNoInteractions(chatModel);
    }

    @Test
    @DisplayName("null text is handled without touching the model")
    void classify_nullText_skipsModel() {
        SentimentService.Classified result = sentimentService.classify(null, 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_INVALID_TEXT);
        verifyNoInteractions(chatModel);
    }

    @Test
    @DisplayName("a model failure yields PENDING instead of an exception")
    void classify_modelFailure_returnsPending() {
        when(chatModel.call(any(Prompt.class)))
                .thenThrow(new IllegalStateException("connection refused"));

        SentimentService.Classified result =
                sentimentService.classify("Great product, works as described", 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(result.confidence()).isNull();
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_AI_UNAVAILABLE);
    }

    @Test
    @DisplayName("unparseable model output yields PENDING")
    void classify_unparseableOutput_returnsPending() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("I think this one is good."));

        SentimentService.Classified result =
                sentimentService.classify("Great product, works as described", 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_AI_UNAVAILABLE);
    }

    @Test
    @DisplayName("a PENDING label from the model is treated as a failure")
    void classify_modelReturnsPending_isTreatedAsFailure() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"PENDING\",\"confidence\":0.4}"));

        SentimentService.Classified result =
                sentimentService.classify("Great product, works as described", 5);

        assertThat(result.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(result.confidence()).isNull();
        assertThat(result.source()).isEqualTo(SentimentService.SOURCE_AI_UNAVAILABLE);
    }

    /* ------------------------------------------------------------------ */
    /* Cache                                                               */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("an identical review is classified only once")
    void classify_cachesSuccessfulResults() {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("{\"sentiment\":\"POSITIVE\",\"confidence\":0.9}"));

        String text = "Excellent product, very happy with it";
        sentimentService.classify(text, 5);
        sentimentService.classify(text, 5);

        verify(chatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    @DisplayName("a failed classification is not cached, so the next attempt retries")
    void classify_doesNotCacheFailures() {
        when(chatModel.call(any(Prompt.class)))
                .thenThrow(new IllegalStateException("temporarily down"))
                .thenReturn(reply("{\"sentiment\":\"POSITIVE\",\"confidence\":0.9}"));

        String text = "Excellent product, very happy with it";
        SentimentService.Classified first = sentimentService.classify(text, 5);
        SentimentService.Classified second = sentimentService.classify(text, 5);

        assertThat(first.sentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(second.sentiment()).isEqualTo(Sentiment.POSITIVE);
        verify(chatModel, times(2)).call(any(Prompt.class));
    }
}
