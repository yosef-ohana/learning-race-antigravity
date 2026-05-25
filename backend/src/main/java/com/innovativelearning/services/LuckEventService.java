package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class LuckEventService {

    private final Random random = new Random();

    public void evaluateLuckEvent(RaceParticipantEntity participant, int totalAnsweredQuestions, long lastLuckEventTimeSeconds, long currentTimeSeconds) {
        if (participant.getActiveLuckMultiplier() != null && participant.getActiveLuckMultiplier() != 1.0) {
            return;
        }

        boolean eligibleByQuestions = (totalAnsweredQuestions > 0 && totalAnsweredQuestions % GameConstants.LUCK_TRIGGER_QUESTIONS == 0);
        boolean eligibleByTime = (currentTimeSeconds - lastLuckEventTimeSeconds >= GameConstants.LUCK_TRIGGER_SECONDS);

        if (eligibleByQuestions || eligibleByTime) {
            triggerLuckEvent(participant);
        }
    }

    private void triggerLuckEvent(RaceParticipantEntity participant) {
        int roll = random.nextInt(100);
        boolean isBoost = roll < 70;
        
        if (isBoost) {
            participant.setActiveLuckMultiplier(GameConstants.LUCK_BOOST_MULTIPLIER);
        } else {
            if (participant.getCurrentState() != ParticipantState.FROZEN) {
                participant.setActiveLuckMultiplier(GameConstants.LUCK_PUNCTURE_MULTIPLIER);
            }
        }
    }
}
