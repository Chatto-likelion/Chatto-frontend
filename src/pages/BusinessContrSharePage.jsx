import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getContrGuestDetail } from "@/apis/api"; // 실제 API 호출 함수
import { Header, SmallServices, DetailForm_Share } from "@/components";
import { useNavigate } from "react-router-dom";
import * as Icons from "@/assets/svg/index.js";

export default function BusinessContrSharePage() {
  const { uuid } = useParams(); // URL 파라미터 추출
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    people_num: 0,
    project_type: "",
    team_type: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const detail = await getContrGuestDetail(uuid);
        if (!alive) return;

        setResultData(detail);
        setForm({
          title: detail.result.title,
          people_num: detail.result.people_num,
          project_type: detail.result.project_type,
          team_type: detail.result.team_type,
          analysis_start: detail.result.analysis_date_start,
          analysis_end: detail.result.analysis_date_end,
        });
      } catch (err) {
        if (!alive) return;
        setError(err.message || "결과를 불러오지 못했습니다.");
      } finally {
        if (alive) {
          setLoading(false);
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

  return (
    <div className="flex flex-col justify-start items-center h-screen text-primary-dark bg-white">
      <Header />
      <div className="relative flex-1 w-[1352px] mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-primary-dark rounded-lg">
            <DetailForm_Share
              type={1} // 1=chemi, 2=some, 3=mbti
              value={form}
              isAnalysis={true}
            />
          </div>
        </div>

        {/* 가운데 */}
        <main className="overflow-y-auto max-h-240 scrollbar-hide pt-28 w-[722px] flex flex-col justify-start items-center">
          {/* 결과 출력 */}
          {loading && (
            <p className="mt-44 text-sm text-primary-dark">분석 중입니다...</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col gap-4 p-6 text-left">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-st1 text-primary-dark">
                    업무 참여도 분석
                  </span>
                  <span className="text-h2 text-primary-dark">82점</span>
                </div>
                <div className="flex flex-col text-st2 text-black gap-0.5 mt-1">
                  <p>분석된 메시지 수: 1,342개</p>
                  <p>참여자 수: 23명</p>
                  <p>분석 기간: 최근 6개월</p>
                </div>
              </div>
              <div className="text-st2 text-primary-dark italic mt-2">
                한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
              </div>
            </div>

            <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-primary rounded-lg text-body2 text-black whitespace-pre-line">
              <div>
                <h1>업무 참여도 분석 결과 페이지</h1>
                <p>결과 ID: {resultId}</p>
                <p>content: {resultData.result.content}</p>
                <p>is_saved: {resultData.result.is_saved}</p>
                <p>project_type: {resultData.result.project_type}</p>
                <p>team_type: {resultData.result.team_type}</p>
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
            <button
              onClick={() => navigate("/about/")}
              disabled={loading}
              className="w-50 h-8 hover:bg-primary hover:text-white cursor-pointer px-0.25 py-1 text-button border-2 border-primary rounded-lg"
            >
              나도 분석해보기
            </button>
          </div>
          <div className="w-full h-[170px] mt-2 p-3.75 pb-4.5 border border-primary-dark rounded-lg text-primary-dark">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}
