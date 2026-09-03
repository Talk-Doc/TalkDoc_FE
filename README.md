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

## 폴더 구조

```
src/
  main.tsx              앱 진입점 (거의 건드릴 일 없음)
  App.tsx                라우터: 주소(URL)별로 어떤 화면을 보여줄지 정의
  types/conversation.ts  대화 흐름에서 쓰는 타입 정의
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
