import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSomeGuestDetail } from "@/apis/api"; // 실제 API 호출 함수
import { Header, SmallServices, DetailForm_Share } from "@/components";
import { useNavigate } from "react-router-dom";
import * as Icons from "@/assets/svg/index.js";

export default function PlaySomeSharePage() {
  const { uuid } = useParams(); // URL 파라미터 추출
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    people_num: 0,
    is_quized: false,
    relationship: "",
    age: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quizLoading, setQuizLoading] = useState(true);
  const [quizAvailable, setQuizAvailable] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setQuizLoading(true);
    setQuizAvailable(false);

    (async () => {
      try {
        const detail = await getSomeGuestDetail(uuid);
        if (!alive) return;

        setResultData(detail);
        setForm({
          title: detail.result.title,
          people_num: detail.result.people_num,
          is_quized: detail.result.is_quized,
          relationship: detail.result.relationship,
          age: detail.result.age,
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });

        setQuizAvailable(form.is_quized);
      } catch (err) {
        if (!alive) return;
        setError(err.message || "결과를 불러오지 못했습니다.");
      } finally {
        if (alive) {
          setLoading(false);
          setQuizLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) return <p className="mt-44 text-sm">분석 중입니다...</p>;
  if (error) return <p className="mt-4 text-sm text-red-500">{error}</p>;
  if (!resultData) return null; // 방어: 혹시 모를 케이스

  const quizDisabled = loading || quizLoading || !quizAvailable;

  return (
    <div className="flex flex-col justify-start items-center h-screen text-white bg-primary-dark">
      <Header />
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={2} // 1=chemi, 2=some, 3=mbti
              value={form}
              isAnalysis={true}
            />
          </div>
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && <p className="mt-44 text-sm">분석 중입니다...</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col gap-4 p-6 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1">케미 분석기 결과</span>
                  <span className="text-h2">82점</span>
                </div>
                <div className="flex flex-col text-st2 gap-0.5 mt-1">
                  <p>분석된 메시지 수: 1,342개</p>
                  <p>참여자 수: 23명</p>
                  <p>분석 기간: 최근 6개월</p>
                </div>
              </div>
              <div className="text-st2 italic mt-2">
                한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
              </div>
            </div>

            <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-secondary-light rounded-lg text-body2 whitespace-pre-line">
              <div>
                <h1>케미 결과 페이지</h1>
                <p>결과 ID: {uuid}</p>
                <p>content: {resultData.result.content}</p>
                <p>is_saved: {resultData.result.is_saved}</p>
                <p>relationship: {resultData.result.relationship}</p>
                <p>situation: {resultData.result.situation}</p>
                <p>
                  analysis_date_start: {resultData.result.analysis_date_start}
                </p>
                <p>analysis_date_end: {resultData.result.analysis_date_end}</p>
                <p>created_at: {resultData.result.created_at}</p>
                <p>chat: {resultData.result.chat}</p>
              </div>
            </div>
          </div>
        </main>

        {/* 오른쪽 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-1.5">
          <div className="w-full flex justify-between items-center">
            {/* 퀴즈 버튼 with 비활성화 & 툴팁 */}
            <div className="relative group">
              <button
                onClick={() => navigate(`/play/quiz/${uuid}`)}
                disabled={quizDisabled}
                className={[
                  "w-20 h-8 cursor-pointer px-0.25 py-1 text-button border-2 rounded-lg transition-colors",
                  quizDisabled
                    ? "border-secondary/40 text-secondary/40 cursor-not-allowed"
                    : "border-secondary hover:bg-secondary hover:text-primary-dark",
                ].join(" ")}
              >
                퀴즈 풀기
              </button>
              {quizDisabled && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="whitespace-nowrap text-[10px] leading-none px-2 py-1 rounded bg-primary-dark/80 text-secondary-light border border-secondary-light/30 shadow-sm">
                    {quizLoading
                      ? "퀴즈 확인 중…"
                      : "해당 결과에 퀴즈가 없습니다."}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/about/")}
              disabled={loading}
              className="w-30 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border-2 border-secondary rounded-lg"
            >
              나도 분석해보기
            </button>
          </div>
          <div className="w-full h-[170px] mt-2 p-3.75 pb-4.5 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
