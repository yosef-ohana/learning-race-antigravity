package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GameplayEligibilityService {

    private final Persist persist;

    public GameplayEligibilityService(Persist persist) {
        this.persist = persist;
    }

    public boolean checkIsBehind(Long raceId, int myPosition) {
        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.size() < 2) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        int leaderPos = parts.get(0).getPosition() != null ? parts.get(0).getPosition() : 0;
        return (leaderPos - myPosition) >= GameConstants.BEHIND_DISTANCE_THRESHOLD;
    }

    public boolean isHelpEligibleNow(Long raceId, RaceParticipantEntity participant) {
        int wrongCount = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
        int noProgress = participant.getConsecutiveNoProgressCount() != null ? participant.getConsecutiveNoProgressCount() : 0;
        if (wrongCount < 3 && noProgress < 3) return false;

        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.size() < 2) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        RaceParticipantEntity leader = parts.get(0);
        if (leader.getId().equals(participant.getId())) return false;
        
        int posDiff = leader.getPosition() - (participant.getPosition() == null ? 0 : participant.getPosition());
        int ptsDiff = leader.getPoints() - (participant.getPoints() == null ? 0 : participant.getPoints());
        
        return posDiff >= GameConstants.BEHIND_DISTANCE_THRESHOLD || ptsDiff >= GameConstants.BEHIND_POINTS_THRESHOLD;
    }
}
