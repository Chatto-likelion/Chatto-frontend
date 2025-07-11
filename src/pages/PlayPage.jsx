import {
  Chemistry,
  Lovers,
  MBTI,
  Something,
  Statistics,
} from "../assets/png/PlayIcon";
import { SearchMore } from "../assets/svg";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import * as Icons from "../assets/svg/index.js";

export default function PlayPage() {
  return (
    <div className="w-full flex justify-center min-h-screen bg-primary-dark">
      <Header />
      <div className="w-full max-w-235.5 mx-4 py-40">
      <div className="flex mb-7 gap-2 text-primary-light items-end">
        <div className="text-h6">Chatto Play</div>
        <div className="text-body2">케미, 관계, 심리 그 밖의 재밌는 분석까지</div>
      </div>
      <div className="grid grid-cols-3 gap-10.5">
        <ServiceCard 
          title="케미 측정"
          description="우리 얼마나 잘맞을까?"
          icon={Chemistry}
          navigateTo="/play/chemi"
        />
        <ServiceCard 
          title="썸 판독기"
          description="우리는 어떤 관계? 썸?"
          icon={Something}
          navigateTo="/play/some"
        />
        <ServiceCard 
          title="MBTI 분석"
          description="이 대화에서 나타나는 성격은?"
          icon={MBTI}
          navigateTo="/play/mbti"
        />
        <ServiceCard 
          title="연인 유형 분석"
          description="우리 얼마나 잘맞을까?"
          icon={Lovers}
          navigateTo="/play/lovers"
        />
        <ServiceCard 
          title="재밌는 통계"
          description="MT 게임에 제격! 단톡방 통계"
          icon={Statistics}
          navigateTo="/play/stat"
        />
        <ServiceCard 
          bgColor="bg-primary-dark"
          textColor="text-gray-2"
          border="border border-2 border-gray-2"
          title="더 많은 분석"
          description="그 외 다양한 분석을 체험하세요"
          icon={SearchMore}
          navigateTo="/play/more"
        />
      </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
