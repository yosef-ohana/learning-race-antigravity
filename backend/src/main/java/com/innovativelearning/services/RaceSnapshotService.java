package com.innovativelearning.services;

import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.DashboardSnapshotResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RaceSnapshotService {

    private final Persist persist;

    public RaceSnapshotService(Persist persist) {
        this.persist = persist;
    }

    public DashboardSnapshotResponse buildSnapshot(Long raceId) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        List<RaceParticipantEntity> allParts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(allParts);
        
        DashboardSnapshotResponse snap = new DashboardSnapshotResponse();
        snap.raceStatus = race.getStatus();
        snap.participantsPositions = new ArrayList<>();
        snap.leaderboard = new ArrayList<>();
        
        int rank = 1;
        for (RaceParticipantEntity p : allParts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition() != null ? p.getPosition() : 0;
            pp.points = p.getPoints() != null ? p.getPoints() : 0;
            pp.rank = p.getFinishRank() != null ? p.getFinishRank() : rank++;
            pp.currentState = p.getCurrentState() != null ? p.getCurrentState().name() : ParticipantState.NORMAL.name();
            pp.activeLuckMultiplier = p.getActiveLuckMultiplier();
            pp.decisionMeter = p.getDecisionMeter() != null ? p.getDecisionMeter() : 0;
            pp.freezeUntil = p.getFreezeUntil();
            
            snap.participantsPositions.add(pp);
            snap.leaderboard.add(pp);
        }
        
        return snap;
    }
}
