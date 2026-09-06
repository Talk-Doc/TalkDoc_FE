# Talk-Doc Frontend

AI 기반 청각장애인 병원 소통 지원 서비스의 프론트엔드입니다.
환자 휴대폰 한 대에서: 의료진 질문 확인 → 수어(또는 텍스트) 답변 → AI 인식 결과 확인 → 의료진에게 전달, 순서로 진행됩니다.

## 처음 실행하는 법

```bash
npm install     # 필요한 패키지 설치 (최초 1번 / package.json이 바뀔 때마다)
npm run dev     # 개발 서버 실행 (브라우저에서 http://localhost:5173 접속)
```

터미널에 뜨는 주소를 클릭하면 브라우저에서 바로 화면을 볼 수 있고,
코드를 저장하면 브라우저가 자동으로 새로고침됩니다(HMR).

다른 명령어:

```bash
npm run build   # 배포용으로 빌드 (타입 오류가 있으면 여기서 걸러짐)
npm run lint    # 코드 스타일 검사
```

## 백엔드와 함께 실행하기

이 프론트는 [TalkDoc_BE](../TalkDoc_BE) 백엔드(Spring Boot, 8080 포트)와 붙어서 동작합니다.

```bash
# 1) 백엔드 저장소에서: Redis + 백엔드(mock AI 프로필) 실행
docker compose up -d redis            # 또는 로컬 redis-server
./gradlew bootRun --args='--spring.profiles.active=local'

# 2) 이 저장소에서
npm run dev
```

개발 서버(vite)는 `/api`, `/ws` 요청을 `VITE_DEV_BACKEND_URL`(기본 `http://localhost:8080`)로
프록시하므로 CORS 설정 없이 바로 붙습니다. 백엔드 주소를 바꾸려면 `.env.example`을 `.env`로
복사해서 값을 수정하세요. 배포 시 프론트/백엔드 도메인이 다르면 `VITE_API_BASE_URL`을 지정합니다.

마이크/카메라는 `localhost` 또는 HTTPS에서만 열립니다. 권한이 없거나 데스크톱 등에서
장치를 못 쓰면 화면이 자동으로 텍스트 입력으로 바뀝니다.

### 화면 ↔ API 대응

| 화면 | 백엔드 호출 | 토큰 |
|---|---|---|
| 시작 화면 "대화 시작하기" | `POST /api/sessions` | 없음 |
| 의료진 질문 (녹음 종료 / 텍스트 등록) | `POST /api/sessions/{id}/question` (multipart `audio` 또는 `text`) | 의료진 |
| 수어 촬영 → AI 분석 | `POST /api/sessions/{id}/sign` (multipart `video`) → `POST .../answer/preview` | 환자 |
| 답변 확인 "의료진에게 전달하기" | `POST .../answer/confirm` | 환자 |
| 의료진 답변 화면 "음성으로 듣기" | `GET .../answer/{answerId}/tts` | 의료진 |
| 대화 종료 | `POST .../summary` → `DELETE /api/sessions/{id}` | 의료진 |
| 세션 알림 (닫힘 등) | `WS /ws/sessions/{id}?token=` | 의료진 |

세션 생성 시 받은 의료진/환자 토큰은 `sessionStorage`에 보관되며(휴대폰 한 대에서 두 역할이
번갈아 사용), 요청마다 알맞은 토큰을 `Authorization: Bearer` 헤더로 보냅니다.

## 폴더 구조

```
src/
  main.tsx              앱 진입점 (거의 건드릴 일 없음)
  App.tsx                라우터: 주소(URL)별로 어떤 화면을 보여줄지 정의
  types/conversation.ts  대화 흐름에서 쓰는 타입 정의
  api/
    client.ts            fetch 공통 처리 (토큰 헤더, 에러 변환, WebSocket 주소)
    types.ts             백엔드 응답 타입 (snake_case 그대로)
    talkdoc.ts           엔드포인트별 호출 함수
    socket.ts            세션 WebSocket 훅
  session/               세션(토큰) 보관 컨텍스트와 useSession 훅
  media/useMediaRecorder.ts  마이크/카메라 녹음·녹화 훅
  components/            여러 화면에서 공통으로 쓰는 조각 (예: PhoneScreen)
  pages/
    LandingPage.tsx       시작 화면 ("/")
    ConversationPage.tsx  대화 진행 화면 ("/conversation") — 아래 conversation/ 폴더의
                           조각들을 상태(step)에 따라 갈아끼우는 역할만 함
    conversation/         대화 진행 중 나오는 화면 조각들
                           (의료진 질문, 환자 확인, 수어 카메라, 분석 중, 결과 확인,
                            인식 실패, 텍스트 입력, 의료진 답변, 종료 확인 모달)
    EndCompletePage.tsx   종료 완료 화면 ("/end")
```

## 지금 상태 (중요)

- 화면 흐름(라우팅 + 상태 전환)은 전부 완성되어 클릭만으로 처음부터 끝까지 진행됩니다.
- **디자인은 아직 미적용 상태**입니다. Tailwind CSS로 대충 뼈대만 잡아둔 화면이라,
  Figma 디자인이 나오면(9/5 예정) 그 위에 색상/간격/폰트 등 스타일만 입힐 예정입니다.
- 실제 AI(STT/수어 인식/LLM) 연동은 아직 없고, 각 파일에 `TODO(백엔드 연동)` 주석으로
  나중에 실제 API를 연결해야 할 지점을 표시해뒀습니다. 지금은 버튼을 누르면
  가짜(mock) 데이터로 다음 화면으로 넘어갑니다.
- `AnalyzingStep.tsx`에는 AI 연동 전까지 인식 성공/실패 화면을 모두 확인해볼 수 있도록
  임시 테스트 버튼 두 개가 들어있습니다. 실제 AI가 붙으면 이 버튼은 지울 예정입니다.

## 처음 보는 용어 3개만

- **컴포넌트**: 화면 하나(또는 버튼처럼 작은 조각 하나)를 함수로 만든 것. `src/pages`, `src/components` 안 `.tsx` 파일 하나하나가 컴포넌트입니다.
- **props**: 컴포넌트에 넘겨주는 값(함수 파라미터라고 생각하면 됩니다). 예: `<PatientConfirmStep questionText={...} />`
- **state**: 화면이 기억해야 하는 값(예: 지금 어떤 단계인지). 값이 바뀌면 화면이 자동으로 다시 그려집니다. `ConversationPage.tsx`의 `step`이 그 예시입니다.
