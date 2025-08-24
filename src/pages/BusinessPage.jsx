import { ChattoBusiness } from "../assets/png/LandingIcon";
import { SearchMore } from "../assets/svg";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import * as Icons from "@/assets/svg/index.js";

export default function BusinessPage() {
  return (
    <div className="w-full flex justify-center min-h-screen bg-white">
      <Header />
      <div className="w-full max-w-252.75 px-4 py-66">
        <div className="flex mb-7 gap-2 text-primary-dark items-end">
          <div className="text-h6">Chatto Business</div>
          <div className="text-body2">
            참여도, 업무 기여도 등 다양한 분석 지표 제공
          </div>
        </div>
        <div className="grid grid-cols-3 gap-12">
          <ServiceCard
            title="업무 참여도 분석"
            description={
              <>
                구성원의 대화 참여율, <br />
                응답률을 분석합니다.
              </>
            }
            bgColor="bg-white"
            textColor="text-primary-dark"
            border="border border-2 border-primary-dark"
            icon={ChattoBusiness}
            navigateTo="/business/contr"
          />
          <ServiceCard
            title="소통 구조 분석"
            description={
              <>
                메신저 내용을 바탕으로 <br />
                팀의 소통 구조를 분석합니다.
              </>
            }
            bgColor="bg-white"
            textColor="text-primary-dark"
            border="border border-2 border-primary-dark"
            icon={ChattoBusiness}
            navigateTo="/more"
          />
          <ServiceCard
            bgColor="bg-primary-dark"
            textColor="text-gray-2"
            border="border border-2 border-gray-2"
            title="더 많은 분석"
            description="그 외 다양한 분석을 체험하세요"
            icon={SearchMore}
            navigateTo="/more"
          />
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}
