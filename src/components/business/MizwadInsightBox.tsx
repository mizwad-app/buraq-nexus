export const MizwadInsightBox = ({ text }: { text: string }) => (
  <div className="mt-2 bg-amber-500/[0.08] border-l-2 border-amber-500 rounded-r-md py-2 px-2.5">
    <p className="text-[11px] italic text-amber-300 leading-snug">
      <span className="font-semibold">✦ Mizwad: </span>
      {text}
    </p>
  </div>
);
