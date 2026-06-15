# Code Navigation Guide — Innovative Learning Race

A short guide for reviewers and future developers who want to understand where each part of the project lives and how to safely add features.

## Core Principle

The backend is the source of truth for game rules.
The frontend only displays state, sends user actions, and listens to live updates.

Do not move game logic to the client.

## Project Structure

### Backend

`backend/src/main/java/com/innovativelearning/controllers/`
REST controllers.
Use these to understand which API endpoints exist and how requests enter the system.

Main files:
* `RaceController.java` — race creation, lobby, start/finish flow.
* `GameplayController.java` — live student gameplay actions, current question, answer submission, help, path choice, and SSE-related race updates.
* `AuthController.java` — teacher login/authentication.
* `DashboardController.java` — teacher dashboard data.

`backend/src/main/java/com/innovativelearning/services/`
Game logic and helper services.

Main files:
* `ScoringService.java` — score/progress calculation.
* `DecisionMeterService.java` — decision meter logic.
* `BranchingService.java` — highway/dirt/frozen branch behavior.
* `LuckEventService.java` — luck multiplier events.
* `QuestionGeneratorService.java` — creates live questions from templates.
* `QuestionTemplateCatalog.java` — template families and math question patterns.
* `RaceSnapshotService.java` — builds race dashboard snapshots.
* `QuestionResponseMapper.java` — maps stored questions into frontend question responses.
* `QuestionTemplateSelectionService.java` — selects the next template according to participant state.
* `GameplayEligibilityService.java` — help eligibility and behind-player checks.

`backend/src/main/java/com/innovativelearning/entities/`
Database entities.

`backend/src/main/java/com/innovativelearning/responses/`
DTO/response classes returned to the frontend.

`backend/src/main/java/com/innovativelearning/persist/Persist.java`
Manual persistence layer using Hibernate/HQL.

`backend/src/main/resources/objects.hbm.xml`
Hibernate XML mapping.
Do not change this unless the database model changes.

### Frontend

`frontend/src/pages/`
Main screens and page-level logic.

Important files:
* `StudentRacePage.jsx` — student gameplay page. Keeps state, API calls, SSE connection, timers, and page-level decisions.
* `TeacherRaceDashboardPage.jsx` — live teacher dashboard.
* `TeacherLobbyPage.jsx` — teacher lobby before race start.
* `StudentLobbyPage.jsx` — student waiting room.
* `TeacherResultsPage.jsx` / `StudentResultsPage.jsx` — results screens.

`frontend/src/components/`
Reusable and presentational UI components.

Important files:
* `RaceTrack.jsx` — visual race track.
* `QuestionCard.jsx` — question display and answer buttons.
* `PathChoiceModal.jsx` — highway/dirt choice.
* `HelpChoiceModal.jsx` — hint/replace choice.
* `StudentRaceHud.jsx` — top student race status area.
* `StudentRaceMainStage.jsx` — main student gameplay area.
* `StudentRaceOverlays.jsx` — frozen/luck/feedback/disconnect overlays.

`frontend/src/services/`
Frontend API/SSE helpers.
* `api.js` — HTTP calls to backend.
* `sse.js` — EventSource/SSE connection helper.

`frontend/src/styles/`
CSS split by topic:
* `base.css` — global variables and base layout.
* `shared.css` — shared UI elements.
* `student.css` — student screens.
* `teacher.css` — teacher screens.
* `race-track.css` — race track visuals.
* `results.css` — results screens.
* `animations.css` — keyframes.
* `responsive.css` — responsive rules.
* `index.css` — CSS entrypoint importing the split files.

## How To Add Features Safely

### Adding a new backend rule
Add or update the relevant service under `services/`.
Keep controllers focused on request/response flow.

Examples:
* score change → `ScoringService`
* decision meter change → `DecisionMeterService`
* highway/dirt/freeze change → `BranchingService`
* luck behavior → `LuckEventService`
* help eligibility → `GameplayEligibilityService`

### Adding a new question type
Start with:
* `QuestionTemplateCatalog.java`
* `QuestionGeneratorService.java`

Do not change frontend logic unless the response shape changes.

### Adding a new student UI feature
Start with:
* `StudentRacePage.jsx` for page-level state/flow
* `StudentRaceHud.jsx`, `StudentRaceMainStage.jsx`, or `StudentRaceOverlays.jsx` for display-only changes

Keep game logic on the backend.

### Adding a new teacher dashboard feature
Start with:
* `TeacherRaceDashboardPage.jsx`
* `RaceSnapshotService.java`
* `DashboardSnapshotResponse.java`

Make sure SSE payloads remain compatible with the frontend.

### Changing styling
Use the relevant CSS file:
* student UI → `student.css`
* teacher UI → `teacher.css`
* results → `results.css`
* track → `race-track.css`
* shared components → `shared.css`

Avoid changing unrelated screens.

## Safety Checklist Before Commit

Run:
```bash
cd backend
mvn clean compile
```
```bash
cd frontend
npm run build
```

Manually verify:
* Teacher login
* Race creation
* Student join
* Race start
* Question answering
* Dashboard live updates
* Help
* Path choice
* Frozen/luck states
* Race finish and results

## What Not To Do

* Do not move game logic to React.
* Do not change API response shapes unless necessary.
* Do not change SSE event names without updating all listeners.
* Do not change database mappings casually.
* Do not add libraries for small changes.
* Do not refactor unrelated code while fixing a small issue.

End of guide.
