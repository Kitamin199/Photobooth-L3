import PageShutter from './components/PageShutter';
import Navbar from './components/Navbar';

export default function App({ page = 'home', children }) {
  return (
    <>
      <a href="#main-content" className="sr-only fixed top-3 left-3 z-50 rounded-xl bg-white p-3 font-bold focus:not-sr-only">
        Lewati ke konten
      </a>
      <PageShutter page={page} />
      <Navbar page={page} />
      {children}
    </>
  );
}
