import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

type LocationOption = {
  id: string;
  title: string;
  subtitle: string;
  theme: 'movie' | 'park' | 'surprise' | 'custom';
};

const locationOptions: LocationOption[] = [
  {
    id: 'cine',
    title: 'Cine Drive-In',
    subtitle: 'literalmente pra assistir o mandaloriano e o Grogu',
    theme: 'movie'
  },
  {
    id: 'parque',
    title: 'Parque tranquilo',
    subtitle: 'Um parque muito daóra que 99% de certeza que você nao conhece aqui em bsb',
    theme: 'park'
  },
  {
    id: 'surpresa',
    title: 'SURPRESA!',
    subtitle: 'Aqui é caixa misteriosa e eu escolho onde vai ser!!',
    theme: 'surprise'
  },
  {
    id: 'outra',
    title: 'Algo que você queira',
    subtitle: 'outra coisia que voce queira',
    theme: 'custom'
  }
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomStarData = Array.from({ length: 22 }, (_, index) => ({
  left: `${5 + Math.random() * 90}%`,
  top: `${4 + Math.random() * 92}%`,
  size: `${Math.random() * 2 + 1}px`,
  opacity: `${0.3 + Math.random() * 0.7}`
}));

const randomSparkData = Array.from({ length: 12 }, (_, index) => ({
  left: `${6 + Math.random() * 88}%`,
  top: `${6 + Math.random() * 88}%`,
  delay: `${Math.random() * 3}s`
}));

import starGif from './easterEggImages/star.gif';
import lightsaberGif from './easterEggImages/lightsaber.gif';
import moonwalkGif from './easterEggImages/moonwalk.gif';
import magicGif from './easterEggImages/magic.gif';
import musicGif from './easterEggImages/music.gif';

const STORAGE_KEY = 'site-encontro-nao-count';

const easterEggImages = {
  star: starGif,
  lightsaber: lightsaberGif,
  moonwalk: moonwalkGif,
  magic: magicGif,
  music: musicGif
};

function App() {
  const [screen, setScreen] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ x: '60%', y: '68%' });
  const [showNoModal, setShowNoModal] = useState(false);
  const [noPopupShown, setNoPopupShown] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:30');
  const [location, setLocation] = useState('cine');
  const [customLocation, setCustomLocation] = useState('No que pensas?');
  const [audioActive, setAudioActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const moveCooldown = useRef(false);
  const audioRef = useRef<{
    context: AudioContext;
    gain: GainNode;
    osc: OscillatorNode;
    lfo: OscillatorNode;
  } | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    if (!Number.isNaN(parsed) && parsed > 0) {
      setNoCount(parsed);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.osc.stop();
        audioRef.current.lfo.stop();
        audioRef.current.context.close();
      }
    };
  }, []);

  const selectedLocation = useMemo(() => {
    if (location === 'outra') {
      return customLocation.trim() || 'algo especial';
    }
    const option = locationOptions.find((item) => item.id === location);
    return option?.title || 'um lugar especial';
  }, [location, customLocation]);

  const handleMusicToggle = () => {
    if (audioActive) {
      setAudioActive(false);
      if (audioRef.current) {
        audioRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, audioRef.current.context.currentTime + 0.35);
        window.setTimeout(() => audioRef.current?.context.close(), 400);
      }
      audioRef.current = null;
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 180;
    gain.gain.value = 0.005;
    lfo.frequency.value = 0.09;
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    lfo.start();

    audioRef.current = { context, gain, osc, lfo };
    setAudioActive(true);
  };

  const handleNoMove = () => {
    if (moveCooldown.current) return;
    moveCooldown.current = true;
    setNoCount((current) => {
      const nextCount = current + 1;
      window.localStorage.setItem(STORAGE_KEY, nextCount.toString());
      if (nextCount >= 4 && !noPopupShown) {
        setShowNoModal(true);
        setNoPopupShown(true);
      }
      return nextCount;
    });

    const container = containerRef.current;
    const noButton = buttonRef.current;
    const yesButton = yesButtonRef.current;

    if (!container || !noButton) {
      setNoPos({
        x: `${clamp(Math.random() * 90 + 5, 5, 95)}%`,
        y: `${clamp(Math.random() * 90 + 5, 5, 95)}%`
      });
      window.setTimeout(() => {
        moveCooldown.current = false;
      }, 180);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const noRect = noButton.getBoundingClientRect();
    const yesRect = yesButton?.getBoundingClientRect();

    const padding = 18;
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(containerRect.width - noRect.width - padding, minX);
    const maxY = Math.max(containerRect.height - noRect.height - padding, minY);

    const yesBounds = yesRect
      ? {
          left: yesRect.left - containerRect.left,
          top: yesRect.top - containerRect.top,
          right: yesRect.right - containerRect.left,
          bottom: yesRect.bottom - containerRect.top
        }
      : null;

    const intersectsYes = (x: number, y: number) => {
      if (!yesBounds) return false;
      const candidate = {
        left: x,
        top: y,
        right: x + noRect.width,
        bottom: y + noRect.height
      };
      return !(
        candidate.right < yesBounds.left ||
        candidate.left > yesBounds.right ||
        candidate.bottom < yesBounds.top ||
        candidate.top > yesBounds.bottom
      );
    };

    let nextLeft = minX;
    let nextTop = minY;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      nextLeft = minX + Math.random() * (maxX - minX);
      nextTop = minY + Math.random() * (maxY - minY);
      if (!intersectsYes(nextLeft, nextTop)) {
        break;
      }
    }

    setNoPos({
      x: `${Math.round((nextLeft / containerRect.width) * 100)}%`,
      y: `${Math.round((nextTop / containerRect.height) * 100)}%`
    });
    window.setTimeout(() => {
      moveCooldown.current = false;
    }, 180);
  };

  const handleYesClick = () => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setScreen(2);
      setIsTransitioning(false);
    }, 1200);
  };

  const restart = () => {
    setScreen(1);
    setNoCount(0);
    setShowNoModal(false);
    setNoPopupShown(false);
    window.localStorage.removeItem(STORAGE_KEY);
    setDate('');
    setTime('20:30');
    setLocation('cine');
    setCustomLocation('um passeio sem pressa');
    setAudioActive(false);
    if (audioRef.current) {
      audioRef.current.osc.stop();
      audioRef.current.lfo.stop();
      audioRef.current.context.close();
      audioRef.current = null;
    }
    setNoPos({ x: '60%', y: '68%' });
  };

  const screenMotion = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-space text-white">
      <div className="pointer-events-none absolute inset-0 bg-space-gradient opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,179,255,0.16),_transparent_25%)]" />

      {randomStarData.map((star, index) => (
        <span
          key={`star-${index}`}
          className="absolute rounded-full bg-white/80 blur-[0.5px]"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, opacity: star.opacity }}
        />
      ))}

      {randomSparkData.map((spark, index) => (
        <span
          key={`spark-${index}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-gradient-to-r from-magenta-400 to-cyan-300 opacity-90 blur-sm"
          style={{ left: spark.left, top: spark.top, animation: `pulseGlow 4s ${spark.delay} ease-in-out infinite` }}
        />
      ))}

      <div className="absolute right-6 top-6 z-20 flex items-center gap-3 text-xs text-slate-300 sm:right-8 sm:text-sm">
        <button
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-gold/40 hover:bg-gold/10"
          onClick={restart}
        >
          reiniciar experiência
        </button>
        <button
          className={`rounded-full border px-4 py-2 transition ${audioActive ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/15 bg-white/5'} hover:bg-white/10`}
          onClick={handleMusicToggle}
        >
          {audioActive ? 'música ligada' : 'música off'}
        </button>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          {screen === 1 && (
            <motion.section
              key="screen-1"
              {...screenMotion}
              className="relative flex flex-col items-center justify-center gap-8 rounded-[32px] border border-white/10 bg-slate-950/60 px-6 py-16 shadow-glow backdrop-blur-xl sm:px-10"
              ref={containerRef}
              onMouseMove={(event) => {
                if (screen !== 1 || showNoModal) return;
                if (!buttonRef.current || !containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const btnRect = buttonRef.current.getBoundingClientRect();
                const mx = event.clientX - rect.left;
                const my = event.clientY - rect.top;
                const bx = btnRect.left - rect.left + btnRect.width / 2;
                const by = btnRect.top - rect.top + btnRect.height / 2;
                const dist = Math.hypot(mx - bx, my - by);
                if (dist < 120) {
                  handleNoMove();
                }
              }}
            >
              <div className="absolute left-6 top-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200/70 sm:left-10">
                <span className="block h-0.5 w-8 bg-cyan-300/70" />
                convite interestelar
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="max-w-3xl text-[clamp(2.75rem,5vw,5.5rem)] leading-[0.95] text-white drop-shadow-[0_0_20px_rgba(128,216,255,0.32)]">
                  Você aceita sair comigo??
                </h1>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleYesClick}
                ref={yesButtonRef}
                className="glow-btn z-10 min-w-[150px] px-8 py-4 text-lg bg-gradient-to-r from-cyan-400/20 to-blue-400/10 text-white"
              >
                SIM
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                animate={{ left: noPos.x, top: noPos.y }}
                transition={{ type: 'spring', stiffness: 140, damping: 16 }}
                ref={buttonRef}
                onClick={handleNoMove}
                className="glow-btn absolute z-20 min-w-[140px] px-8 py-4 text-lg bg-slate-900/90 text-slate-100 shadow-[0_0_45px_rgba(224,100,255,0.16)] hover:bg-slate-800/95"
                style={{ left: noPos.x, top: noPos.y }}
              >
                NÃO
              </motion.button>

              <div className="pointer-events-none absolute right-6 top-24 hidden h-28 w-1 bg-gradient-to-b from-fuchsia-400 to-transparent blur-sm sm:block" />
              <div className="pointer-events-none absolute left-10 bottom-24 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl" />
              <div className="pointer-events-none absolute right-1/3 bottom-10 h-16 w-16 rounded-full bg-violet-500/10 blur-2xl" />
              {easterEggImages.star && (
                <img
                  src={easterEggImages.star}
                  alt="estrela interestelar"
                  className="pointer-events-none absolute left-8 top-16 h-20 w-20 animate-pulse opacity-90"
                />
              )}
              {easterEggImages.lightsaber && (
                <img
                  src={easterEggImages.lightsaber}
                  alt="sabre de luz"
                  className="pointer-events-none absolute right-8 top-16 h-20 w-12 opacity-90"
                />
              )}
              {easterEggImages.moonwalk && (
                <img
                  src={easterEggImages.moonwalk}
                  alt="moonwalk"
                  className="pointer-events-none absolute left-4 bottom-32 h-16 w-16 opacity-90"
                />
              )}
              {easterEggImages.magic && (
                <img
                  src={easterEggImages.magic}
                  alt="magia"
                  className="pointer-events-none absolute right-14 bottom-32 h-14 w-14 opacity-90"
                />
              )}
              {easterEggImages.music && (
                <img
                  src={easterEggImages.music}
                  alt="nota musical neon"
                  className="pointer-events-none absolute left-1/2 top-10 h-12 w-12 -translate-x-1/2 opacity-90"
                />
              )}
            </motion.section>
          )}

          {screen === 2 && (
            <motion.section key="screen-2" {...screenMotion} className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[32px] border border-white/10 bg-slate-950/70 px-8 py-16 shadow-glow backdrop-blur-xl sm:px-10">
              <div className="space-y-3 text-center">
                <h2 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">NO WAY</h2>
                <p className="text-3xl font-medium text-slate-100">NO WAY, SÉRIO???</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
                  <label className="mb-3 block text-sm uppercase tracking-[0.25em] text-cyan-200/70">data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-3xl border border-white/15 bg-slate-900/90 px-4 py-4 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
                  <label className="mb-3 block text-sm uppercase tracking-[0.25em] text-cyan-200/70">horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded-3xl border border-white/15 bg-slate-900/90 px-4 py-4 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <button
                  onClick={() => setScreen(3)}
                  className="glow-btn min-w-[170px] bg-gradient-to-r from-cyan-400/20 to-blue-400/10 text-white"
                >
                  continuar
                </button>
              </div>
            </motion.section>
          )}

          {screen === 3 && (
            <motion.section key="screen-3" {...screenMotion} className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[32px] border border-white/10 bg-slate-950/70 px-6 py-12 shadow-glow backdrop-blur-xl sm:px-10">
              <div className="space-y-4 text-center">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">certo certo, agora o mais importante</p>
                <h2 className="text-4xl font-semibold text-white sm:text-5xl">pra onde você quer ir???</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {locationOptions.map((option) => {
                  const selected = location === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setLocation(option.id)}
                      className={`group relative flex min-h-[180px] flex-col justify-between rounded-[28px] border p-6 text-left transition ${
                        selected ? 'border-cyan-300/80 bg-cyan-300/10' : 'border-white/10 bg-white/5 hover:border-cyan-300/30 hover:bg-cyan-300/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">{option.theme === 'custom' ? 'choice' : option.title}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-200">
                          {option.theme}
                        </span>
                      </div>
                      <div className="mt-6 space-y-4">
                        <h3 className="text-2xl font-semibold text-white">{option.title}</h3>
                        <p className="text-sm leading-6 text-slate-300">{option.subtitle}</p>
                      </div>
                      <div
                        className={`pointer-events-none absolute right-6 top-6 h-12 w-12 rounded-full ${
                          option.theme === 'space'
                            ? 'bg-gradient-to-br from-cyan-300/20 to-blue-500/15'
                            : option.theme === 'park'
                            ? 'bg-emerald-400/10'
                            : option.theme === 'surprise'
                            ? 'bg-fuchsia-400/15'
                            : 'bg-violet-300/10'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {location === 'outra' && (
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
                  <label className="mb-3 block text-sm uppercase tracking-[0.25em] text-cyan-200/70">escreva livremente</label>
                  <textarea
                    value={customLocation}
                    onChange={(event) => setCustomLocation(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-3xl border border-white/15 bg-slate-900/90 px-4 py-4 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setScreen(4)}
                  className="glow-btn min-w-[170px] bg-gradient-to-r from-fuchsia-400/20 to-violet-500/10 text-white"
                >
                  continuar
                </button>
              </div>
            </motion.section>
          )}

          {screen === 4 && (
            <motion.section key="screen-4" {...screenMotion} className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[32px] border border-white/10 bg-slate-950/70 px-8 py-16 shadow-glow backdrop-blur-xl sm:px-10">
              <div className="space-y-3 text-center">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">resumo</p>
                <h2 className="text-4xl font-semibold text-white">você tem certeza disso?</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">data</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{date || 'não escolhida'}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">horário</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{time}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">local</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{selectedLocation}</p>
                </div>
              </div>
              <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => setScreen(5)}
                  className="glow-btn bg-gradient-to-r from-cyan-400/20 to-blue-400/10 text-white"
                >
                  sim
                </button>
                <button
                  onClick={() => setScreen(5)}
                  className="glow-btn bg-gradient-to-r from-fuchsia-400/20 to-violet-500/10 text-white"
                >
                  com certeza
                </button>
              </div>
            </motion.section>
          )}

          {screen === 5 && (
            <motion.section key="screen-5" {...screenMotion} className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-white/10 bg-slate-950/80 px-8 py-16 shadow-glow backdrop-blur-xl sm:px-10">
              <div className="space-y-3 text-center">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">final</p>
                <h2 className="text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">nos encontramos lá então</h2>
                <p className="text-lg text-slate-300">eu te busco na sua ksa</p>
              </div>
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-950/80 px-8 py-10 shadow-glow">
                <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="absolute right-8 top-20 h-24 w-24 rounded-full bg-fuchsia-400/10 blur-2xl" />
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">local</p>
                    <p className="mt-4 text-2xl font-semibold text-white">{selectedLocation}</p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">data</p>
                    <p className="mt-4 text-2xl font-semibold text-white">{date || 'escolha livre'}</p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">horário</p>
                    <p className="mt-4 text-2xl font-semibold text-white">{time}</p>
                  </div>
                </div>
                <div className="mt-10 flex items-center justify-center gap-3 text-slate-300">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-200">✓</span>
                  <span className="text-sm">check nada funcional apenas para cobrir espaço.</span>
                </div>
              </div>
              <p className="max-w-3xl text-center text-sm leading-6 text-slate-400">
                OBS: pfv me manda print disso aqui pq eu n fiz um sistema pra salvar resultado em banco e ia levar mtt tempo pra fazer isso akskksak.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {showNoModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/90 p-6"
          >
            <div className="max-w-lg rounded-[30px] border border-cyan-300/20 bg-slate-950/95 p-8 text-center shadow-glow">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">calma aí</p>
              <h3 className="mt-4 text-4xl font-semibold text-white">desiste cara</h3>
              <p className="mt-2 text-xl text-slate-200">aqui n damos opções kaskskaska</p>
              <button
                onClick={() => setShowNoModal(false)}
                className="mt-8 glow-btn bg-gradient-to-r from-fuchsia-400/20 to-violet-500/10 text-white"
              >
                ok, já entendi
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; transform: translateY(0px) scale(1); }
          50% { opacity: 1; transform: translateY(-6px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export default App;
