# Chatto Frontend

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?size=24&duration=2800&pause=800&center=true&vCenter=true&width=650&lines=Chatto:+Conversation+Analysis+Platform;AI+based+Chat+%26+Messenger+Insights;Frontend+built+with+React+%7C+JavaScript+%7C+Tailwind" alt="Typing SVG" />
</p>

## 📌 프로젝트 소개

**Chatto**는 대화 기반 분석 플랫폼으로, 단순한 심리 분석을 넘어 **업무용 메신저 분석**까지 포함하는 **범용 대화 분석 서비스**입니다.  
프론트엔드는 모바일 퍼스트 디자인을 지향하며, 직관적인 UX와 가벼운 인터페이스를 제공합니다.

- 🎭 **Chatto Play**: 심리 분석, 성격 분석, 대화형 퀴즈 제공
- 💼 **Chatto Business**: 업무용 메신저 데이터 분석, 대시보드 기반 인사이트 제공
- 🖤 **디자인 방향성**
  - 기본 테마: 흑백 기반의 미니멀 UI
  - 포인트 컬러: 보라(심리 분석), 남색(업무 분석)

---

## ⚙️ 기술 스택

- **Framework**: [React](https://react.dev/) (JavaScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Deployment**: AWS EC2, NGINX, Gunicorn

---

## 🚀 주요 기능

- 🔑 **회원가입 & 로그인 & 유저 정보 확인/수정**

  - `signup`, `login`, `logout`, `getMe`, `putProfile` API 사용
  - 로그인 후 브라우저 쿠키에 Refresh / Access Token 저장
  - useAuth Context를 통한 전역 상태 관리

- 📊 **주요 서비스 기능**

  - Chatto Play: 비교적 자유로운 분위기의 친목 목적 채팅방에서의 대화를 분석하여 흥미로운 자료를 제공하는 서비스. 채팅 파일 업로드, 채팅 분석, 퀴즈 생성, 분석 및 퀴즈 외부 공유 기능 제공.

    - Play 케미 분석기: 주로 여러 명이 포함된 채팅방에서 구성원들 간의 케미와 채팅방 분위기를 분석하는 서비스. '상호작용 매트릭스', '케미 순위 TOP3', '대화 톤', '응답 톤', '대화 주제 비율' 등의 항목 제공.
    - Play 썸 판독기: 주로 1대1 채팅방에서 구성원이 연인 전 단계인 '썸 단계'에 해당하는지 애정 기류를 분석하는 서비스. '호감 지수 분석', '말투 감정 분석', '대화 패턴 분석' 등의 항목 제공.
    - Play MBTI 분석: 구성원들의 대화를 바탕으로 MBTI를 분석하는 서비스. 'MBTI 통계', 구성원 별 'MBTI 모먼트' 등의 항목 제공.
    - Quiz: 분석을 수행한 사용자가 퀴즈를 생성/수정할 수 있는 QuizPage, 친구들의 결과를 확인할 수 있는 QuizResultAnalysisPage, QuizResultPage 제공. 퀴즈를 공유받은 게스트가 퀴즈를 풀 수 있는 QuizSolvePage, 자신의 결과를 확인할 수 있는 QuizPersonalAnswerPage 제공.

  - Chatto Business: 단체 혹은 목적이 있는 업무용 채팅방에서의 대화를 분석하여 단체 운영 및 관리에 도움이 되는 자료를 제공하는 서비스. 채팅 파일 업로드, 채팅 분석, 퀴즈 생성, 분석 외부 공유 기능 제공.

    - Business 업무 참여도 분석: 구성원들의 업무 참여도, 응답율 등을 분석하는 서비스. '종합 참여 점수', '정보 공유', '문제 해결 참여', '주도적 제안', '응답 속도' 등의 항목을 항목별, 개인별, 기간별로 정리하여 막대그래프, 꺾은선그래프 등의 형태로 제공.

  - MyPage (Play/Business): 사용자 정보 확인 및 수정 기능, 현재까지 수행한 분석들을 관리할 수 있는 분석 보기 탭 제공.
  - CreditPage: 가려진 분석 결과 보기와 퀴즈 추가 생성에 이용되는 서비스 내 재화인 크레딧의 충전, 충전/이용내역 조회 기능 제공. (크레딧 충전 기능은 모의 기능으로, 버튼을 누를 시 결제 없이 충전됩니다.)
  - Share: 외부 게스트가 resultId 기반 uuid를 통해 분석 및 퀴즈에 접근 가능.

- 👥 **추가 기능**

  - RequireAuth Routes를 통해 사용자 로그인 확인, 최초 401 response 시 Token refresh 시도
  - useCurrentMode 훅을 통해 현재 사용자가 이용중인 서비스가 Play인지 Business인지 확인, 이에 따른 컴포넌트 재사용
  - AsyncBoundary + ErrorFallback + LoadingSpinner 통한 예외/로딩 처리

- 📊 **사용 시나리오**

  - 서비스 정보 확인 -

    1. 로그인 여부와 관계없이, LandingPage의 헤더에서 'About' 버튼 눌러 AboutPage로 이동
    2. 상단에는 서비스 개요, 하단에는 'Play'와 'Business' 탭 별로 이미지와 함께 메인 사용 시나리오 제공

  - 회원가입과 로그인 -
    1. RequireAuth 알림 또는 헤더의 'sign in' 버튼 눌러 SignInPage로 이동
    2. 이미 회원가입 했었다면, 아이디와 비밀번호 입력 후 'sign in' 버튼 눌러 로그인 (비밀번호 찾기 기능은 미구현)
    3. 회원가입하지 않았다면, 'Sign Up Now' 버튼 눌러 SignUpPage로 이동.
       아이디, 전화번호, 비밀번호, 이메일 입력 후 '회원가입 완료' 버튼 눌러 회원가입 (이메일 인증 기능은 미구현)
  - 채팅 파일 업로드 및 관리 -

    1. LandingPage에서 카드의 버튼을 눌러 PlayPage 또는 BusinessPage로 이동
    2. PlayPage 또는 BusinessPage에서 이용하고 싶은 분석 서비스를 선택
    3. 왼쪽 하단 FileUpload 컴포넌트에 txt 파일을 드래그&드롭 하거나, '파일 찾아보기'를 통해 로컬의 파일 업로드
    4. 왼쪽 상단 '업로드된 채팅'이라 뜨는 ChatList 컴포넌트에서 업로드 한 채팅 확인
    5. ChatList의 업로드된 채팅 리스트에서 채팅 제목 수정(제목 클릭) 및 채팅 삭제(우측 X 버튼) 가능

  - 채팅 분석 서비스 이용 -

    1. 왼쪽 상단 업로드된 채팅 리스트에서 분석하고 싶은 채팅 선택
    2. 서비스 페이지 중앙에서 '세부 정보'(분석을 위해 필요한 추가적인 세부 옵션 설정. 설정 안 할시 default 값 사용) 설정
    3. '분석 시작' 버튼으로 분석
    4. Play / Business 서비스 이용 원할 시 헤더 좌측의 Business / Play 토글 눌러 이동 가능
    5. 다른 분석 서비스 이용 원할 시 우측의 내비게이션 바를 통해 이용 가능

  - 분석 결과 확인 및 재분석 -

    1. 분석 이후 AnalysisPage에서 분석 결과 확인 가능
    2. 가려진 분석 내용의 경우, 크레딧 소모하여 확인 가능
    3. 우측 상단 DetailForm 컴포넌트에 사용자가 입력한 세부 정보 존재. 해당 내용 바꾸어서 다시 분석 가능. (세부 정보가 이전과 똑같거나, 해당 분석의 채팅 파일이 삭제되었을 경우 다시 분석 불가)
    4. 분석 결과 삭제 원할 시 우측의 '결과 삭제' 버튼을 통해 삭제 가능 (삭제 안 할 시 자동 저장)
    5. 다른 서비스 이용 원할 시 우측 하단의 작은 내비게이션 바를 통해 이용 가능

  - 분석 결과 공유 -

    1. AnalysisPage 우측의 '결과 공유' 버튼을 눌러 공유 모달 띄우기
    2. 모달 중앙의 uuid 기반 링크를 직접 복사하거나, 우측 COPY 버튼을 통해 복사 후 공유 가능
    3. 하단의 SNS 아이콘은 미구현

  - (Play) 퀴즈 생성 및 수정 -

    1. Play 서비스의 AnalysisPage 우측의 '퀴즈 생성(이미 퀴즈가 있다면 퀴즈 보기)' 버튼 눌러 퀴즈 생성, QuizPage로 이동
    2. 기본적으로 10개의 퀴즈를 AI가 제공, 문항 본문 및 선지 수정 또는 퀴즈 문항 삭제 가능
    3. 퀴즈 문항 추가 시 크레딧 소모하여 추가 가능 (퀴즈 수정 및 추가 시 이전에 게스트들이 해당 퀴즈를 푼 기록 삭제. 관련 모달로 확인 후 진행 가능)
    4. 우측의 '퀴즈 공유' 버튼을 통해 공유 모달 띄우기
       4.1. 모달 중앙의 uuid 기반 링크를 직접 복사하거나, 우측 COPY 버튼을 통해 복사 후 공유 가능
    5. 퀴즈 전체 삭제 원할 시 우측의 퀴즈 삭제 버튼을 통해 퀴즈 전체 삭제 가능
    6. 다른 사용자가 퀴즈 푼 기록 원할 시, 상단의 '퀴즈 문제 구성'/'친구 점수 보기' 토글을 눌러 QuizResultAnalysisPage로 이동
    7. 친구 평균 점수, 푼 사람 수, 선지 별 선택 비율(호버 시 선택한 사람 명단), 가장 많이 맞춘/틀린 문항 확인 가능
    8. 우측에서 친구들의 개별 점수 목록 확인 가능, 친구 개인의 결과 보고 싶을 시 해당 목록 눌러 QuizResultPage로 이동 (각 명단 별 QPId 링크에 포함)
       8.1. 친구 개인의 점수와 고른 선택지 확인 가능
    9. 해당 퀴즈의 분석 결과를 다시 보고 싶을 시 왼쪽의 상세 정보 목록 아래의 '분석 보기' 버튼을 통해 AnalysisPage로 다시 이동 가능

  - (게스트) 공유받은 분석 결과 확인 -

    1. 공유받은 uuid 기반 링크를 통해 분석 결과에 접근 가능 (~SharePage) (resultId를 노출하지 않아 공유하지 않은 분석 결과는 확인 불가능)

  - (게스트) (Play) 공유받은 퀴즈 풀기 -

    1. 공유받은 uuid 기반 링크를 통해 퀴즈에 접근 가능 (QuizSolvePage)
    2. 퀴즈 선지에 정답 체크한 뒤, 상단에 닉네임 입력 후 제출 가능
    3. 제출 후, '내 점수 보러가기' 버튼을 통해 개인 점수 페이지(QuizPersonalResultPage)로 이동 가능
    4. 정답 여부와 정답과 함께, 친구들이 각 선지를 고른 비율 확인 가능.
    5. QuizSolvePage와 QuizPersonalResultPage 모두 우측의 '나도 분석해보기' 버튼을 통해 AboutPage로 이동 가능 (서비스 이용 유도).

  - MyPage 이용 -

    1. 헤더의 'MyPage' 버튼을 통해 Play 또는 Business MyPage로 이동 가능. (Play 또는 Business 서비스 이용 중이지 않은 경우 작은 드롭다운에서 선택 가능)
    2. 왼쪽 상단에서 업로드된 채팅 목록 확인 및 관리 가능, 왼쪽 하단에서 파일 업로드 가능
    3. 중앙 상단에서 사용자 정보 확인 가능, '정보수정' 버튼을 눌러 정보수정 페이지 (ProfileEditPage)로 이동 가능
       3.1. 비밀번호 재확인 후, 사용자의 정보 수정 제출 가능
    4. 중앙 하단에서 분석한 목록 확인 가능.
       4.1. 분석 카드에는 이용한 서비스 종류, 분석 시간, 분석한 채팅방 정보, 설정한 세부 정보 확인 가능
       4.2. 우측 상단의 X 버튼을 눌러 분석 삭제 가능, 하단의 '분석 보기' 및 '퀴즈 보기' (Play)를 통해 각각 분석과 퀴즈 페이지로 이동 가능
       4.3. 좌측 업로드된 채팅 목록에서 채팅 선택 시, 선택한 채팅에 해당하는 분석들만 필터링하여 목록에 제공

  - CreditPage 이용 -
    1. 헤더의 크레딧 표시 또는 MyPage의 크레딧 충전 버튼을 통해 CreditPage로 이동 가능
    2. 왼쪽의 크레딧 양과 가격이 표시된 버튼들을 눌러 충전 가능 (실제 결제 없는 모의 충전)
    3. 오른쪽의 탭에서 '충전 내역', '이용 내역', '크레딧이란?' 탭을 통해 충전/이용 내역과 크레딧에 대한 설명을 확인 가능

---

## 📂 폴더 구조

src/
├── apis/ # Axios API 모듈
├── assets/ # 아이콘(svg, png), 이미지
├── components/ # 공통 UI 컴포넌트
├── contexts/ # 전역 상태 (AuthContext 등)
├── hooks/ # Custom hooks (useCurrentMode 등)
├── pages/ # 주요 페이지 (Play, Business, About 등)
├── routes/ # RequireAuth 함수
├── utils/ # 쿠키 관련 함수
├── App.jsx # 라우팅 & 전역 레이아웃
├── index.css/ # 전역 css 스타일 지정, 폰트 및 색상 프리셋 지정
└── main.jsx # 엔트리 포인트

## 🛠 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

## 브랜치 전략
- main
  - 최종본
- develop
  - 최종 배포 전 테스트 용도
  - 개발 중인 코드들을 해당 브랜치에 merge → 점검 후 main에 merge
- Feature
  - 실제 작업할 때 만드는 브랜치 (기능 별)
  - develop에 merge 후에는 같은 기능이라도 뒤에 구분 표시
  - 형식 : **`이름/feature/[기능명]/[내용 요약]`**
      - 예시
          `eunseok/feature/login`
          `eunseok/feature/login/update`
          `eunseok/feature/login/update2`
- hotfix
  - 배포된 코드에 긴급 수정이 필요할 때
  - 형식 : **`이름/hotfix/[내용 요약]`**
      - 예시
          `eunseok/hotfix/login-bugfix`


## 커밋 메시지 컨벤션
| feat | 새로운 기능에 대한 커밋 |
| fix | 버그 수정에 대한 커밋 |
| build | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제에 대한 커밋 |
| chore | 그 외 자잘한 수정에 대한 커밋 |
| ci | ci 관련 설정 수정에 대한 커밋 |
| docs | 문서 수정에 대한 커밋 |
| style | 코드 스타일 혹은 포맷 등에 관한 커밋 |
| refactor | 코드 리팩토링에 대한 커밋 |
| test | 테스트 코드 수정에 대한 커밋 |
| perf | 성능 개선에 대한 커밋 |
e.g. `"fix: Safari에서 모달을 띄웠을 때 스크롤 이슈 수정"`

```
