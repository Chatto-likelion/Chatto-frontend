// src/hooks/useQuizResultAnalysis.js
import { useState, useEffect } from "react";
// import { getQuizResultAnalysis } from "@/apis/api";

// --- 더미 데이터 ---
const dummyDetails = {
  relationship: "동아리 부원",
  situation: "일상대화",
  period: "처음부터",
};
const dummyStats = { averageScore: 70, questionCount: 10, participantCount: 7 };
const dummyAllQuestions = [
  {
    id: 1,
    title: "Q1 (가장 많이 맞춘 문제)",
    options: [
      { text: "정답 선택지 (95%)", percentage: 95 },
      { text: "오답 선택지 1", percentage: 3 },
      { text: "오답 선택지 2", percentage: 1 },
      { text: "오답 선택지 3", percentage: 1 },
    ],
  },
  {
    id: 2,
    title: "Q2 (가장 많이 틀린 문제)",
    options: [
      { text: "정답 선택지 (15%)", percentage: 15 },
      { text: "오답 선택지 1", percentage: 55 },
      { text: "오답 선택지 2", percentage: 20 },
      { text: "오답 선택지 3", percentage: 10 },
    ],
  },
  {
    id: 3,
    title: "Q3 (일반 질문)",
    options: [
      { text: "옵션 A", percentage: 60 },
      { text: "옵션 B", percentage: 20 },
      { text: "옵션 C", percentage: 15 },
      { text: "옵션 D", percentage: 5 },
    ],
  },
];
const dummyScores = {
  allScores: [
    { name: "보보", score: 90 },
    { name: "미미", score: 85 },
    { name: "모모", score: 70 },
  ],
  myScore: 70,
};
// -----------------

/*
// ▼▼▼ 백엔드 연동 시 사용할 실제 훅 ▼▼▼
export function useQuizResultAnalysis(analysisId) {
  const [details, setDetails] = useState({});
  const [stats, setStats] = useState({});
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getQuizResultAnalysis(analysisId);
        setDetails(result.details);
        setStats(result.stats);
        setScores(result.scores);

        const finalSections = [
          {
            sectionTitle: "가장 많이 맞춘 문제",
            questions: result.mostCorrectQuestion ? [result.mostCorrectQuestion] : [],
          },
          {
            sectionTitle: "가장 많이 틀린 문제",
            questions: result.mostIncorrectQuestion ? [result.mostIncorrectQuestion] : [],
          },
          {
            sectionTitle: "다른 문제들",
            questions: result.otherQuestions || [],
          },
        ].filter((section) => section.questions.length > 0);
        setSections(finalSections);
      } catch (err) {
        setError("퀴즈 분석 결과를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [analysisId]);

  return { details, stats, sections, scores, loading, error };
}
*/

// ▼▼▼ 현재 사용할 더미 데이터용 훅 ▼▼▼
export function useQuizResultAnalysis(analysisId) {
  const [details, setDetails] = useState({});
  const [stats, setStats] = useState({});
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processDummyData = () => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setDetails(dummyDetails);
        setStats(dummyStats);
        setScores(dummyScores);

        const mostCorrectQuestionId = 1;
        const mostIncorrectQuestionId = 2;
        const mostCorrectQuestion = dummyAllQuestions.find(
          (q) => q.id === mostCorrectQuestionId
        );
        const mostIncorrectQuestion = dummyAllQuestions.find(
          (q) => q.id === mostIncorrectQuestionId
        );
        const otherQuestions = dummyAllQuestions.filter(
          (q) =>
            q.id !== mostCorrectQuestionId && q.id !== mostIncorrectQuestionId
        );
        const finalSections = [
          {
            sectionTitle: "가장 많이 맞춘 문제",
            questions: mostCorrectQuestion ? [mostCorrectQuestion] : [],
          },
          {
            sectionTitle: "가장 많이 틀린 문제",
            questions: mostIncorrectQuestion ? [mostIncorrectQuestion] : [],
          },
          { sectionTitle: "다른 문제들", questions: otherQuestions },
        ].filter((section) => section.questions.length > 0);

        setSections(finalSections);
        setLoading(false);
      }, 1000);
    };
    processDummyData();
  }, [analysisId]);

  return { details, stats, sections, scores, loading, error };
}
