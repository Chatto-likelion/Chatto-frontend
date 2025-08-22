// src/hooks/useQuizResult.js
import { useState, useEffect } from "react";
// import { getQuizResult } from "@/apis/api";

// --- 더미 데이터 ---
const dummyDetails = {
  relationship: "동아리 부원",
  situation: "일상대화",
  period: "처음부터",
};
const dummyStats = { averageScore: 70, questionCount: 10, participantCount: 7 };
// 👇 4지선다로 수정된 더미 데이터
const dummyQuizSections = [
  {
    sectionTitle: "대화 특징",
    questions: [
      {
        id: 1,
        title: "Q1 어쩌고 저쩌고",
        options: [
          "가나다라",
          "가나다라마바사아자차카타파하가나다라",
          "가나다라",
          "가나다라다다",
        ],
        correctOptionIndex: 1,
        userSelectedOptionIndex: 1,
      },
    ],
  },
  {
    sectionTitle: "가장 많이 틀린 문제",
    questions: [
      {
        id: 2,
        title: "Q2 어쩌고 저쩌고",
        options: ["가나다라", "가나다라", "가나다라", "가나다라"],
        correctOptionIndex: 0,
        userSelectedOptionIndex: 2,
      },
    ],
  },
];
const dummyScores = {
  allScores: [
    { name: "보보", score: 90 },
    { name: "미미", score: 85 },
    { name: "모모", score: 70 },
  ],
};
const dummyResultOwner = { name: "모모", score: 70 };
// -----------------

/*
// ▼▼▼ 백엔드 연동 시 사용할 실제 훅 ▼▼▼
export function useQuizResult(analysisId) {
  // ... state ...
  useEffect(() => {
    // const result = await getQuizResult(analysisId);
    // ...
  }, [analysisId]);
  return { details, stats, sections, scores, owner, loading, error };
}
*/

// ▼▼▼ 현재 사용할 더미 데이터용 훅 ▼▼▼
export function useQuizResult(analysisId) {
  const [details, setDetails] = useState({});
  const [stats, setStats] = useState({});
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState({ allScores: [] });
  const [owner, setOwner] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDetails(dummyDetails);
      setStats(dummyStats);
      setSections(dummyQuizSections);
      setScores(dummyScores);
      setOwner(dummyResultOwner);
      setLoading(false);
    }, 500);
  }, [analysisId]);

  return { details, stats, sections, scores, owner, loading, error };
}
