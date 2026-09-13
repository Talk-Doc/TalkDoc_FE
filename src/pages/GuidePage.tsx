import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Hand,
  Keyboard,
  ListChecks,
  Sun,
  User,
  CaseSensitive,
  CircleDashed,
  Trash2,
  Send,
} from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'

const FLOW_STEPS = [
  { icon: Mic, title: '의료진이 질문해요', body: '의료진이 마이크 버튼을 눌러 음성으로 질문하면, 화면에 텍스트로 표시돼요.' },
  { icon: Hand, title: '원하는 방법으로 답변해요', body: '수어, 텍스트, 선택지 중 편한 방법을 골라 답변할 수 있어요.' },
  { icon: Send, title: 'AI가 의료진에게 전달해요', body: 'AI가 답변을 자연스러운 문장으로 정리해서 의료진 화면에 전달해요.' },
]

const ANSWER_METHODS = [
  { icon: Hand, title: '수어로 답변하기', body: '카메라 앞에서 수어로 답변하면 AI가 인식해서 문장으로 바꿔줘요.' },
  { icon: Keyboard, title: '텍스트로 답변하기', body: '키보드로 직접 답변을 입력할 수 있어요.' },
  { icon: ListChecks, title: '선택지로 답변하기', body: '질문에 맞게 제공되는 보기 중 하나를 선택해서 빠르게 답변할 수 있어요.' },
]

const SIGN_TIPS = [
  { icon: Sun, label: '밝은 곳에서 촬영해주세요.' },
  { icon: Hand, label: '양손이 모두 보이게 해주세요.' },
  { icon: User, label: '상반신이 화면에 보이도록 해주세요.' },
]

const CONVENIENCE = [
  { icon: CaseSensitive, title: '글자 크게 보기', body: '화면 전체 글자 크기를 키워서 더 잘 보이게 해요.' },
  { icon: CircleDashed, title: '고대비 모드', body: '색 대비를 높여서 화면을 더 또렷하게 봐요.' },
]

// 랜딩/대기 화면의 "가이드 보기"를 누르면 오는 사용법 안내 화면입니다.
// 실제 대화 없이도 앱이 어떻게 동작하는지 미리 훑어볼 수 있게 해줍니다.
export default function GuidePage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="이전으로"
          className="w-7 h-7 -ml-1 flex items-center justify-center text-slate-400 rounded-full hover:bg-slate-50"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-bold text-slate-900">이용 가이드</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pb-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">TALKDAC은 이렇게 사용해요</p>
          <div className="flex flex-col gap-2">
            {FLOW_STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="rounded-2xl bg-teal-50 p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-teal-600 font-bold text-xs">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon size={14} className="text-teal-600 shrink-0" />
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">답변 방법 3가지</p>
          <div className="flex flex-col gap-2">
            {ANSWER_METHODS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">수어로 답변할 땐 이렇게 해주세요</p>
          <div className="grid grid-cols-3 gap-2">
            {SIGN_TIPS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-center"
              >
                <Icon size={16} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">더 편하게 이용하기</p>
          <div className="flex flex-col gap-2">
            {CONVENIENCE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 bg-teal-50 rounded-xl p-3">
          <Trash2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
            대화를 종료하면 질문, 답변, 수어 인식 결과가 모두 삭제돼요. 원본 영상은 저장되지 않아요.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/ready')}
        className="w-full shrink-0 flex items-center justify-center gap-1.5 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-700/25 mt-4"
      >
        대화 시작하러 가기
        <ChevronRight size={18} />
      </button>
    </PhoneScreen>
  )
}
