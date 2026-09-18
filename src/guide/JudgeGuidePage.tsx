import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Hand,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react'
import PhoneScreen from '../components/PhoneScreen'
import TalkDacLogo from '../components/TalkDacLogo'
import { JUDGE_GUIDE_STEPS } from './guideContent'
import { getSignDisplayLabel, SUPPORTED_SIGN_LABELS } from './signLabels'

export default function JudgeGuidePage() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const step = JUDGE_GUIDE_STEPS[activeIndex]

  return (
    <PhoneScreen>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/ready')}
          aria-label="준비 화면으로 돌아가기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
        >
          <ChevronLeft size={19} />
        </button>
        <TalkDacLogo size="sm" />
        <div className="h-8 w-8" aria-hidden="true" />
      </div>

      <main className="flex-1 overflow-y-auto pb-3">
        <div className="mb-4 text-center">
          <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
            원티드 해커톤 심사 체험
          </span>
          <h1 className="mt-2 text-xl font-bold leading-snug text-slate-900">수어 답변을 이렇게 체험해 주세요</h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            약 2분 동안 질문부터 답변 전달까지 핵심 기능을 직접 확인할 수 있어요.
          </p>
        </div>

        <section className="mb-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-teal-600" />
            <p className="text-xs font-bold text-teal-800">이번 체험에서 확인할 기능</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ['1', '의료진 질문을\n음성으로 변환'],
              ['2', '수어 두 단어를\n카메라로 인식'],
              ['3', '환자 확인 후\n의료진에게 전달'],
            ].map(([number, label]) => (
              <div key={number} className="rounded-xl bg-white px-2 py-3 shadow-sm">
                <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                  {number}
                </span>
                <p className="mt-1.5 whitespace-pre-line text-[10px] font-semibold leading-relaxed text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-700">체험 전 확인해 주세요</p>
          <div className="mt-2.5 space-y-2">
            {[
              [Camera, '카메라와 마이크 권한을 허용해 주세요.'],
              [Hand, '머리부터 허벅지 위와 양손이 모두 보이게 앉아주세요.'],
              [ShieldCheck, '회원가입 없이 체험하며, 종료한 세션 데이터는 삭제돼요.'],
            ].map(([Icon, text]) => {
              const GuideIcon = Icon as typeof Camera
              return (
                <div key={text as string} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <GuideIcon size={14} className="shrink-0 text-teal-600" />
                  <span>{text as string}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-teal-50 p-4">
          <p className="text-[11px] font-semibold text-teal-600">의료진의 질문</p>
          <p className="mt-0.5 text-base font-bold text-slate-900">“어디가 아파서 오셨어요?”</p>
          <div className="my-3 h-px bg-teal-100" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2" aria-label="머리 다음 아파요">
              <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-teal-800">머리</span>
              <ArrowRight size={13} className="text-teal-300" />
              <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-teal-800">아파요</span>
            </div>
            <span className="shrink-0 text-sm font-bold text-teal-900">머리가 아파요.</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex gap-2 border-b border-slate-100 p-3">
            {JUDGE_GUIDE_STEPS.map((item, index) => (
              <button
                key={item.modelLabel}
                onClick={() => setActiveIndex(index)}
                aria-pressed={activeIndex === index}
                className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeIndex === index ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-500'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    activeIndex === index ? 'bg-white text-teal-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-xs font-bold">{item.displayLabel}</span>
              </button>
            ))}
          </div>

          <div className="p-3.5">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
              {step.videoSrc ? (
                <video
                  key={step.videoSrc}
                  src={step.videoSrc}
                  aria-label={`${step.displayLabel} 수어 가이드 영상`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-300">
                  <Hand size={30} strokeWidth={1.5} />
                  <p className="text-xs">{step.displayLabel} 가이드 영상을 준비 중입니다.</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeIndex + 1}. ‘{step.displayLabel}’ 동작을 확인하세요
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                  실제 촬영에서는 동작 시작과 끝까지 화면 안에 보여주세요.
                </p>
              </div>
              <button
                onClick={() => setActiveIndex(activeIndex === 0 ? 1 : 0)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"
              >
                {activeIndex === 0 ? <ChevronRight size={12} /> : <RotateCcw size={12} />}
                {activeIndex === 0 ? '다음 동작' : '다시 보기'}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-bold text-slate-700">심사 체험 순서</p>
          <ol className="space-y-2.5">
            {[
              ['의료진 질문 입력', '마이크 버튼을 누르고 “어디가 아파서 오셨어요?”라고 말한 뒤 종료 버튼을 눌러요.'],
              ['답변 방법 선택', '변환된 질문을 확인한 뒤 ‘수어로 답변하기’를 선택해요.'],
              ['‘머리’ 촬영', '영상을 참고해 동작을 준비해요. 버튼을 누르면 3초 후 3초 동안 촬영해요.'],
              ['‘아파요’ 촬영', '첫 단어가 추가되면 같은 방법으로 두 번째 단어를 촬영해요.'],
              ['답변 확인·전달', '“머리가 아파요.”로 변환됐는지 확인하고 의료진에게 전달해요.'],
            ].map(([title, body], index) => (
              <li key={title} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{title}</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[11px] text-teal-700">
            <Timer size={14} className="shrink-0" />
            각 단어는 3초 준비 후 3초간 자동 촬영되므로 종료 버튼을 누르지 않아도 됩니다.
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-700">평가할 때 봐주세요</p>
          <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-slate-500">
            <li className="flex gap-2">
              <Check size={13} className="mt-0.5 shrink-0 text-teal-600" />
              두 개의 수어 단어가 하나의 자연스러운 답변 문장으로 구성되는지
            </li>
            <li className="flex gap-2">
              <Check size={13} className="mt-0.5 shrink-0 text-teal-600" />
              환자가 인식 결과를 확인하거나 텍스트로 수정할 수 있는지
            </li>
            <li className="flex gap-2">
              <Check size={13} className="mt-0.5 shrink-0 text-teal-600" />
              환자가 확정한 답변만 의료진에게 전달되는지
            </li>
          </ul>
        </section>

        <details className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            현재 지원하는 수어 15개 보기
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUPPORTED_SIGN_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800"
              >
                {getSignDisplayLabel(label)}
              </span>
            ))}
          </div>
        </details>

        <details className="mt-3 rounded-2xl border border-slate-100 bg-white p-4">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            인식이 다르게 나왔을 때
          </summary>
          <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-500">
            <p>• 상반신과 양손이 모두 화면 안에 들어왔는지 확인해 주세요.</p>
            <p>• 가이드 영상처럼 동작의 시작과 끝을 한 번만 표현해 주세요.</p>
            <p>• 다시 촬영하거나 ‘답변 수정하기’에서 텍스트로 고칠 수 있어요.</p>
          </div>
        </details>

        <p className="mt-4 text-center text-[9px] leading-relaxed text-slate-400">
          영상 출처:{' '}
          <a
            href="https://sldict.korean.go.kr/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline underline-offset-2"
          >
            국립국어원 한국수어사전 <ExternalLink size={8} />
          </a>{' '}
          ·{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-nd/2.0/kr/deed.ko"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            CC BY-NC-ND 2.0 KR
          </a>
        </p>
      </main>

      <button
        onClick={() => navigate('/conversation?mode=judge')}
        className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 py-4 font-semibold text-white shadow-lg shadow-teal-700/25"
      >
        <Check size={17} />
        가이드대로 체험 시작하기
      </button>
    </PhoneScreen>
  )
}
