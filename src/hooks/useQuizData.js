import { useState, useEffect } from "react";

// 더미 데이터
const dummyQuestions = [
  {
    id: 1,
    title: "Q1 어쩌고 저쩌고",
    options: ["옵션1", "옵션2", "옵션3", "옵션4"],
  },
  {
    id: 2,
    title: "Q2 어쩌고 저쩌고",
    options: ["옵션A", "옵션B", "옵션C", "옵션D"],
  },
];
const dummyDetails = {
  title: "대화분석",
  relationship: "동아리 부원",
  situation: "일상대화",
};

export function useQuizData(analysisId) {
  const [questions, setQuestions] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setQuestions(JSON.parse(JSON.stringify(dummyQuestions)));
      setDetails(dummyDetails);
      setLoading(false);
    }, 500);
  }, [analysisId]);
  return { questions, setQuestions, details, loading, error };
}
