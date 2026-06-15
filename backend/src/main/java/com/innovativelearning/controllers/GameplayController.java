package com.innovativelearning.controllers;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.enums.BranchType;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.enums.RaceStatus;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.BasicResponse;
import com.innovativelearning.responses.GameplayActionResponse;
import com.innovativelearning.responses.QuestionResponse;
import com.innovativelearning.responses.StudentRaceStateResponse;
import com.innovativelearning.responses.DashboardSnapshotResponse;
import com.innovativelearning.services.BranchingService;
import com.innovativelearning.services.DecisionMeterService;
import com.innovativelearning.services.LuckEventService;
import com.innovativelearning.services.QuestionGeneratorService;
import com.innovativelearning.services.ScoringService;
import com.innovativelearning.services.RaceSnapshotService;
import com.innovativelearning.services.QuestionResponseMapper;
import com.innovativelearning.services.QuestionTemplateSelectionService;
import com.innovativelearning.services.GameplayEligibilityService;
import com.innovativelearning.utils.GameConstants;
import com.innovativelearning.utils.SseConnectionManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
public class GameplayController {
    private final Persist persist;
    private final SseConnectionManager sseManager;
    private final ScoringService scoringService;
    private final DecisionMeterService decisionMeterService;
    private final BranchingService branchingService;
    private final LuckEventService luckEventService;
    private final QuestionGeneratorService questionGeneratorService;
    private final RaceSnapshotService raceSnapshotService;
    private final QuestionResponseMapper questionResponseMapper;
    private final QuestionTemplateSelectionService questionTemplateSelectionService;
    private final GameplayEligibilityService gameplayEligibilityService;

    public GameplayController(Persist persist, SseConnectionManager sseManager, 
                              ScoringService scoringService, DecisionMeterService decisionMeterService,
                              BranchingService branchingService, LuckEventService luckEventService,
                              QuestionGeneratorService questionGeneratorService,
                              RaceSnapshotService raceSnapshotService,
                              QuestionResponseMapper questionResponseMapper,
                              QuestionTemplateSelectionService questionTemplateSelectionService,
                              GameplayEligibilityService gameplayEligibilityService) {
        this.persist = persist;
        this.sseManager = sseManager;
        this.scoringService = scoringService;
        this.decisionMeterService = decisionMeterService;
        this.branchingService = branchingService;
        this.luckEventService = luckEventService;
        this.questionGeneratorService = questionGeneratorService;
        this.raceSnapshotService = raceSnapshotService;
        this.questionResponseMapper = questionResponseMapper;
        this.questionTemplateSelectionService = questionTemplateSelectionService;
        this.gameplayEligibilityService = gameplayEligibilityService;
    }

    private void broadcastRaceUpdate(Long raceId) {
        DashboardSnapshotResponse snap = raceSnapshotService.buildSnapshot(raceId);
        sseManager.sendEvent(raceId, "participant-progress-updated", snap);
    }

    @GetMapping(value = "/subscribe-student-race", produces = "text/event-stream")
    public SseEmitter subscribeStudent(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseManager.addEmitter(raceId, emitter);
        return emitter;
    }

    @GetMapping("/get-student-race-state")
    public StudentRaceStateResponse getStudentState(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());

        StudentRaceStateResponse res = new StudentRaceStateResponse();
        res.raceStatus = race.getStatus();
        
        long now = System.currentTimeMillis() / 1000;
        
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        
        boolean frozen = participant.getCurrentState() == ParticipantState.FROZEN;
        res.canPlay = race.getStatus().equals(RaceStatus.LIVE.name()) && !Boolean.TRUE.equals(participant.getFinished()) && !frozen;

        persist.update(participant);

        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false and status = 'OPEN'",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);
        boolean hasActiveQ = activeQ != null && (activeQ.getExpiresAt() == null || activeQ.getExpiresAt() > now);

        res.playerState = new StudentRaceStateResponse.PlayerState();
        res.playerState.id = student.getId();
        res.playerState.displayName = student.getDisplayName();
        res.playerState.position = participant.getPosition() != null ? participant.getPosition() : 0;
        res.playerState.points = participant.getPoints() != null ? participant.getPoints() : 0;
        res.playerState.isBehind = gameplayEligibilityService.checkIsBehind(raceId, res.playerState.position);
        res.playerState.hasPendingDecision = participant.getCurrentState() == ParticipantState.DECISION_PENDING && !hasActiveQ;
        res.playerState.currentState = participant.getCurrentState() != null ? participant.getCurrentState().name() : ParticipantState.NORMAL.name();
        res.playerState.status = res.playerState.currentState;
        res.playerState.activeLuckMultiplier = participant.getActiveLuckMultiplier();
        res.playerState.decisionMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
        res.playerState.freezeUntil = participant.getFreezeUntil();
        
        boolean helpAlreadyUsed = activeQ != null && activeQ.getHelpUsed() != null;
        res.playerState.hasPendingHelpChoice = gameplayEligibilityService.isHelpEligibleNow(raceId, participant) && !res.playerState.hasPendingDecision && !helpAlreadyUsed;
        res.playerState.helpAvailable = res.playerState.hasPendingHelpChoice;
        res.playerState.raceFinished = Boolean.TRUE.equals(participant.getFinished());

        List<RaceParticipantEntity> allParts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(allParts);
        res.participantsPositions = new ArrayList<>();
        int rank = 1;
        for (RaceParticipantEntity p : allParts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition() != null ? p.getPosition() : 0;
            pp.points = p.getPoints() != null ? p.getPoints() : 0;
            pp.rank = p.getFinishRank() != null ? p.getFinishRank() : rank;
            pp.currentState = p.getCurrentState() != null ? p.getCurrentState().name() : ParticipantState.NORMAL.name();
            pp.activeLuckMultiplier = p.getActiveLuckMultiplier();
            pp.decisionMeter = p.getDecisionMeter() != null ? p.getDecisionMeter() : 0;
            pp.freezeUntil = p.getFreezeUntil();
            res.participantsPositions.add(pp);
            if (p.getId().equals(participant.getId())) res.playerState.rank = pp.rank;
            rank++;
        }

        return res;
    }

    @GetMapping("/get-current-question")
    public QuestionResponse getCurrentQuestion(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        ParticipantState beforeState = participant.getCurrentState();
        
        long now = System.currentTimeMillis() / 1000;
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        persist.update(participant);

        ParticipantState afterState = participant.getCurrentState();

        List<RaceQuestionEntity> existingQs = persist.executeQuery(
            "from RaceQuestionEntity where participantId = :pid",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        RaceQuestionEntity activeQ = null;
        for (RaceQuestionEntity q : existingQs) {
            if ("OPEN".equals(q.getStatus()) && !Boolean.TRUE.equals(q.getIsAnswered())) {
                if (q.getExpiresAt() == null || q.getExpiresAt() > now) {
                    activeQ = q;
                    break;
                } else {
                    // Expire old
                    q.setIsAnswered(true);
                    q.setWasCorrect(false);
                    q.setStatus("TIMEOUT");
                    persist.update(q);
                    branchingService.handleQuestionAnswered(participant, false, now);
                    persist.update(participant);
                    broadcastRaceUpdate(raceId);
                }
            }
        }

        if (afterState == ParticipantState.DECISION_PENDING && activeQ == null) {
            if (beforeState != afterState) {
                broadcastRaceUpdate(raceId);
            }
            return null;
        }
        if (afterState == ParticipantState.FROZEN) {
            if (beforeState != afterState) {
                broadcastRaceUpdate(raceId);
            }
            return null;
        }

        if (activeQ == null) {
            QuestionTemplateEntity tmpl = questionTemplateSelectionService.pickTemplate(participant, existingQs);
            activeQ = questionGeneratorService.generateQuestion(raceId, participant.getId(), tmpl, existingQs);
            persist.save(activeQ);
        }

        boolean hintAvailable = gameplayEligibilityService.checkIsBehind(raceId, participant.getPosition() != null ? participant.getPosition() : 0);
        return questionResponseMapper.buildQuestionResponse(activeQ, hintAvailable);
    }

    @PostMapping("/submit-answer")
    public GameplayActionResponse submitAnswer(@RequestParam String token, @RequestParam Long raceId, 
                                               @RequestParam Long questionId, @RequestParam Integer selectedOptionId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());

        long now = System.currentTimeMillis() / 1000;
        
        if (participant.getCurrentState() == ParticipantState.FROZEN) {
            if (participant.getFreezeUntil() != null && now < participant.getFreezeUntil()) {
                return new GameplayActionResponse(false, "Participant is frozen");
            }
        }
        
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);

        RaceQuestionEntity q = persist.get(RaceQuestionEntity.class, questionId);
        if (q == null || Boolean.TRUE.equals(q.getIsAnswered()) || !"OPEN".equals(q.getStatus())) {
            return new GameplayActionResponse(false, "Invalid question");
        }

        q.setIsAnswered(true);
        q.setAnsweredAt(now);
        
        boolean isTimeout = (selectedOptionId != null && selectedOptionId == -1) 
            || (q.getExpiresAt() != null && now >= q.getExpiresAt());
        
        boolean correct = !isTimeout && q.getCorrectOptionId() != null && q.getCorrectOptionId().equals(selectedOptionId);
        q.setWasCorrect(correct);
        if (isTimeout) {
            q.setStatus("TIMEOUT");
        } else {
            q.setStatus(correct ? "ANSWERED_CORRECTLY" : "ANSWERED_WRONGLY");
        }
        persist.update(q);

        GameplayActionResponse res = new GameplayActionResponse(true, "Answer processed");
        res.isCorrect = correct;

        if (correct) {
            participant.setConsecutiveWrongCount(0);
            participant.setConsecutiveNoProgressCount(0);
            
            double finalScore = scoringService.calculateScore(participant);
            int scoreInt = (int) Math.round(finalScore);
            
            participant.setPoints((participant.getPoints() != null ? participant.getPoints() : 0) + scoreInt);
            participant.setPosition((participant.getPosition() != null ? participant.getPosition() : 0) + scoreInt);
            
            res.pointsDelta = scoreInt;
            res.progressDelta = scoreInt;
            
            decisionMeterService.addCorrectAnswerBonus(participant);
            
            int totalAnswered = persist.executeQuery("from RaceQuestionEntity where participantId = :pid and isAnswered = true", Map.of("pid", participant.getId()), RaceQuestionEntity.class).size();
            luckEventService.evaluateLuckEvent(participant, totalAnswered, now);
            
            branchingService.handleQuestionAnswered(participant, true, now);
            
        } else {
            int wrongCount = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
            participant.setConsecutiveWrongCount(wrongCount + 1);
            participant.setConsecutiveNoProgressCount(wrongCount + 1);
            
            branchingService.handleQuestionAnswered(participant, false, now);
        }

        if (participant.getPoints() != null && participant.getPoints() >= GameConstants.TRACK_TOTAL_SCORE) {
            participant.setFinished(true);
            res.raceFinished = true;
            persist.update(participant);
            com.innovativelearning.utils.RaceUtils.determineWinnerAndLeaderboard(raceId, persist, sseManager);
            sseManager.sendEvent(raceId, "race-finished", null);
        }

        persist.update(participant);
        
        res.newPosition = participant.getPosition() != null ? participant.getPosition() : 0;
        res.decisionMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
        res.triggeredDecision = participant.getCurrentState() == ParticipantState.DECISION_PENDING;
        res.currentState = participant.getCurrentState() != null ? participant.getCurrentState().name() : ParticipantState.NORMAL.name();
        res.activeLuckMultiplier = participant.getActiveLuckMultiplier();
        res.freezeUntil = participant.getFreezeUntil();
        
        broadcastRaceUpdate(raceId);

        return res;
    }

    @PostMapping("/choose-path")
    public BasicResponse choosePath(@RequestParam String token, @RequestParam Long raceId, @RequestParam String choice) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        long now = System.currentTimeMillis() / 1000;
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        
        if (participant.getCurrentState() != ParticipantState.DECISION_PENDING) {
            return new BasicResponse(false, "Not in decision state");
        }
        
        ParticipantState branch = ParticipantState.NORMAL;
        try {
            branch = ParticipantState.valueOf(choice);
        } catch (Exception e) {
            return new BasicResponse(false, "Invalid choice");
        }
        
        branchingService.enterBranch(participant, branch, now);
        persist.update(participant);
        
        broadcastRaceUpdate(raceId);
        
        return new BasicResponse(true, "Path chosen");
    }

    @PostMapping("/use-help")
    public QuestionResponse useHelp(@RequestParam String token, @RequestParam Long raceId, @RequestParam String helpType) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        long now = System.currentTimeMillis() / 1000;
        
        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false and status = 'OPEN'",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        if (activeQ == null) return null;

        if ("REPLACE".equals(helpType)) {
            activeQ.setIsAnswered(true);
            activeQ.setHelpUsed("REPLACE");
            activeQ.setStatus("TIMEOUT");
            persist.update(activeQ);
            
            participant.setConsecutiveWrongCount(0);
            participant.setConsecutiveNoProgressCount(0);
            persist.update(participant);
            
            List<RaceQuestionEntity> existingQs = persist.executeQuery(
                "from RaceQuestionEntity where participantId = :pid",
                Map.of("pid", participant.getId()), RaceQuestionEntity.class);
            
            QuestionTemplateEntity tmpl = questionTemplateSelectionService.pickTemplate(participant, existingQs);
            activeQ = questionGeneratorService.generateQuestion(raceId, participant.getId(), tmpl, existingQs);
            activeQ.setHelpUsed("POST_REPLACE");
            persist.save(activeQ);
            broadcastRaceUpdate(raceId);
        } else if ("HINT".equals(helpType)) {
            activeQ.setHelpUsed("HINT");
            persist.update(activeQ);
        } else {
            return null;
        }

        return questionResponseMapper.buildQuestionResponse(activeQ, false);
    }

    private UserEntity getStudentByToken(String token) {
        UserEntity student = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        if (student == null) throw new RuntimeException("Unauthorized");
        return student;
    }

    private RaceParticipantEntity getParticipant(Long raceId, Long userId) {
        return persist.executeQuerySingle("from RaceParticipantEntity where raceId = :rid and userId = :uid", 
            Map.of("rid", raceId, "uid", userId), RaceParticipantEntity.class);
    }
}
