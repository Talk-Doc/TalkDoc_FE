const guideAssets = import.meta.glob('./*.webm', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const JUDGE_GUIDE_STEPS = [
  {
    displayLabel: '머리',
    modelLabel: '머리',
    videoSrc: guideAssets['./머리_수어.webm'],
  },
  {
    displayLabel: '아파요',
    modelLabel: '아프다',
    videoSrc: guideAssets['./아프다_수어.webm'],
  },
] as const
