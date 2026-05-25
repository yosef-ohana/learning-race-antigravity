package com.innovativelearning.services;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
public class QuestionGeneratorService {

    private final Random random = new Random();

    public RaceQuestionEntity generateQuestion(Long raceId, Long participantId, QuestionTemplateEntity template, List<RaceQuestionEntity> existingQuestions) {
        if (existingQuestions != null) {
            for (RaceQuestionEntity q : existingQuestions) {
                if ("OPEN".equals(q.getStatus()) && q.getRaceId().equals(raceId) && q.getParticipantId().equals(participantId)) {
                    if (q.getExpiresAt() == null || q.getExpiresAt() > System.currentTimeMillis() / 1000) {
                        return q;
                    }
                }
            }
        }

        if (template.getIsActive() != null && !template.getIsActive()) {
            throw new IllegalArgumentException("Template is not active");
        }

        boolean allowsDecimal = Boolean.TRUE.equals(template.getAllowsDecimal());
        int maxDecimals = template.getMaxDecimalPlaces() != null ? template.getMaxDecimalPlaces() : 0;
        if (maxDecimals > 1) maxDecimals = 1;

        int min = template.getMinValue() != null ? template.getMinValue() : 1;
        int max = template.getMaxValue() != null ? template.getMaxValue() : 10;
        String operator = template.getOperator() != null ? template.getOperator() : "+";

        int num1 = 0, num2 = 0;
        double correctAnswerVal = 0;
        boolean valid = false;
        
        while (!valid) {
            num1 = min + random.nextInt(max - min + 1);
            num2 = min + random.nextInt(max - min + 1);
            
            switch (operator) {
                case "+": 
                    correctAnswerVal = num1 + num2; 
                    valid = true;
                    break;
                case "-": 
                    correctAnswerVal = num1 - num2; 
                    valid = true;
                    break;
                case "*": 
                    correctAnswerVal = num1 * num2; 
                    valid = true;
                    break;
                case "/": 
                    if (num2 == 0) continue;
                    if (!allowsDecimal) {
                        if (num1 % num2 == 0) {
                            correctAnswerVal = (double) num1 / num2;
                            valid = true;
                        }
                    } else {
                        if ((num1 * 10) % num2 == 0) {
                            correctAnswerVal = (double) num1 / num2;
                            valid = true;
                        }
                    }
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported operator: " + operator);
            }
        }

        String correctAnswerStr = formatNumber(correctAnswerVal, allowsDecimal, maxDecimals);

        Set<String> optionsSet = new LinkedHashSet<>();
        optionsSet.add(correctAnswerStr);
        
        double distractor1Val = 0;
        if (operator.equals("+")) distractor1Val = num1 - num2;
        else if (operator.equals("-")) distractor1Val = num1 + num2;
        else if (operator.equals("*")) distractor1Val = (num2 != 0) ? (double) num1 / num2 : num1 + num2;
        else if (operator.equals("/")) distractor1Val = (double) num1 * num2;
        
        optionsSet.add(formatNumber(distractor1Val, allowsDecimal, maxDecimals));
        
        optionsSet.add(formatNumber(correctAnswerVal + 10, allowsDecimal, maxDecimals));
        optionsSet.add(formatNumber(correctAnswerVal - 10, allowsDecimal, maxDecimals));
        optionsSet.add(formatNumber(correctAnswerVal + 1, allowsDecimal, maxDecimals));
        optionsSet.add(formatNumber(correctAnswerVal - 1, allowsDecimal, maxDecimals));
        
        List<String> options = new ArrayList<>();
        for (String opt : optionsSet) {
            options.add(opt);
            if (options.size() == 4) break;
        }
        
        while (options.size() < 4) {
            options.add(formatNumber(correctAnswerVal + random.nextInt(20) + 2, allowsDecimal, maxDecimals));
            options = new ArrayList<>(new LinkedHashSet<>(options));
        }
        
        Collections.shuffle(options);
        int correctIndex = options.indexOf(correctAnswerStr);
        
        StringBuilder optionsJson = new StringBuilder("[");
        for (int i = 0; i < options.size(); i++) {
            optionsJson.append("{\"id\":").append(i).append(",\"text\":\"").append(options.get(i)).append("\"}");
            if (i < options.size() - 1) optionsJson.append(",");
        }
        optionsJson.append("]");

        int norm1 = Math.max(num1, num2);
        int norm2 = Math.min(num1, num2);
        if (operator.equals("-") || operator.equals("/")) {
            norm1 = num1;
            norm2 = num2;
        }
        String fingerprint = String.format("%d_%s_%d_%d_%s_%d", 
                template.getId(), operator, norm1, norm2, template.getBranchCompatibility(), template.getDifficulty());

        RaceQuestionEntity newQuestion = new RaceQuestionEntity();
        newQuestion.setRaceId(raceId);
        newQuestion.setParticipantId(participantId);
        newQuestion.setTemplateId(template.getId());
        newQuestion.setQuestionText(num1 + " " + operator + " " + num2 + " = ?");
        newQuestion.setCorrectAnswer(correctAnswerStr);
        newQuestion.setDifficulty(template.getDifficulty());
        newQuestion.setBranchType(template.getBranchCompatibility());
        newQuestion.setIssuedAt(System.currentTimeMillis() / 1000);
        newQuestion.setExpiresAt(newQuestion.getIssuedAt() + 60);
        newQuestion.setIsAnswered(false);
        newQuestion.setStatus("OPEN");
        newQuestion.setFingerprint(fingerprint);
        newQuestion.setOptionsJson(optionsJson.toString());
        newQuestion.setCorrectOptionId(correctIndex);

        return newQuestion;
    }

    private String formatNumber(double value, boolean allowsDecimal, int maxDecimals) {
        if (!allowsDecimal) {
            return String.valueOf((long) Math.round(value));
        } else {
            String format = "%." + maxDecimals + "f";
            return String.format(java.util.Locale.US, format, value);
        }
    }
}
