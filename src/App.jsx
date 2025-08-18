import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
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

/** ✅ demo=1 쿼리를 자동으로 붙여주는 래퍼 (API 안 타고 목데이터로 렌더) */
function DemoWrapper({ children }) {
  const nav = useNavigate();
  const loc = useLocation();
  React.useEffect(() => {
    const sp = new URLSearchParams(loc.search);
    if (sp.get("demo") !== "1") {
      sp.set("demo", "1");
      nav(`${loc.pathname}?${sp.toString()}`, { replace: true });
    }
  }, [loc.pathname, loc.search, nav]);
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/chemi" element={<PlayChemiPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/business/contr" element={<BusinessContrPage />} />

        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forget" element={<ForgetPasswordPage />} />

        <Route
          path="/play/chemi/result-test"
          element={<PlayChemiResultPage />}
        />
        <Route
          path="/business/contr/result-test"
          element={<BusinessResultPage />}
        />

        {/** --------------------- 🎯 DEMO ROUTES (no login, no resultId) --------------------- */}

        <Route
          path="/demo/credit"
          element={
            <DemoWrapper>
              <CreditsPage></CreditsPage>
            </DemoWrapper>
          }
        />

        <Route
          path="/demo/chemi"
          element={
            <DemoWrapper>
              <PlayChemiAnalysisPage />
            </DemoWrapper>
          }
        />
        <Route
          path="/demo/some"
          element={
            <DemoWrapper>
              <PlaySomeAnalysisPage />
            </DemoWrapper>
          }
        />
        <Route
          path="/demo/mbti"
          element={
            <DemoWrapper>
              <PlayMbtiAnalysisPage />
            </DemoWrapper>
          }
        />
        {/** ---------------------------------------------------------------------------------- */}

        {/** 원래 보호 라우트들은 그대로 유지 */}
        <Route element={<RequireAuth />}>
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

          <Route
            path="/business/contr/:resultId"
            element={<BusinessContrAnalysisPage />}
          />
          <Route path="/business/mypage" element={<BusinessMyPage />} />
          <Route path="/credit" element={<CreditsPage />} />
          <Route path="/result/:analysisId" element={<ResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
