import { Info } from 'lucide-react'

// 여러 화면 하단에 반복해서 나오는 안내 박스입니다.
// "질문을 이해하기 어려우신가요?" 같은 도움말 카피를 받아서 보여주기만 하는 순수 표시용 컴포넌트입니다.
export default function HelpTipBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 flex items-start gap-2.5">
      <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{body}</p>
      </div>
    </div>
  )
}
