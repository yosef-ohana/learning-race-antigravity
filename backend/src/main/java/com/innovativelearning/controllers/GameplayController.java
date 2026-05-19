package com.innovativelearning.controllers;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.enums.BranchType;
import com.innovativelearning.enums.RaceStatus;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.BasicResponse;
import com.innovativelearning.responses.GameplayActionResponse;
import com.innovativelearning.responses.QuestionResponse;
import com.innovativelearning.responses.StudentRaceStateResponse;
import com.innovativelearning.responses.DashboardSnapshotResponse;
import com.innovativelearning.utils.GameConstants;
import com.innovativelearning.utils.SseConnectionManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
public class GameplayController {
    private final Persist persist;
    private final SseConnectionManager sseManager;
    private final Random random = new Random();

    public GameplayController(Persist persist, SseConnectionManager sseManager) {
        this.persist = persist;
        this.sseManager = sseManager;
    }

    @GetMapping("/get-student-race-state")
    public StudentRaceStateResponse getStudentState(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());

        StudentRaceStateResponse res = new StudentRaceStateResponse();
        res.raceStatus = race.getStatus();
        
        long now = System.currentTimeMillis();
        boolean frozen = participant.getFreezeUntil() != null && participant.getFreezeUntil() > now;
        res.canPlay = race.getStatus().equals(RaceStatus.LIVE.name()) && !participant.getFinished() && !frozen;

        if (participant.getLastDecisionMeterUpdate() != null) {
            long secondsPassed = (now - participant.getLastDecisionMeterUpdate()) / 1000;
            if (secondsPassed > 0) {
                participant.setDecisionMeter(Math.min(GameConstants.DECISION_METER_MAX, 
                    participant.getDecisionMeter() + (int)secondsPassed * GameConstants.DECISION_FILL_PER_SECOND));
                participant.setLastDecisionMeterUpdate(now);
            }
        } else {
            participant.setLastDecisionMeterUpdate(now);
        }
        
        if (participant.getSpeedMultiplierUntil() != null && participant.getSpeedMultiplierUntil() < now && participant.getSpeedMultiplier() != 1.0) {
            participant.setSpeedMultiplier(1.0);
        }
        
        persist.update(participant);

        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);
        boolean hasActiveQ = activeQ != null && (activeQ.getExpiresAt() == null || activeQ.getExpiresAt() > now);

        res.playerState = new StudentRaceStateResponse.PlayerState();
        res.playerState.id = student.getId();
        res.playerState.displayName = student.getDisplayName();
        res.playerState.position = participant.getPosition();
        res.playerState.points = participant.getPoints();
        res.playerState.isBehind = checkIsBehind(raceId, participant.getPosition());
        res.playerState.hasPendingDecision = participant.getDecisionMeter() >= GameConstants.DECISION_METER_MAX && !hasActiveQ;
        
        boolean helpAlreadyUsed = activeQ != null && activeQ.getHelpUsed() != null;
        res.playerState.hasPendingHelpChoice = isHelpEligibleNow(raceId, participant) && !res.playerState.hasPendingDecision && !helpAlreadyUsed;

        List<RaceParticipantEntity> allParts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(allParts);
        res.participantsPositions = new java.util.ArrayList<>();
        for (RaceParticipantEntity p : allParts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition();
            pp.points = p.getPoints();
            res.participantsPositions.add(pp);
        }

        return res;
    }

    @GetMapping("/get-current-question")
    public QuestionResponse getCurrentQuestion(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        // If decision meter full, no question
        if (participant.getDecisionMeter() >= GameConstants.DECISION_METER_MAX) return null;

        // Check if there is an active question
        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        if (activeQ == null || (activeQ.getExpiresAt() != null && activeQ.getExpiresAt() < System.currentTimeMillis())) {
            if (activeQ != null) {
                // expire old
                activeQ.setIsAnswered(true);
                activeQ.setWasCorrect(false);
                persist.update(activeQ);
                
                int wStreak = participant.getWrongStreakAtLevel() != null ? participant.getWrongStreakAtLevel() : 0;
                participant.setWrongStreakAtLevel(wStreak + 1);
                participant.setCorrectStreakAtLevel(0);
                
                if (participant.getWrongStreakAtLevel() >= 2) {
                    int currentDiff = participant.getDifficultyLevel() != null ? participant.getDifficultyLevel() : GameConstants.DIFFICULTY_START;
                    participant.setDifficultyLevel(Math.max(GameConstants.DIFFICULTY_MIN, currentDiff - GameConstants.DIFFICULTY_STEP_DOWN));
                    participant.setWrongStreakAtLevel(0);
                }
                
                int currentStreak = participant.getConsecutiveNoProgressCount() != null ? participant.getConsecutiveNoProgressCount() : 0;
                participant.setConsecutiveNoProgressCount(currentStreak + 1);
                
                int currentWrong = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
                participant.setConsecutiveWrongCount(currentWrong + 1);
                persist.update(participant);
            }
            
            if (participant.getDecisionMeter() >= GameConstants.DECISION_METER_MAX) {
                return null;
            }
            
            // Generate new question
            String nextBranch = BranchType.NORMAL.name();
            if (participant.getDirtRoadQuestionsLeft() != null && participant.getDirtRoadQuestionsLeft() > 0) {
                nextBranch = BranchType.DIRT_ROAD.name();
                participant.setDirtRoadQuestionsLeft(participant.getDirtRoadQuestionsLeft() - 1);
                persist.update(participant);
            }
            activeQ = generateQuestion(raceId, participant.getId(), nextBranch);
        }

        QuestionResponse qr = new QuestionResponse();
        qr.questionId = activeQ.getId();
        qr.questionText = activeQ.getQuestionText();
        qr.branchType = activeQ.getBranchType();
        qr.expiresAt = activeQ.getExpiresAt();
        qr.hintAvailable = checkIsBehind(raceId, participant.getPosition());
        if ("HINT".equals(activeQ.getHelpUsed())) {
            qr.hintText = "Hint: it's close to " + (Integer.parseInt(activeQ.getCorrectAnswer()) + random.nextInt(5) - 2);
        }
        qr.helpUsed = activeQ.getHelpUsed();
        return qr;
    }

    @PostMapping("/submit-answer")
    public GameplayActionResponse submitAnswer(@RequestParam String token, @RequestParam Long raceId, 
                                               @RequestParam Long questionId, @RequestParam String answer) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        RaceEntity race = persist.get(RaceEntity.class, raceId);

        RaceQuestionEntity q = persist.get(RaceQuestionEntity.class, questionId);
        if (q == null || q.getIsAnswered()) return new GameplayActionResponse(false, "Invalid question");

        q.setIsAnswered(true);
        q.setAnsweredAt(System.currentTimeMillis());
        
        boolean correct = false;
        String normalizedSubmit = answer.trim().replace(",", ".");
        String normalizedCorrect = q.getCorrectAnswer().trim().replace(",", ".");
        try {
            double submitVal = Double.parseDouble(normalizedSubmit);
            double correctVal = Double.parseDouble(normalizedCorrect);
            correct = Math.abs(submitVal - correctVal) < 0.01;
        } catch (NumberFormatException e) {
            correct = normalizedCorrect.equals(normalizedSubmit);
        }
        
        q.setWasCorrect(correct);
        persist.update(q);

        GameplayActionResponse res = new GameplayActionResponse(true, "Answer processed");
        res.isCorrect = correct;

        if (correct) {
            participant.setConsecutiveNoProgressCount(0);
            participant.setConsecutiveWrongCount(0);
            int progress = GameConstants.BASE_PROGRESS_NORMAL;
            int points = GameConstants.BASE_POINTS_NORMAL;
            
            if (BranchType.HIGHWAY.name().equals(q.getBranchType())) {
                progress *= GameConstants.HIGHWAY_PROGRESS_EQUIVALENT;
                points *= GameConstants.HIGHWAY_POINTS_MULTIPLIER;
            } else if (BranchType.DIRT_ROAD.name().equals(q.getBranchType())) {
                progress = GameConstants.DIRT_ROAD_PROGRESS_PER_CORRECT;
            }

            // Speed multiplier
            progress = (int) (progress * participant.getSpeedMultiplier());

            participant.setPosition(participant.getPosition() + progress);
            participant.setPoints(participant.getPoints() + points);
            participant.setDecisionMeter(Math.min(GameConstants.DECISION_METER_MAX, participant.getDecisionMeter() + GameConstants.DECISION_FILL_PER_CORRECT));
            
            res.progressDelta = progress;
            res.pointsDelta = points;
            
            int cStreak = participant.getCorrectStreakAtLevel() != null ? participant.getCorrectStreakAtLevel() : 0;
            participant.setCorrectStreakAtLevel(cStreak + 1);
            participant.setWrongStreakAtLevel(0);
            
            if (participant.getCorrectStreakAtLevel() >= 2) {
                int currentDiff = participant.getDifficultyLevel() != null ? participant.getDifficultyLevel() : GameConstants.DIFFICULTY_START;
                participant.setDifficultyLevel(Math.min(GameConstants.DIFFICULTY_MAX, currentDiff + GameConstants.DIFFICULTY_STEP_UP));
                participant.setCorrectStreakAtLevel(0);
            }
            
            // Luck event logic (10% chance if normal)
            if (BranchType.NORMAL.name().equals(q.getBranchType()) && random.nextInt(100) < 10) {
                long now = System.currentTimeMillis();
                boolean isFrozen = participant.getFreezeUntil() != null && participant.getFreezeUntil() > now;
                boolean isUnderEffect = participant.getSpeedMultiplierUntil() != null && participant.getSpeedMultiplierUntil() > now;
                
                if (!isFrozen && !isUnderEffect) {
                    if (random.nextInt(100) < 75) {
                        res.luckEvent = "Boost! 1.5x speed";
                        participant.setSpeedMultiplier(GameConstants.BOOST_SPEED_MULTIPLIER);
                        participant.setSpeedMultiplierUntil(now + GameConstants.BOOST_DURATION_SECONDS * 1000L);
                    } else {
                        res.luckEvent = "Puncture! 0.5x speed";
                        participant.setSpeedMultiplier(GameConstants.PUNCTURE_SLOW_PERCENT);
                        participant.setSpeedMultiplierUntil(now + GameConstants.PUNCTURE_DURATION_SECONDS * 1000L);
                    }
                }
            }
        } else {
            int currentPoints = participant.getPoints() == null ? 0 : participant.getPoints();
            participant.setPoints(Math.max(0, currentPoints - 10));
            
            int currentPos = participant.getPosition() == null ? 0 : participant.getPosition();
            participant.setPosition(Math.max(0, currentPos - GameConstants.BASE_PROGRESS_NORMAL));
            
            int wStreak = participant.getWrongStreakAtLevel() != null ? participant.getWrongStreakAtLevel() : 0;
            participant.setWrongStreakAtLevel(wStreak + 1);
            participant.setCorrectStreakAtLevel(0);
            
            if (participant.getWrongStreakAtLevel() >= 2) {
                int currentDiff = participant.getDifficultyLevel() != null ? participant.getDifficultyLevel() : GameConstants.DIFFICULTY_START;
                participant.setDifficultyLevel(Math.max(GameConstants.DIFFICULTY_MIN, currentDiff - GameConstants.DIFFICULTY_STEP_DOWN));
                participant.setWrongStreakAtLevel(0);
            }
            
            int currentStreak = participant.getConsecutiveNoProgressCount() != null ? participant.getConsecutiveNoProgressCount() : 0;
            participant.setConsecutiveNoProgressCount(currentStreak + 1);
            
            int currentWrong = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
            participant.setConsecutiveWrongCount(currentWrong + 1);
            
            if (BranchType.HIGHWAY.name().equals(q.getBranchType())) {
                participant.setFreezeUntil(System.currentTimeMillis() + GameConstants.HIGHWAY_FAIL_FREEZE_SECONDS * 1000L);
            }
        }

        // Check win
        if (participant.getPosition() >= race.getTrackLength()) {
            participant.setFinished(true);
            participant.setPosition(race.getTrackLength());
            res.raceFinished = true;
            persist.update(participant);
            com.innovativelearning.utils.RaceUtils.determineWinnerAndLeaderboard(raceId, persist, sseManager);
        }

        res.newPosition = participant.getPosition();
        res.decisionMeter = participant.getDecisionMeter();
        res.triggeredDecision = participant.getDecisionMeter() >= GameConstants.DECISION_METER_MAX;
        
        persist.update(participant);
        sseManager.sendEvent(raceId, "participant-progress-updated", "UPDATED");

        return res;
    }

    @PostMapping("/choose-path")
    public BasicResponse choosePath(@RequestParam String token, @RequestParam Long raceId, @RequestParam String choice) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        if (participant.getDecisionMeter() >= GameConstants.DECISION_METER_MAX) {
            participant.setDecisionMeter(0); // reset
            if (BranchType.DIRT_ROAD.name().equals(choice)) {
                participant.setDirtRoadQuestionsLeft(GameConstants.DIRT_ROAD_QUESTION_COUNT);
            } else {
                participant.setDirtRoadQuestionsLeft(0);
            }
            persist.update(participant);
            
            // Clear old questions
            List<RaceQuestionEntity> oldQs = persist.executeQuery(
                "from RaceQuestionEntity where participantId = :pid and isAnswered = false",
                Map.of("pid", participant.getId()), RaceQuestionEntity.class);
            for (RaceQuestionEntity oq : oldQs) {
                oq.setIsAnswered(true);
                persist.update(oq);
            }

            // Generate first question for the chosen path immediately
            if (BranchType.DIRT_ROAD.name().equals(choice)) {
                participant.setDirtRoadQuestionsLeft(participant.getDirtRoadQuestionsLeft() - 1);
                persist.update(participant);
            }
            generateQuestion(raceId, participant.getId(), choice);
        }
        return new BasicResponse(true, "Path chosen");
    }

    @PostMapping("/use-help")
    public QuestionResponse useHelp(@RequestParam String token, @RequestParam Long raceId, @RequestParam String helpType) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        if (activeQ == null) return null;

        if ("REPLACE".equals(helpType)) {
            activeQ.setIsAnswered(true);
            activeQ.setHelpUsed("REPLACE");
            persist.update(activeQ);
            activeQ = generateQuestion(raceId, participant.getId(), BranchType.NORMAL.name());
            activeQ.setHelpUsed("POST_REPLACE");
            persist.update(activeQ);
        } else if ("HINT".equals(helpType)) {
            activeQ.setHelpUsed("HINT");
            persist.update(activeQ);
        } else if ("SKIP".equals(helpType)) {
            activeQ.setHelpUsed("SKIP");
            persist.update(activeQ);
        }

        QuestionResponse qr = new QuestionResponse();
        qr.questionId = activeQ.getId();
        qr.questionText = activeQ.getQuestionText();
        qr.branchType = activeQ.getBranchType();
        qr.expiresAt = activeQ.getExpiresAt();
        if ("HINT".equals(helpType)) {
            qr.hintText = "Hint: it's close to " + (Integer.parseInt(activeQ.getCorrectAnswer()) + random.nextInt(5) - 2);
        }
        qr.helpUsed = activeQ.getHelpUsed();
        return qr;
    }

    @PostMapping("/skip-help")
    public BasicResponse skipHelp(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);
        if (activeQ != null) {
            activeQ.setHelpUsed("SKIP");
            persist.update(activeQ);
        }
        return new BasicResponse(true, "Help skipped");
    }

    private RaceQuestionEntity generateQuestion(Long raceId, Long participantId, String branchType) {
        List<QuestionTemplateEntity> allTemplates = persist.list(QuestionTemplateEntity.class);
        if (allTemplates.isEmpty()) throw new RuntimeException("No templates");
        
        int participantDiff = getParticipant(raceId, participantId).getDifficultyLevel() != null ? getParticipant(raceId, participantId).getDifficultyLevel() : GameConstants.DIFFICULTY_START;
        
        int branchModifier = 0;
        if (BranchType.HIGHWAY.name().equals(branchType)) branchModifier = 2;
        else if (BranchType.DIRT_ROAD.name().equals(branchType)) branchModifier = -2;
        
        int progressModifier = getParticipant(raceId, participantId).getPosition() / (GameConstants.TRACK_LENGTH / 4);
        
        int lagForgivenessModifier = 0;
        if (checkIsBehind(raceId, getParticipant(raceId, participantId).getPosition())) {
            lagForgivenessModifier = -1;
        }
        
        int targetDifficulty = participantDiff + branchModifier + progressModifier + lagForgivenessModifier;
        targetDifficulty = Math.max(GameConstants.DIFFICULTY_MIN, Math.min(GameConstants.DIFFICULTY_MAX, targetDifficulty));
        
        final int td = targetDifficulty;
        List<QuestionTemplateEntity> templates = allTemplates.stream()
            .filter(t -> t.getDifficulty() == td)
            .collect(java.util.stream.Collectors.toList());
        
        if (templates.isEmpty()) {
            int nearestDiff = allTemplates.stream()
                .map(QuestionTemplateEntity::getDifficulty)
                .min(java.util.Comparator.comparingInt(level -> Math.abs(level - td)))
                .orElse(GameConstants.DIFFICULTY_START);
            templates = allTemplates.stream()
                .filter(t -> t.getDifficulty() == nearestDiff)
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (templates.isEmpty()) templates = allTemplates;
        
        RaceQuestionEntity lastQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid order by issuedAt desc", 
            Map.of("pid", participantId), RaceQuestionEntity.class);
        Long lastTemplateId = lastQ != null ? lastQ.getTemplateId() : null;
        
        if (templates.size() > 1 && lastTemplateId != null) {
            final Long finalLastTmplId = lastTemplateId;
            List<QuestionTemplateEntity> filtered = templates.stream()
                .filter(t -> !t.getId().equals(finalLastTmplId))
                .collect(java.util.stream.Collectors.toList());
            if (!filtered.isEmpty()) {
                templates = filtered;
            }
        }
        
        QuestionTemplateEntity tmpl = templates.get(random.nextInt(templates.size()));
        
        String[] names = {"נועה", "דניאל", "אורי", "יעל", "משה", "דוד", "רן", "יואב", "מיכל", "איתי"};
        String[] objects = {"תפוחים", "כדורים", "ספרים", "עפרונות", "בובות"};
        int idx1 = random.nextInt(names.length);
        int idx2 = (idx1 + random.nextInt(names.length - 1) + 1) % names.length;
        String name1 = names[idx1];
        String name2 = names[idx2];
        String obj = objects[random.nextInt(objects.length)];
        
        String qText = "";
        String answer = "";
        
        if ("COUNT_REMAINDER".equals(tmpl.getTemplateType())) {
            int friends = (td * 2) + random.nextInt(5) + 2;
            int applesPerFriend = (td * 3) + random.nextInt(10);
            int remainder = random.nextInt(friends - 1) + 1;
            int totalApples = (friends * applesPerFriend) + remainder;
            qText = name1 + " קטף " + totalApples + " " + obj + ". הוא חילק אותם שווה בשווה לחבריו, ונשארו לו " + remainder + " " + obj + ". כל חבר קיבל " + applesPerFriend + " " + obj + ". לכמה חברים " + name1 + " חילק את ה" + obj + "?";
            answer = String.valueOf(friends);
        } else if ("PERCENT_REVERSE".equals(tmpl.getTemplateType())) {
            int discountPercent = (td * 5) + random.nextInt(5) * 5; 
            if (discountPercent > 90) discountPercent = 90;
            int originalPrice = ((td * 2) + random.nextInt(5) + 1) * 100; // ensures clean division
            int finalPrice = originalPrice - (originalPrice * discountPercent / 100);
            qText = "מחירו של מוצר לאחר הנחה של " + discountPercent + "% הוא " + finalPrice + " שקלים. מה היה מחירו המקורי בשקלים?";
            answer = String.valueOf(originalPrice);
        } else if ("PERCENT_MULTI".equals(tmpl.getTemplateType())) {
            int inc = (td * 5) + 10;
            int dec = (td * 5) + 5;
            int original = ((td * 2) + random.nextInt(5) + 1) * 100; // ensures clean integer steps
            double step1 = original * (1.0 + (inc / 100.0));
            double step2 = step1 * (1.0 - (dec / 100.0));
            qText = "מוצר עלה במחירו ב-" + inc + "%, ולאחר מכן ירד ב-" + dec + "%. מחירו הסופי הוא " + String.format("%.1f", step2).replace(".0", "") + " שקלים. מה היה מחירו המקורי?";
            answer = String.valueOf(original);
        } else if ("SPEED_RELATIVE".equals(tmpl.getTemplateType())) {
            int speed1 = (td * 10) + 50;
            int speed2 = (td * 10) + 60;
            int hours = (td / 2) + 1 + random.nextInt(3);
            int distance = (speed1 + speed2) * hours;
            qText = "שתי רכבות יוצאות באותו הזמן זו לקראת זו משתי ערים שהמרחק ביניהן הוא " + distance + " ק\"מ. המהירות של רכבת אחת היא " + speed1 + " קמ\"ש והמהירות של השנייה היא " + speed2 + " קמ\"ש. תוך כמה שעות הן ייפגשו?";
            answer = String.valueOf(hours);
        } else if ("DIVISION_PACKING".equals(tmpl.getTemplateType())) {
            int totalItems = (td * 50) + random.nextInt(100) + 50;
            int boxCapacity = (td * 5) + 10;
            int leftover = totalItems % boxCapacity;
            qText = "למפעל יש " + totalItems + " " + obj + ". הם אורזים אותם בקופסאות של " + boxCapacity + ". כמה " + obj + " יישארו מחוץ לקופסאות המלאות?";
            answer = String.valueOf(leftover);
        } else if ("RATIO".equals(tmpl.getTemplateType())) {
            int ratio1 = (td % 4) + 2;
            int ratio2 = (td % 5) + 3;
            if (ratio1 == ratio2) ratio2++;
            int multiplier = (td * 5) + 10;
            int total = (ratio1 + ratio2) * multiplier;
            qText = "סכום של " + total + " שקלים חולק בין " + name1 + " ל" + name2 + " ביחס של " + ratio1 + ":" + ratio2 + " (בהתאמה). כמה שקלים קיבל " + name2 + "?";
            answer = String.valueOf(ratio2 * multiplier);
        } else if ("AVERAGE".equals(tmpl.getTemplateType())) {
            int count = (td % 3) + 3; 
            int sum = 0;
            for(int i=0; i<count-1; i++) {
                sum += (td * 10) + random.nextInt(20);
            }
            int remainder = sum % count;
            int missingValueBase = (td * 10) + random.nextInt(20);
            int neededToDivide = (count - remainder) % count;
            int missingValue = missingValueBase + neededToDivide;
            int targetAvg = (sum + missingValue) / count;
            qText = "הממוצע של " + count + " מספרים הוא " + targetAvg + ". סכום המספרים (ללא המספר האחרון) הוא " + sum + ". מהו המספר האחרון?";
            answer = String.valueOf(missingValue);
        } else if ("WORK_RATE".equals(tmpl.getTemplateType())) {
            int time1 = (td % 4) + 2;
            int time2 = (td % 4) + 3;
            if (time1 == time2) time2++;
            int commonMultiple = time1 * time2;
            double togetherRate = (double)commonMultiple / time1 + (double)commonMultiple / time2;
            double togetherTime = commonMultiple / togetherRate;
            qText = name1 + " יכול לסיים פרויקט לבד ב-" + time1 + " ימים. " + name2 + " יכול לסיים את אותו פרויקט לבד ב-" + time2 + " ימים. אם שניהם יעבדו יחד, כמה ימים יקח להם לסיים את הפרויקט? (הכנס תשובה עשרונית, מדויקת עד ספרה אחת אחרי הנקודה)";
            answer = String.format("%.1f", togetherTime).replace(",", ".");
        } else {
            int op1 = (td * 10) + random.nextInt(20);
            int op2 = (td * 5) + random.nextInt(10);
            if (op1 < op2) { int temp = op1; op1 = op2; op2 = temp; }
            qText = name1 + " מצא " + op1 + " מטבעות, ונתן " + op2 + " ל" + name2 + ". כמה נשארו לו?";
            answer = String.valueOf(op1 - op2);
        }

        RaceQuestionEntity q = new RaceQuestionEntity();
        q.setRaceId(raceId);
        q.setParticipantId(participantId);
        q.setTemplateId(tmpl.getId());
        q.setQuestionText(qText);
        q.setCorrectAnswer(answer);
        q.setDifficulty(tmpl.getDifficulty());
        q.setBranchType(branchType);
        q.setIssuedAt(System.currentTimeMillis());
        q.setExpiresAt(System.currentTimeMillis() + tmpl.getBaseTimeSeconds() * 1000L);
        q.setIsAnswered(false);
        persist.save(q);
        
        return q;
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

    private boolean checkIsBehind(Long raceId, int myPosition) {
        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.size() < 2) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        int leaderPos = parts.get(0).getPosition();
        return (leaderPos - myPosition) >= GameConstants.BEHIND_DISTANCE_THRESHOLD;
    }

    private boolean isHelpEligibleNow(Long raceId, RaceParticipantEntity participant) {
        int wrongCount = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
        int noProgressCount = participant.getConsecutiveNoProgressCount() != null ? participant.getConsecutiveNoProgressCount() : 0;
        
        if (wrongCount < GameConstants.HELP_TRIGGER_NO_PROGRESS_COUNT && noProgressCount < GameConstants.HELP_TRIGGER_NO_PROGRESS_COUNT) {
            return false;
        }
        
        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.isEmpty()) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        RaceParticipantEntity leader = parts.get(0);
        if (leader.getId().equals(participant.getId())) return false;
        
        int posDiff = leader.getPosition() - (participant.getPosition() == null ? 0 : participant.getPosition());
        int ptsDiff = leader.getPoints() - (participant.getPoints() == null ? 0 : participant.getPoints());
        
        boolean isEligible = posDiff >= GameConstants.BEHIND_DISTANCE_THRESHOLD || ptsDiff >= GameConstants.BEHIND_POINTS_THRESHOLD;
        
        System.out.println("[DEBUG] Help check for player " + participant.getId() + " - wrong: " + wrongCount + ", noProgress: " + noProgressCount + ", posGap: " + posDiff + ", ptsGap: " + ptsDiff + " -> eligible: " + isEligible);
        
        return isEligible;
    }
}
