import { useParams } from "react-router-dom";

export default function ResultPage() {
  const { analysisId } = useParams();

  return <div>Result Page</div>;
}
