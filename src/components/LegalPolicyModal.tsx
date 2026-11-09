import React, { useState } from 'react';
import { X, Shield, FileText, Info, Mail, ExternalLink, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export type PolicyTab = 'PRIVACY' | 'TERMS' | 'ABOUT' | 'CONTACT';

interface LegalPolicyModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  initialTab = 'PRIVACY',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0288d1] flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                이용약관 및 정책 센터
              </h3>
              <p className="text-xs text-slate-500">
                Google AdSense 및 관련 법령에 따른 서비스 정책 안내
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-3 pt-2 gap-1 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => {
              sounds.playKey();
              setActiveTab('PRIVACY');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'PRIVACY'
                ? 'border-[#0288d1] text-[#0288d1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>개인정보처리방침</span>
          </button>

          <button
            onClick={() => {
              sounds.playKey();
              setActiveTab('TERMS');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'TERMS'
                ? 'border-[#0288d1] text-[#0288d1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>서비스 이용약관</span>
          </button>

          <button
            onClick={() => {
              sounds.playKey();
              setActiveTab('ABOUT');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'ABOUT'
                ? 'border-[#0288d1] text-[#0288d1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>서비스 소개</span>
          </button>

          <button
            onClick={() => {
              sounds.playKey();
              setActiveTab('CONTACT');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'CONTACT'
                ? 'border-[#0288d1] text-[#0288d1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>문의 및 지원</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'PRIVACY' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900">
                <strong>개인정보처리방침 공지:</strong> 본 서비스(지식 탐구 낱말퍼즐)는 이용자의 프라이버시를 존중하며, Google AdSense 프로그램 정책 및 관련 개인정보 보호 법규를 준수합니다.
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">1. 수집하는 개인정보 항목 및 수집 방법</h4>
                <p className="text-slate-600">
                  본 웹 애플리케이션은 회원가입 절차 없이 누구나 자유롭게 이용할 수 있는 웹 기반 낱말퍼즐 서비스입니다.
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li><strong>로컬 저장소(LocalStorage) 정보:</strong> 사용자의 게임 진행도(도달 레벨, 클리어한 퍼즐 기록, 힌트 잔여 개수, 음소거 설정, 선택한 테마)는 서버에 저장되지 않고 이용자의 기기 브라우저 로컬 저장소에만 보관됩니다.</li>
                  <li><strong>자동 수집 정보:</strong> 서비스 안정성 및 분석, 광고 전송을 위해 접속 IP 주소, 브라우저 종류, 방문 일시, 기기 정보가 Google 애널리틱스 및 광고 네트워크를 통해 자동 수집될 수 있습니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">2. Google AdSense 및 제3자 쿠키(Cookie) 관련 안내</h4>
                <p className="text-slate-600">
                  본 사이트는 서비스 운영 및 무료 콘텐츠 제공을 위해 Google 및 공인된 제3자 광고 사업자(Google AdSense)의 광고를 게재합니다.
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li>Google을 포함한 제3자 공급업체는 이용자가 본 웹사이트 또는 다른 웹사이트를 과거에 방문한 기록을 바탕으로 쿠키를 사용하여 맞춤형 광고를 게재합니다.</li>
                  <li>Google의 광고 쿠키 사용을 통해 Google 및 파트너사는 이용자의 본 사이트 및 인터넷 상의 다른 사이트 방문 기록을 바탕으로 관련성 높은 광고를 제공할 수 있습니다.</li>
                  <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Google 광고 설정</a>을 방문하여 맞춤형 광고를 언제든지 선택 해제(Opt-out)할 수 있습니다.</li>
                  <li>또한 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">www.aboutads.info</a>를 방문하여 제3자 공급업체의 맞춤형 광고용 쿠키 사용을 전 세계적으로 차단할 수 있습니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">3. 쿠키 설정 및 거부 방법</h4>
                <p className="text-slate-600">
                  이용자는 브라우저 설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 다만 쿠키 저장을 거부할 경우 일부 게임 환경 설정이 저장되지 않을 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">4. 개인정보 보호책임자 및 문의처</h4>
                <p className="text-slate-600">
                  서비스 관련 문의, 개인정보 처리 관련 요청은 아래 담당자 이메일로 연락 주시면 신속하게 조치하겠습니다.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 text-xs">
                  <div>• 운영자: 지식 탐구 낱말퍼즐 팀 (honglabai)</div>
                  <div>• 이메일: <a href="mailto:honglabai@gmail.com" className="text-blue-600 font-bold">honglabai@gmail.com</a></div>
                  <div>• 시행일자: 2026년 11월 9일</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'TERMS' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">제1조 (목적)</h4>
                <p className="text-slate-600">
                  본 약관은 '지식 탐구 낱말퍼즐'(이하 '서비스')의 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">제2조 (서비스의 내용 및 제공)</h4>
                <p className="text-slate-600">
                  본 서비스는 8대 지식 영역(정치, 사회, 문화, 스포츠, 한국사, 세계사, 음악, 미술)에 걸친 2,480개의 어휘 기반 십자말풀이 퍼즐 및 학습 사전 콘텐츠를 무료로 제공합니다.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">제3조 (저작권 및 지적재산권)</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>서비스 내에 구현된 퍼즐 그리드 생성 알고리즘, 소스코드, 디자인, UI 구성요소의 저작권은 운영자에게 귀속됩니다.</li>
                  <li>공공 어휘 및 역사/상식 데이터는 공익적 교육 목적으로 재가공 및 힌트화되어 수록되었습니다.</li>
                  <li>이용자는 본 서비스의 콘텐츠를 무단 전재, 복제, 상업적으로 재배포할 수 없습니다.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">제4조 (면책 조항)</h4>
                <p className="text-slate-600">
                  운영자는 천재지변, 서버 점검, 통신 장애 등 불가항력으로 인해 서비스를 일시적으로 중단할 수 있으며, 이로 인한 손해에 대해 책임을 지지 않습니다. 또한 퍼즐 힌트 및 어휘 설명에 대한 최신성 유지를 위해 노력하나 이에 대한 완벽한 법적 무결성을 보증하지는 않습니다.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">제5조 (광고 게재)</h4>
                <p className="text-slate-600">
                  본 무료 서비스의 유지 및 서버 인프라 운영을 위하여 서비스 화면 내에 Google AdSense 등의 배너 광고가 게재될 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT US */}
          {activeTab === 'ABOUT' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-sky-100 text-[#0288d1] rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl">
                  🧩
                </div>
                <h4 className="font-black text-slate-900 text-base">
                  지식 탐구 가로세로 낱말퍼즐 소개
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Knowledge Exploration Korean Crossword Puzzle
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                '지식 탐구 낱말퍼즐'은 단순한 낱말 맞추기를 넘어, 대한민국 시민과 학습자가 다양한 지식 영역을 재미있게 탐험하며 어휘력과 상식을 키울 수 있도록 개발된 반응형 웹 애플리케이션입니다.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">🏛️ 8대 지식 영역</div>
                  <div className="text-slate-500 mt-0.5">정치, 사회, 문화, 스포츠, 한국사, 세계사, 음악, 미술</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">📚 2,480개 어휘</div>
                  <div className="text-slate-500 mt-0.5">각 영역당 310단어, 레벨당 31단어의 엄선된 어휘</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">🎯 240개 관문 보드</div>
                  <div className="text-slate-500 mt-0.5">레벨당 3판 연속 클리어 시 상위 레벨 잠금 해제</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">⚡ 모바일 최적화</div>
                  <div className="text-slate-500 mt-0.5">가상 한글 키패드, 저용량 WebP, 설치 없는 웹 앱</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                본 서비스는 언제 어디서나 남녀노소 누구나 무료로 지적 즐거움을 누릴 수 있도록 열린 교육 플랫폼을 지향합니다.
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900">
                <strong>고객 지원 및 오류/어휘 제보:</strong><br />
                낱말퍼즐 풀이 중 오탈자 발견, 힌트 개선 의견, 새로운 단어 건의사항, 제휴 및 저작권 문의는 언제든지 아래 이메일로 보내주세요.
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold">공식 문의 이메일</div>
                    <a href="mailto:honglabai@gmail.com" className="font-bold text-blue-600 hover:underline">
                      honglabai@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <ExternalLink className="w-5 h-5 text-slate-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-bold">오픈소스 및 프로젝트 저장소</div>
                    <a
                      href="https://github.com/honglabai/korean-crossword-puzzle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-700 hover:underline"
                    >
                      github.com/honglabai/korean-crossword-puzzle
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                접수된 건의사항은 정기 업데이트를 통해 신속하게 반영하겠습니다. 사용자 여러분의 소중한 피드백에 항상 감사드립니다.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google AdSense 준수 사이트</span>
          </div>
          <button
            onClick={() => {
              sounds.playKey();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-xs cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
