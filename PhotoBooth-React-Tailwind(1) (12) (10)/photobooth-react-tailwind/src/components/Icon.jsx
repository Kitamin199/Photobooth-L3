const paths = {
  camera: <><path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" /><circle cx="12" cy="13" r="4" /></>,
  filter: <><path d="M4 7h16M4 17h16" /><circle cx="8" cy="7" r="3" /><circle cx="16" cy="17" r="3" /></>,
  sticker: <path d="M14 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9zM14 21v-5a2 2 0 0 1 2-2h5" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
  flash: <path d="m13 2-9 12h7l-1 8 10-12h-7z" />,
  mirror: <path d="M12 3v18M3 7l5 5-5 5zM21 7l-5 5 5 5z" />,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M5 15v5h14v-5" /></>,
};

export default function Icon({ name, className = 'size-[22px]' }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.camera}
    </svg>
  );
}
