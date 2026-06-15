package com.innovativelearning.services;

import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.responses.QuestionResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionResponseMapper {

    public QuestionResponse buildQuestionResponse(RaceQuestionEntity activeQ, boolean hintAvailable) {
        QuestionResponse qr = new QuestionResponse();
        qr.questionId = activeQ.getId();
        qr.questionText = activeQ.getQuestionText();
        setOptionsOnQuestionResponse(qr, activeQ.getOptionsJson());
        qr.status = activeQ.getStatus();
        qr.branchType = activeQ.getBranchType();
        qr.expiresAt = activeQ.getExpiresAt();
        qr.hintAvailable = hintAvailable;
        if ("HINT".equals(activeQ.getHelpUsed())) {
            qr.hintText = "נותרו שתי אפשרויות בלבד";
            applyHintToOptions(qr, activeQ);
        }
        qr.helpUsed = activeQ.getHelpUsed();
        return qr;
    }

    private void applyHintToOptions(QuestionResponse qr, RaceQuestionEntity activeQ) {
        if (qr.options == null || qr.options.size() <= 2) return;
        Integer correctId = activeQ.getCorrectOptionId();
        if (correctId == null) return;

        List<QuestionResponse.Option> wrongOptions = new ArrayList<>();
        QuestionResponse.Option correctOption = null;

        for (QuestionResponse.Option opt : qr.options) {
            if (opt.id == correctId) {
                correctOption = opt;
            } else {
                wrongOptions.add(opt);
            }
        }

        if (correctOption != null && !wrongOptions.isEmpty()) {
            int index = (int) (activeQ.getId() % wrongOptions.size());
            QuestionResponse.Option selectedWrongOption = wrongOptions.get(index);
            
            List<QuestionResponse.Option> newOptions = new ArrayList<>();
            for (QuestionResponse.Option opt : qr.options) {
                if (opt.id == correctOption.id || opt.id == selectedWrongOption.id) {
                    newOptions.add(opt);
                }
            }
            qr.options = newOptions;
        }
    }

    private void setOptionsOnQuestionResponse(QuestionResponse qr, String optionsJson) {
        if (optionsJson == null) return;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            qr.options = mapper.readValue(optionsJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<QuestionResponse.Option>>() {});
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
