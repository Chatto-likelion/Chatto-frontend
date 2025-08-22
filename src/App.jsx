import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./routes/RequireAuth";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import PlayPage from "./pages/PlayPage";
import PlayChemiPage from "./pages/PlayChemiPage";
import PlayChemiAnalysisPage from "./pages/PlayChemiAnalysisPage";
import PlayChemiResultPage from "./pages/PlayChemiResultPage";
import PlaySomePage from "./pages/PlaySomePage";
import PlaySomeAnalysisPage from "./pages/PlaySomeAnalysisPage";
import PlayMbtiPage from "./pages/PlayMbtiPage.jsx";
import PlayMbtiAnalysisPage from "./pages/PlayMbtiAnalysisPage";
import PlayMyPage from "./pages/PlayMyPage";
import BusinessPage from "./pages/BusinessPage";
import BusinessContrPage from "./pages/BusinessContrPage";
import BusinessContrAnalysisPage from "./pages/BusinessContrAnalysisPage";
import BusinessMyPage from "./pages/BusinessMyPage";
import CreditsPage from "./pages/CreditsPage";
import ResultPage from "./pages/ResultPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import BusinessResultPage from "./pages/BusinessResultPage_test.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import QuizResultAnalysisPage from "./pages/QuizResultAnalysisPage.jsx";
import QuizResultPage from "./pages/QuizResultPage.jsx";
import QuizSolvePage from "./pages/QuizSolvePage.jsx";
import ProfileEditPage from "./pages/ProfileEditPage.jsx";
import PlayChemiSharePage from "./pages/PlayChemiSharePage.jsx";
import QuizPersonalAnswerPage from "./pages/QuizPersonalAnswerPage";
import PlaySomeSharePage from "./pages/PlaySomeSharePage.jsx";
import PlayMbtiSharePage from "./pages/PlayMbtiSharePage.jsx";
import BusinessContrSharePage from "./pages/BusinessContrSharePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/business" element={<BusinessPage />} />

        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forget" element={<ForgetPasswordPage />} />

        <Route
          path="/play/chemi/share/:uuid"
          element={<PlayChemiSharePage />}
        />
        <Route path="/play/some/share/:uuid" element={<PlaySomeSharePage />} />
        <Route path="/play/mbti/share/:uuid" element={<PlayMbtiSharePage />} />
        <Route
          path="/business/contr/share/:uuid"
          element={<BusinessContrSharePage />}
        />

        <Route
          path="/play/chemi/result-test"
          element={<PlayChemiResultPage />}
        />
        <Route
          path="/business/contr/result-test"
          element={<BusinessResultPage />}
        />

        <Route element={<RequireAuth />}>
          <Route path="/play/chemi" element={<PlayChemiPage />} />
          <Route
            path="/play/chemi/:resultId"
            element={<PlayChemiAnalysisPage />}
          />

          <Route path="/play/some" element={<PlaySomePage />} />
          <Route
            path="/play/some/:resultId"
            element={<PlaySomeAnalysisPage />}
          />
          <Route path="/play/mbti" element={<PlayMbtiPage />} />
          <Route
            path="/play/mbti/:resultId"
            element={<PlayMbtiAnalysisPage />}
          />
          <Route path="/play/mypage" element={<PlayMyPage />} />

          <Route path="/business/contr" element={<BusinessContrPage />} />
          <Route
            path="/business/contr/:resultId"
            element={<BusinessContrAnalysisPage />}
          />

          <Route path="/business/mypage" element={<BusinessMyPage />} />

          <Route path="/credit" element={<CreditsPage />} />
          <Route path="/result/:analysisId" element={<ResultPage />} />
          <Route path="/play/quiz/:resultId/:uuid" element={<QuizPage />} />
          <Route
            path="/play/quiz/result/analysis/:resultId/:uuid"
            element={<QuizResultAnalysisPage />}
          />
          <Route
            path="/play/quiz/result/:resultId/:uuid"
            element={<QuizResultPage />}
          />

          <Route path="/profileedit" element={<ProfileEditPage />} />
        </Route>
        <Route
          path="/play/quiz/solve/:analysisId"
          element={<QuizSolvePage />}
        />
        <Route
          path="/play/quiz/answer/:resultId"
          element={<QuizPersonalAnswerPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
