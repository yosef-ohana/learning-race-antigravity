package com.innovativelearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.ApplicationContext;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.enums.UserRole;

import java.util.UUID;

@SpringBootApplication(exclude = {HibernateJpaAutoConfiguration.class, JpaRepositoriesAutoConfiguration.class})
public class LearningRaceApplication {

    private final ApplicationContext applicationContext;

    public LearningRaceApplication(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    public static void main(String[] args) {
        SpringApplication.run(LearningRaceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedData() {
        Persist persist = applicationContext.getBean(Persist.class);
        
        if (persist.executeQuery("from UserEntity where loginName = :ln", java.util.Map.of("ln", "teacher"), UserEntity.class).isEmpty()) {
            UserEntity teacher = new UserEntity();
            teacher.setLoginName("teacher");
            teacher.setPasswordHash("password123");
            teacher.setDisplayName("Teacher");
            teacher.setRole(UserRole.TEACHER.name());
            teacher.setToken(UUID.randomUUID().toString());
            teacher.setActive(true);
            teacher.setCreatedAt(System.currentTimeMillis());
            persist.save(teacher);
            System.out.println("Seeded teacher user (teacher/password123)");
        }

        if (persist.list(QuestionTemplateEntity.class).isEmpty()) {
            // 1. COUNT_REMAINDER
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "COUNT_REMAINDER", "REMAINDER", i, 0, 0, 60);
            }
            // 2. PERCENT_REVERSE
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "PERCENT_REVERSE", "REVERSE", i, 0, 0, 60);
            }
            // 3. PERCENT_MULTI
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "PERCENT_MULTI", "MULTI", i, 0, 0, 60);
            }
            // 4. SPEED_RELATIVE
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "SPEED_RELATIVE", "SPEED", i, 0, 0, 60);
            }
            // 5. DIVISION_PACKING
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "DIVISION_PACKING", "PACKING", i, 0, 0, 60);
            }
            // 6. RATIO
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "RATIO", "RATIO", i, 0, 0, 60);
            }
            // 7. AVERAGE
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "AVERAGE", "AVERAGE", i, 0, 0, 60);
            }
            // 8. WORK_RATE
            for (int i=1; i<=10; i++) {
                seedTemplate(persist, "Math", "WORK_RATE", "WORK", i, 0, 0, 60);
            }
            
            System.out.println("Seeded math templates");
        }
    }

    private void seedTemplate(Persist persist, String subject, String type, String operator, int diff, int min, int max, int time) {
        QuestionTemplateEntity q = new QuestionTemplateEntity();
        q.setSubject(subject);
        q.setTemplateType(type);
        q.setOperator(operator);
        q.setDifficulty(diff);
        q.setMinValue(min);
        q.setMaxValue(max);
        q.setBaseTimeSeconds(time);
        q.setIsActive(true);
        persist.save(q);
    }
}
