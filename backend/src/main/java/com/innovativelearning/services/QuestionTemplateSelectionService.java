package com.innovativelearning.services;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.persist.Persist;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class QuestionTemplateSelectionService {

    private final Persist persist;
    private final Random random = new Random();

    public QuestionTemplateSelectionService(Persist persist) {
        this.persist = persist;
    }

    public QuestionTemplateEntity pickTemplate(RaceParticipantEntity participant, List<RaceQuestionEntity> existingQs) {
        List<QuestionTemplateEntity> allTemplates = persist.list(QuestionTemplateEntity.class);
        if (allTemplates.isEmpty()) throw new RuntimeException("No templates");
        
        List<QuestionTemplateEntity> active = allTemplates.stream().filter(t -> Boolean.TRUE.equals(t.getIsActive())).collect(Collectors.toList());
        if (active.isEmpty()) active = allTemplates;
        
        String currentBranch = participant.getCurrentState() != null ? participant.getCurrentState().name() : "NORMAL";
        if (currentBranch.equals("FROZEN") || currentBranch.equals("DECISION_PENDING")) currentBranch = "NORMAL";
        
        final String cb = currentBranch;
        List<QuestionTemplateEntity> branchTmpls = active.stream().filter(t -> cb.equals(t.getBranchCompatibility())).collect(Collectors.toList());
        if (branchTmpls.isEmpty()) branchTmpls = active;

        // Deterministic template lock by branch: HIGHWAY → WORK_TOGETHER, DIRT_ROAD → EQ_REVERSE_OPS
        if ("HIGHWAY".equals(cb)) {
            final List<QuestionTemplateEntity> branchTmplsFinal = branchTmpls;
            QuestionTemplateEntity locked = branchTmplsFinal.stream()
                .filter(t -> "WORK_TOGETHER".equals(t.getLogicTag()) && Boolean.TRUE.equals(t.getIsActive()))
                .findFirst().orElse(null);
            if (locked != null) return locked;
        } else if ("DIRT_ROAD".equals(cb)) {
            final List<QuestionTemplateEntity> branchTmplsFinal = branchTmpls;
            QuestionTemplateEntity locked = branchTmplsFinal.stream()
                .filter(t -> "EQ_REVERSE_OPS".equals(t.getLogicTag()) && Boolean.TRUE.equals(t.getIsActive()))
                .findFirst().orElse(null);
            if (locked != null) return locked;
        }

        if (existingQs == null || existingQs.isEmpty()) {
            return branchTmpls.get(random.nextInt(branchTmpls.size()));
        }

        List<RaceQuestionEntity> recent = existingQs.stream()
            .filter(q -> q.getAnsweredAt() != null)
            .sorted((a,b) -> Long.compare(b.getAnsweredAt(), a.getAnsweredAt()))
            .collect(Collectors.toList());

        List<Long> recentTemplateIds = recent.stream().limit(5).map(RaceQuestionEntity::getTemplateId).collect(Collectors.toList());
        
        String fam1 = null; String fam2 = null;
        if (recent.size() >= 1) fam1 = getTemplateFamilyById(allTemplates, recent.get(0).getTemplateId());
        if (recent.size() >= 2) fam2 = getTemplateFamilyById(allTemplates, recent.get(1).getTemplateId());
        
        String bannedFamily = null;
        if (fam1 != null && fam1.equals(fam2)) bannedFamily = fam1;
        final String finalBannedFamily = bannedFamily;
        
        List<QuestionTemplateEntity> candidates = branchTmpls.stream()
            .filter(t -> !recentTemplateIds.contains(t.getId()))
            .filter(t -> finalBannedFamily == null || !finalBannedFamily.equals(t.getTemplateFamily()))
            .collect(Collectors.toList());
            
        if (candidates.isEmpty()) {
            candidates = branchTmpls;
        }
        
        return candidates.get(random.nextInt(candidates.size()));
    }

    private String getTemplateFamilyById(List<QuestionTemplateEntity> list, Long id) {
        if (id == null) return null;
        QuestionTemplateEntity tmpl = list.stream().filter(t -> id.equals(t.getId())).findFirst().orElse(null);
        return tmpl != null ? tmpl.getTemplateFamily() : null;
    }
}
