import { ArrowRight, Check, ExternalLink, PlayCircle } from 'lucide-react'

import { JUDGE_GUIDE_STEPS } from './guideContent'

export default function SignJudgeGuide({ completedCount }: { completedCount: number }) {
  const activeIndex = Math.min(completedCount, JUDGE_GUIDE_STEPS.length - 1)
  const currentStep = JUDGE_GUIDE_STEPS[activeIndex]
  const guideComplete = completedCount >= JUDGE_GUIDE_STEPS.length

  return (
    <section className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-teal-100">심사 체험 가이드</p>
            <p className="text-sm font-bold">두 동작을 차례로 따라 해주세요</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
            {guideComplete ? '촬영 완료' : `${activeIndex + 1} / ${JUDGE_GUIDE_STEPS.length}`}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <div className="mb-3 flex items-center gap-2" aria-label="가이드 문장: 머리가 아파요">
          {JUDGE_GUIDE_STEPS.map((step, index) => {
            const completed = completedCount > index
            const active = !guideComplete && activeIndex === index
            return (
              <div key={step.modelLabel} className="contents">
                <div
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 ${
                    completed
                      ? 'border-teal-200 bg-teal-50 text-teal-800'
                      : active
                        ? 'border-teal-500 bg-white text-teal-900 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      completed || active ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {completed ? <Check size={12} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="truncate text-xs font-bold">{step.displayLabel}</span>
                </div>
                {index < JUDGE_GUIDE_STEPS.length - 1 && <ArrowRight size={14} className="shrink-0 text-slate-300" />}
              </div>
            )
          })}
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
          {currentStep.videoSrc ? (
            <video
              key={currentStep.videoSrc}
              src={currentStep.videoSrc}
              aria-label={`${currentStep.displayLabel} 수어 가이드 영상`}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center text-slate-300">
              <PlayCircle size={30} strokeWidth={1.5} />
              <p className="text-xs leading-relaxed">
                {currentStep.displayLabel} 가이드 영상을 준비 중입니다.
                <br />
                로컬 영상 파일을 확인해주세요.
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {guideComplete ? '이제 답변을 확인해주세요.' : `‘${currentStep.displayLabel}’를 한 번 표현해주세요.`}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
              {guideComplete
                ? '인식된 두 단어가 맞으면 답변 완료하기를 눌러주세요.'
                : '촬영 버튼을 누르면 3초 후 자동으로 분석합니다.'}
            </p>
          </div>
          {!guideComplete && (
            <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-700">
              목표: {currentStep.modelLabel}
            </span>
          )}
        </div>

        <p className="mt-3 border-t border-slate-100 pt-2 text-[9px] leading-relaxed text-slate-400">
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
      </div>
    </section>
  )
}
