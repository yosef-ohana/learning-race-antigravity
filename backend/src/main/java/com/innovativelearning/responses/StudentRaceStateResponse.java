package com.innovativelearning.responses;

import java.util.List;

public class StudentRaceStateResponse {
    public String raceStatus;
    public boolean canPlay;
    public PlayerState playerState;
    public List<DashboardSnapshotResponse.ParticipantPosition> participantsPositions;

    public static class PlayerState {
        public Long id;
        public String displayName;
        public int position;
        public int points;
        public boolean isBehind;
        public boolean hasPendingDecision;
        public boolean hasPendingHelpChoice;
    }
}
