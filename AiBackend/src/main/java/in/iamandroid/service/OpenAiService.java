package in.iamandroid.service;

public interface OpenAiService {
    String chat(String convId,String prompt);
    String[] tellReviewKeywords();
    String explain(String topic);
    String analyzeSentiment(String text);
}
