import { LAYOUTS, THEMES } from '../../lib/boothConfig';

function LayoutIcon({ layout }) {
  return (
    <span className={`grid size-[38px] shrink-0 gap-0.5 rounded-lg border-2 border-pink p-[3px] ${layout.id === '4cut' ? 'grid-cols-2 grid-rows-2' : layout.id === '2cut' ? 'grid-cols-1 grid-rows-2' : 'grid-cols-1 grid-rows-4'}`} aria-hidden="true">
      {Array.from({ length: layout.shots }, (_, index) => <span key={index} className="rounded-[2px] bg-[#f8b4d9]" />)}
    </span>
  );
}

export default function FrameSelector({ layoutId, themeId, onLayoutChange, onThemeChange, disabled }) {
  return (
    <aside className="rounded-[30px] border-2 border-[#f2ebd9] bg-white p-[22px] shadow-[0_10px_30px_#00000008]" aria-label="Pengaturan photostrip">
      <fieldset disabled={disabled}>
        <legend className="mb-3.5 font-display text-base font-bold tracking-wider text-pink">PILIH LAYOUT</legend>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
          {LAYOUTS.map((layout) => (
            <button key={layout.id} type="button" onClick={() => onLayoutChange(layout.id)} aria-pressed={layoutId === layout.id} className={`flex items-center gap-3.5 rounded-[18px] border-2 px-4 py-3 text-left transition-all enabled:hover:translate-x-1 disabled:opacity-50 ${layoutId === layout.id ? 'border-pink bg-pink-soft shadow-[0_4px_12px_#fb71a41a]' : 'border-line bg-[#fcf9f2] hover:border-pink'}`}>
              <LayoutIcon layout={layout} />
              <span className="flex flex-col gap-1"><span className="text-sm font-extrabold text-plum">{layout.name}</span><span className="text-[10px] font-semibold text-[#888]">{layout.description}</span></span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled} className="mt-[22px]">
        <legend className="mb-3.5 font-display text-base font-bold tracking-wider text-pink">WARNA FRAME</legend>
        <div className="grid max-w-[360px] grid-cols-3 gap-2.5">
          {THEMES.map((theme) => (
            <button key={theme.id} type="button" onClick={() => onThemeChange(theme.id)} aria-label={`Warna frame ${theme.name}`} aria-pressed={themeId === theme.id} style={{ backgroundColor: theme.bg }} className={`flex flex-col gap-1.5 rounded-xl border-2 p-2 transition-all disabled:opacity-50 ${themeId === theme.id ? '-translate-y-0.5 border-pink shadow-[3px_3px_0_#fb71a4]' : 'border-[#ddd6c5] hover:border-pink'}`}>
              <span className="h-6 w-full rounded-[5px] bg-[#e8e3d8]" aria-hidden="true" />
              <span className="h-6 w-full rounded-[5px] bg-[#e8e3d8]" aria-hidden="true" />
              <span className="mt-0.5 w-full text-center text-[10px] font-extrabold text-plum">{theme.name}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
