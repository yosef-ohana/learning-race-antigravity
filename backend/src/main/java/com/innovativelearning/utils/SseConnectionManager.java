package com.innovativelearning.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseConnectionManager {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void addEmitter(Long raceId, SseEmitter emitter) {
        emitters.put(raceId, emitter);
        emitter.onCompletion(() -> emitters.remove(raceId));
        emitter.onTimeout(() -> emitters.remove(raceId));
        emitter.onError((e) -> emitters.remove(raceId));
    }

    public void sendEvent(Long raceId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(raceId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                emitters.remove(raceId);
            }
        }
    }
}
