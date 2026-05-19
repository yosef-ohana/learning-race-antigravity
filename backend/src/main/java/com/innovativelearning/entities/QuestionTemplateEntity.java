package com.innovativelearning.entities;

public class QuestionTemplateEntity {
    private Long id;
    private String subject;
    private String templateType;
    private String operator;
    private Integer difficulty;
    private Integer minValue;
    private Integer maxValue;
    private Integer baseTimeSeconds;
    private Boolean isActive;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getTemplateType() { return templateType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
    public Integer getMinValue() { return minValue; }
    public void setMinValue(Integer minValue) { this.minValue = minValue; }
    public Integer getMaxValue() { return maxValue; }
    public void setMaxValue(Integer maxValue) { this.maxValue = maxValue; }
    public Integer getBaseTimeSeconds() { return baseTimeSeconds; }
    public void setBaseTimeSeconds(Integer baseTimeSeconds) { this.baseTimeSeconds = baseTimeSeconds; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
