import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalysisDetail_Bus } from "@/apis/api"; // 실제 API 호출 함수

export default function BusinessContrAnalysisPage() {
  const { resultId } = useParams(); // URL 파라미터 추출
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getAnalysisDetail_Bus(resultId); // API 호출
        setResultData(data);
      } catch (err) {
        setError(err.message || "결과를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) return <p>결과를 불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>업무 참여도 분석 결과 페이지</h1>
      <p>결과 ID: {resultId}</p>
      <p>content: {resultData.content}</p>
      <p>is_saved: {resultData.is_saved}</p>
      <p>project_type: {resultData.project_type}</p>
      <p>team_type: {resultData.team_type}</p>
      <p>analysis_date_start: {resultData.analysis_date_start}</p>
      <p>analysis_date_end: {resultData.analysis_date_end}</p>
      <p>analysis_date: {resultData.analysis_date}</p>
      <p>chat: {resultData.chat}</p>
    </div>
  );
}
