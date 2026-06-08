import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Play, ChevronRight, X, Heart, Sparkles, Stars as LucideStars, Gift, HeartCrack } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Billboard, Image as DreiImage, Html } from '@react-three/drei';
import * as THREE from 'three';
// ============================================================
// GLOBAL AUDIO CONFIG
// ============================================================
// Music will be played using a YouTube iframe in the App component.


// ============================================================
// STAGE WRAPPER — smooth crossfade between stages
// ============================================================
const stageVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 100, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, type: 'spring', bounce: 0.3 } },
  exit: { opacity: 0, scale: 1.2, y: -100, filter: 'blur(10px)', transition: { duration: 0.6, ease: 'easeIn' } },
};

// ============================================================
// STAGE 1: PINK MATRIX INTRO
// ============================================================
function Stage1({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'matrix' | 'countdown' | 'text' | 'done'>('matrix');
  const [countNum, setCountNum] = useState(3);
  const [textIdx, setTextIdx] = useState(0);
  const texts = ['SPECIAL GIFT', 'FOR', 'SPECIAL PERSON'];

  // Matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 16;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);
    const chars = 'HAPPYBIRTHDAYLOVEWISHGIFTCAKEJOYPARTYSPECIALSWEETDREAMCELEBRATESHINE'.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const pink = Math.random() > 0.5 ? '#ff1493' : '#ff69b4';
      ctx.fillStyle = pink;
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const id = setInterval(draw, 45);
    return () => clearInterval(id);
  }, []);

  // Sequence controller
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('countdown'), 3000);
    const t2 = setTimeout(() => setPhase('text'), 6000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete(); }, 10500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    const iv = setInterval(() => setCountNum(n => Math.max(1, n - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'text') return;
    const iv = setInterval(() => setTextIdx(i => i + 1), 1500);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <motion.div key={`count-${countNum}`}
            initial={{ opacity: 0, scale: 3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-[20vw] font-black select-none"
              style={{ fontFamily: '"Orbitron", sans-serif', color: '#ff1493', textShadow: '0 0 60px #ff1493, 0 0 120px #ff69b4' }}>
              {countNum}
            </span>
          </motion.div>
        )}

        {phase === 'text' && texts[textIdx] && (
          <motion.div key={`text-${textIdx}`}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <h1 className="text-5xl md:text-8xl font-black text-center px-4 tracking-widest uppercase"
              style={{ fontFamily: '"Orbitron", sans-serif', color: '#ff1493', textShadow: '0 0 40px #ff1493, 0 0 80px #ff69b4, 0 0 160px #ff1493' }}>
              {texts[textIdx]}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// STAGE 2: LOVE METER GATE
// ============================================================
const RELEASE_WARNINGS = [
  { icon: HeartCrack, text: 'Dilepas? Segitu doang cintanya?' },
  { icon: LucideStars, text: 'Eh, kurang dikit lagi lho...' },
  { icon: Gift, text: 'Masa kalah sama hitung mundur?' },
  { icon: Sparkles, text: 'Coba lagi, aku tau kamu bisa!' },
  { icon: Heart, text: 'Udah deket banget, jangan nyerah dong!' },
];

function Stage2({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [warnIdx, setWarnIdx] = useState(-1);
  const [releaseCount, setReleaseCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  const startHold = () => {
    if (locked) return;
    setWarnIdx(-1);
    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + (100 / 300), 100);
      setProgress(Math.round(progressRef.current * 10) / 10);
      if (progressRef.current >= 100) {
        clearInterval(intervalRef.current!);
        setLocked(true);
        setTimeout(() => onComplete(), 1500);
      }
    }, 10);
  };

  const stopHold = () => {
    if (locked) return;
    clearInterval(intervalRef.current!);
    if (progressRef.current < 100 && progressRef.current > 0) {
      const newCount = releaseCount % RELEASE_WARNINGS.length;
      setWarnIdx(newCount);
      setReleaseCount(c => c + 1);
      progressRef.current = 0;
      setProgress(0);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const WarnIcon = warnIdx >= 0 ? RELEASE_WARNINGS[warnIdx].icon : null;
  const warnText = warnIdx >= 0 ? RELEASE_WARNINGS[warnIdx].text : '';

  return (
    <div className="w-full h-screen bg-[#0a0010] flex flex-col items-center justify-center gap-8 px-6 select-none relative overflow-hidden">
      {/* Floating Hearts BG */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div key={i} className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.2
          }}
          animate={{ y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart fill="#ff1493" color="#ff1493" size={Math.random() * 20 + 10} />
        </motion.div>
      ))}

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="uppercase tracking-[0.25em] text-pink-400/70 text-xs mb-2 font-semibold">Love Meter</p>
        <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: '"Playfair Display", serif', textShadow: '0 0 30px #ff1493aa' }}>
          Seberapa besar cintamu?
        </h2>
      </motion.div>

      {/* Heart SVG with fill */}
      <div className="relative w-52 h-52 md:w-64 md:h-64">
        <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-[0_0_30px_#ff1493]">
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ff1493" />
              <stop offset="100%" stopColor="#ff69b4" />
            </linearGradient>
            <clipPath id="heartClip">
              <path d="M50 85 C50 85 10 55 10 30 C10 15 20 5 35 5 C42 5 48 9 50 12 C52 9 58 5 65 5 C80 5 90 15 90 30 C90 55 50 85 50 85Z" />
            </clipPath>
          </defs>
          {/* Dark outline */}
          <path d="M50 85 C50 85 10 55 10 30 C10 15 20 5 35 5 C42 5 48 9 50 12 C52 9 58 5 65 5 C80 5 90 15 90 30 C90 55 50 85 50 85Z"
            fill="#1a0020" stroke="#ff1493" strokeWidth="1.5" opacity="0.9" />
          {/* Fill bar */}
          <g clipPath="url(#heartClip)">
            <rect x="0" y={90 - progress * 0.9} width="100" height="90" fill="url(#heartGrad)" />
          </g>
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black drop-shadow-lg" style={{ color: progress > 50 ? 'white' : '#ff69b4', fontFamily: '"DM Sans", sans-serif' }}>
            {locked ? '100%' : `${Math.floor(progress)}%`}
          </span>
        </div>
      </div>

      {/* Hold Button */}
      <motion.button
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        whileTap={{ scale: 0.93 }}
        disabled={locked}
        className="flex items-center gap-3 px-8 py-5 rounded-full font-black text-white cursor-pointer touch-none text-lg tracking-wide"
        style={{ background: locked ? 'linear-gradient(135deg,#a855f7,#ec4899)' : 'linear-gradient(135deg, #ff1493, #c2185b)', boxShadow: '0 0 40px #ff1493aa', fontFamily: '"DM Sans", sans-serif' }}
      >
        {locked
          ? <><Sparkles size={22} /> <span>Full 100% Love!</span></>
          : <><Heart size={22} fill="white" /> <span>Tahan buktiin cintamu</span></>}
      </motion.button>

      {/* Animated warning */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {WarnIcon && warnIdx >= 0 && (
            <motion.div
              key={releaseCount}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{ background: 'rgba(255,20,147,0.12)', border: '1px solid rgba(255,20,147,0.3)' }}
            >
              <WarnIcon size={20} color="#ff69b4" strokeWidth={2} />
              <span className="text-pink-300 font-bold tracking-wide" style={{ fontFamily: '"DM Sans", sans-serif' }}>{warnText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// STAGE 3: MUSIC PLAYER
// ============================================================
function Stage3({ onComplete, onPlay }: { onComplete: () => void, onPlay: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    onPlay();
    setIsPlaying(true);
    setStarted(true);
  };

  return (
    <div className="w-full h-screen bg-[#0d0018] flex flex-col items-center justify-center gap-8 px-6 relative overflow-hidden">
      {/* Floating Sparkles BG */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div key={i} className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3
          }}
          animate={{ y: [0, Math.random() * -30 - 10, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
        >
          <Sparkles color="#ff69b4" size={Math.random() * 15 + 10} />
        </motion.div>
      ))}

      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-pink-300 text-3xl font-bold font-serif">It's All About You</motion.h2>

      {/* Vinyl */}
      <div className="relative w-52 h-52">
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 5, ease: 'linear', repeat: Infinity } : { duration: 0.5 }}
          className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 flex items-center justify-center shadow-[0_0_40px_#ff1493aa]"
        >
          {/* Vinyl grooves */}
          {[40, 50, 60, 70, 80].map(r => (
            <div key={r} className="absolute rounded-full border border-gray-600/40" style={{ width: `${r}%`, height: `${r}%` }} />
          ))}
          {/* Center label */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden border-2 border-gray-700 bg-gray-900">
            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/fira-assets/vinyl-center.jpg`} alt="Vinyl Center" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </div>

      {/* Song info */}
      <div className="text-center">
        <p className="text-white text-2xl font-bold">About You - The 1975</p>
        <p className="text-pink-400 text-sm mt-1">For My Special Person</p>
      </div>

      {/* Player controls */}
      <div className="flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.button key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              onClick={handlePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_#ff1493]"
              style={{ background: 'linear-gradient(135deg, #ff1493, #c2185b)' }}
            >
              <Play size={28} fill="white" />
            </motion.button>
          ) : (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-pink-300">
              <span className="animate-pulse text-lg">●</span>
              <span className="font-semibold">Playing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {started && (
            <motion.button key="next" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff1493, #c2185b)', boxShadow: '0 0 24px #ff1493aa' }}
            >
              Let's go <ChevronRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// SHARED DATA FOR STAGE 4 & 5
// ============================================================
const UCAPAN_LIST = [
  'Terima kasih udah bertahan sejauh ini. Aku tau ga semua hari berjalan mudah, tapi kamu berhasil melewatinya satu per satu. Dan itu sesuatu yang selalu bikin aku kagum.',
  'Salah satu hal yang paling aku suka dari kamu adalah caramu terus berusaha. Bahkan saat capek, bingung, atau kehilangan semangat, kamu tetap mencoba melangkah maju.',
  'Aku harap kamu selalu ingat kalau kamu jauh lebih hebat dari yang kamu kira. Semua perjuanganmu hari ini suatu saat akan terbayar dengan hal-hal baik yang kamu impikan. ',
  'Kalau suatu hari dunia terasa berat, jangan lupa kalau masih ada aku yang selalu dukung kamu, dengerin cerita kamu, dan ikut senang melihat setiap pencapaianmu.',
  'Dan dari sekian banyak hal yang aku syukuri, salah satunya adalah dipertemukan sama kamu.',
  'Di antara banyak orang yang pernah aku temui, aku bersyukur semesta mempertemukanku dengan kamu.',
  'Aku suka cara kamu tersenyum, cara kamu bercerita, dan bahkan hal-hal kecil yang mungkin kamu anggap biasa.',
  'Semoga semua mimpi yang lagi kamu kejar pelan-pelan datang menghampirimu satu per satu.',
  'Aku akan selalu jadi orang yang paling semangat ngeliat kamu berhasil.',
  'Dan semoga di setiap versi masa depanmu, aku masih punya tempat untuk berjalan di sampingmu.'
];

const PHOTOS = Array.from({ length: 85 }).map((_, i) => {
  // Mengambil gambar langsung dari Supabase Storage (CDN) agar aplikasi lebih ringan
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const src = `${supabaseUrl}/storage/v1/object/public/fira-assets/shafira/${i + 1}.png`;

  // Pick 1 random unique message
  const shuffled = [...UCAPAN_LIST].sort(() => 0.5 - Math.random());
  const messages = shuffled.slice(0, 1);

  return { src, messages };
});

// ============================================================
// STAGE 4B: SCRATCH TO REVEAL
// ============================================================
function Stage4B({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showGiftPhase, setShowGiftPhase] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleLanjutClick = () => {
    setShowGiftPhase(true);
    setTimeout(() => setShowGift(true), 500);
  };

  const handleOpenGift = () => {
    setIsOpening(true);
    setTimeout(() => {
      setShowPopup(true);
    }, 1500);
  };
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill canvas with frosted color
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#1a1025'; // dark frosted color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise/stars to frosted glass
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 24px serif';
    ctx.fillStyle = '#ff69b4';
    ctx.textAlign = 'center';
    ctx.fillText('Usap layarnya pelan-pelan ya...', canvas.width / 2, canvas.height / 2);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 60;

    let pixelsScratched = 0;
    const totalPixels = canvas.width * canvas.height;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(x, y);
      ctx.stroke();

      pixelsScratched += 2000;
      if (pixelsScratched > totalPixels * 0.4 && !isRevealed) {
        setIsRevealed(true);
        canvas.style.transition = 'opacity 1s ease-in-out';
        canvas.style.opacity = '0';
        setTimeout(() => {
          canvas.style.pointerEvents = 'none';
        }, 1000);
      }
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      scratch(x, y);
    };

    const handleUp = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('touchstart', handleDown);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchend', handleUp);

    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('touchstart', handleDown);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleUp);
    };
  }, [isRevealed]);

  return (
    <div className="w-full h-screen bg-[#05000a] relative overflow-hidden flex items-center justify-center">
      {/* Animated Glowing Orbs */}
      <motion.div
        className="absolute top-0 left-[10%] w-[40vw] h-[40vw] rounded-full bg-pink-800/20 blur-[100px]"
        animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/20 blur-[120px]"
        animate={{ x: [0, -40, 40, 0], y: [0, -40, 40, 0], scale: [1, 0.8, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle Stardust */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-pink-100"
          style={{
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            boxShadow: '0 0 8px rgba(255, 182, 193, 0.8)'
          }}
          animate={{ y: [0, -100], opacity: [0, 0.6, 0] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }}
        />
      ))}

      <AnimatePresence mode="wait">
        {!showGiftPhase ? (
          <motion.div key="letter" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} className="flex flex-col items-center p-5 md:p-8 max-w-3xl w-[95vw] z-0 relative rounded-3xl border border-pink-500/10 bg-gradient-to-b from-pink-500/5 to-transparent backdrop-blur-sm shadow-[0_0_50px_rgba(255,20,147,0.05)] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-2xl md:text-3xl font-serif text-pink-200 mb-4 text-center drop-shadow-[0_2px_10px_rgba(255,20,147,0.5)]"
            >
              Happy Birthday, Sayanggg
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
              className="text-pink-100/90 text-[12px] sm:text-[13px] md:text-sm lg:text-[15px] font-serif leading-snug md:leading-relaxed text-left flex flex-col gap-2 md:gap-3 w-full mb-6"
            >
              <p>Wahhh, ga kerasa ya makin hari makin tua aja sayangg hahaha. Di hari yang spesial ini, aku cuma mau bilang terima kasih. Terima kasih karena kamu udah berhasil bertahan sampai sejauh ini, terus belajar, terus berkembang jadi pribadi yang lebih baik, dan terus berjuang buat masa depan yang kamu impikan. I'm really proud of every step you take.</p>
              <p>Di usia yang baru ini, aku harap semua yang lagi kamu perjuangin bisa berjalan lancar. Semoga skripsinya dipermudah sampai sidang nanti, kuliahnya selesai tepat waktu, dan semua urusan yang lagi kamu hadapi selalu dipertemukan sama jalan terbaik.</p>
              <p>Semoga sebelum wisuda nanti kamu udah ketemu pekerjaan yang kamu impikan, dikelilingi orang-orang baik, lingkungan yang positif, saling support, dan bikin kamu nyaman buat berkembang setiap harinya.</p>
              <p>And for the last one, semoga kita masih bisa terus jalan bareng, saling jaga, saling support, dan tetap bertahan menghadapi apa pun yang ada di depan nanti. Semoga kita masih punya banyak waktu buat bikin cerita, kenangan, dan mimpi-mimpi baru bersama.</p>
              <p className="font-bold italic text-pink-200 mt-2 text-center">Once again, happy birthday, my beloved Fira. Thank you for being you.</p>
            </motion.div>
            <AnimatePresence>
              {isRevealed && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  onClick={handleLanjutClick}
                  className="px-8 py-3 rounded-full font-bold text-white shadow-[0_0_30px_rgba(255,20,147,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,20,147,0.6)] relative z-50 border border-pink-400/50"
                  style={{ background: 'linear-gradient(135deg, rgba(255,20,147,0.8), rgba(194,24,91,0.8))' }}
                >
                  Lanjut <ChevronRight size={20} className="inline ml-1" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="gift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 z-20">
            {!showPopup ? (
              <AnimatePresence>
                {showGift && (
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                    className="cursor-pointer group relative flex flex-col items-center justify-center"
                    onClick={handleOpenGift}
                  >
                    <motion.div
                      animate={
                        isOpening
                          ? { rotate: [0, -15, 15, -20, 20, -25, 25, 0], scale: [1, 1.2, 1.3, 1.4, 0], opacity: [1, 1, 1, 1, 0] }
                          : { y: [0, -15, 0] }
                      }
                      transition={{ duration: isOpening ? 1.5 : 2, repeat: isOpening ? 0 : Infinity, ease: 'easeInOut' }}
                    >
                      <Gift size={150} color="#ff1493" strokeWidth={1.5} className="drop-shadow-[0_0_30px_#ff1493] group-hover:scale-110 transition-transform" />
                    </motion.div>

                    {/* Particles explosion when opening */}
                    <AnimatePresence>
                      {isOpening && Array.from({ length: 12 }).map((_, i) => (
                        <motion.div key={i} className="absolute top-1/2 left-1/2"
                          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                          animate={{
                            opacity: 0,
                            scale: Math.random() * 2 + 1,
                            x: (Math.random() - 0.5) * 400,
                            y: (Math.random() - 0.5) * 400
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        >
                          <Heart fill="#ff69b4" color="#ff69b4" size={24} />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {!isOpening && (
                      <p className="mt-6 flex items-center justify-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 uppercase tracking-widest font-black text-xl animate-pulse text-center drop-shadow-[0_0_15px_rgba(255,20,147,0.8)]">
                        <Sparkles size={20} color="#ff69b4" />
                        BUKA HADIAHNYA!
                        <Sparkles size={20} color="#ff69b4" />
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 p-8 rounded-3xl border border-pink-400/50 backdrop-blur-md shadow-[0_0_50px_#ff1493aa] max-w-sm"
              >
                <Heart fill="#ff1493" color="#ff1493" size={48} className="mx-auto mb-4 drop-shadow-[0_0_15px_#ff1493] animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-2 font-serif">Hadiah Sedang Dikirim...</h3>
                <p className="text-pink-200 mb-8">Mohon ditunggu ya sayang! 🎁💕</p>
                <button
                  onClick={onComplete}
                  className="px-8 py-3 rounded-full text-lg font-bold text-white shadow-[0_0_20px_#ff1493] transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ff1493, #c2185b)' }}
                >
                  LANJOTTTT <ChevronRight className="inline" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scratch Canvas - Hanya tampil jika belum masuk fase gift */}
      {!showGiftPhase && <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-pointer touch-none" />}
    </div>
  );
}

// ============================================================
// STAGE 4: THE INVITATION & GIFT
// ============================================================
function Stage4({ onComplete }: { onComplete: () => void }) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [showForcedPopup, setShowForcedPopup] = useState(false);

  // Runaway button state
  const [noPos, setNoPos] = useState({ x: 200, y: 0 }); // Posisi awal di kanan lebih jauh
  const [noClickCount, setNoClickCount] = useState(0);

  const moveNoButton = () => {
    if (isAgreed) return;

    setNoClickCount(c => {
      const nextCount = c + 1;
      const nextScale = Math.pow(1.3, nextCount);

      const maxX = typeof window !== 'undefined' ? window.innerWidth / 2 - 80 : 200;
      const maxY = typeof window !== 'undefined' ? window.innerHeight / 2 - 40 : 200;

      // Hitung batas bounding box "Of Course" saat ini
      // Radius dasar X ~80px, Y ~30px.
      const ofCourseRadiusX = (80 * nextScale) + 80; // +80 untuk setengah lebar No way + margin
      const ofCourseRadiusY = (30 * nextScale) + 50; // +50 untuk setengah tinggi No way + margin

      let newX = 0;
      let newY = 0;
      let foundSafe = false;

      // Cari posisi acak di dalam layar yang TIDAK bertabrakan dengan Of Course
      for (let i = 0; i < 200; i++) {
        const testX = (Math.random() * 2 - 1) * maxX;
        const testY = (Math.random() * 2 - 1) * maxY;

        if (Math.abs(testX) > ofCourseRadiusX || Math.abs(testY) > ofCourseRadiusY) {
          newX = testX;
          newY = testY;
          foundSafe = true;
          break;
        }
      }

      // Jika tidak ada ruang aman di layar (berarti Of Course sudah sangat besar)
      if (!foundSafe) {
        // Letakkan di sudut layar, ia akan tertimpa secara natural oleh Of Course (z-index lebih rendah)
        newX = (Math.random() > 0.5 ? 1 : -1) * maxX;
        newY = (Math.random() > 0.5 ? 1 : -1) * maxY;

        // Beri jeda 1.2 detik agar animasi kotak membesar bisa selesai menutupi layar sepenuhnya
        setTimeout(() => {
          setShowForcedPopup(true);
        }, 1200);
      }

      setNoPos({ x: newX, y: newY });
      return nextCount;
    });
  };

  const handleOfCourse = () => {
    if (isAgreed) return;
    setIsAgreed(true);
    setTimeout(() => {
      onComplete(); // Langsung transisi ke Galaxy
    }, 1200); // Tunggu sampai tombol memenuhi layar
  };

  return (
    <div className="w-full h-screen bg-[#020005] relative flex flex-col items-center justify-center gap-10 px-6 text-center overflow-hidden">
      {/* Space BG with CSS stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center gap-10 z-10 w-full h-full justify-center">

        <AnimatePresence>
          {showForcedPopup && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 z-[1000] bg-white text-pink-600 px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(255,20,147,0.4)] border-2 border-pink-300 font-bold text-lg md:text-xl whitespace-nowrap text-center pointer-events-none"
            >
              Gaada pilihan lain sayaangg, hehe 🤭
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-4xl md:text-5xl font-serif font-bold text-pink-300 drop-shadow-[0_0_20px_#ff1493] relative z-10 pointer-events-none">
          Can I show you someone very special to me?
        </h2>
        <motion.div
          animate={{ x: noClickCount === 0 ? -100 : 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          className="flex flex-row items-center justify-center relative w-full h-[150px]"
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: isAgreed ? 150 : Math.pow(1.3, noClickCount) }}
            transition={{ type: 'spring', stiffness: isAgreed ? 40 : 60, damping: isAgreed ? 20 : 15 }}
            onClick={handleOfCourse}
            className="px-8 py-4 rounded-full text-xl font-bold text-white bg-pink-600 hover:bg-pink-500 shadow-[0_0_20px_#ff1493] transition-colors absolute z-[990] whitespace-nowrap"
          >
            Of course 😍
          </motion.button>

          <AnimatePresence>
            {!isAgreed && (
              <motion.button
                animate={{
                  x: noClickCount === 0 ? 200 : noPos.x,
                  y: noClickCount === 0 ? 0 : noPos.y,
                }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                onClick={moveNoButton}
                className="px-8 py-4 rounded-full text-xl font-bold text-gray-300 bg-gray-800 border border-gray-600 absolute z-[980] whitespace-nowrap shadow-lg"
              >
                No way 😒
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}



function Stage5PlanetGroup({ onPhotoClick, onLoaded }: { onPhotoClick: (src: string, messages: string[]) => void, onLoaded: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    onLoaded();
  }, [onLoaded]);

  const ringData = useMemo(() => {
    // Ambil 45 foto secara acak agar memori (VRAM) tidak terlalu berat
    const subset = [...PHOTOS].sort(() => 0.5 - Math.random()).slice(0, 45);
    return subset.map((p) => {
      const minRadius = 3.5;
      const maxRadius = 10;
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2.5;
      return { ...p, x, y, z };
    });
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. THE CENTRAL PLANET */}
      <points>
        <sphereGeometry args={[2, 32, 32]} />
        <pointsMaterial color="#ff69b4" size={0.03} transparent />
      </points>

      {/* 2. THE HORIZONTAL PHOTO GALAXY DISC (Asteroid Belt Effect) */}
      {ringData.map((p, i) => (
        <Billboard key={i} position={[p.x, p.y, p.z]}>
          <group
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(p.src, p.messages);
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            {/* Soft pink glow/border behind the polaroid */}
            <mesh position={[0, -0.05, -0.02]}>
              <planeGeometry args={[0.94, 1.10]} />
              <meshBasicMaterial color="#ff1493" transparent opacity={0.3} />
            </mesh>
            {/* Polaroid white base */}
            <mesh position={[0, -0.05, -0.01]}>
              <planeGeometry args={[0.88, 1.04]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* The Photo */}
            <DreiImage
              url={p.src}
              scale={[0.8, 0.8]}
              transparent
            />
          </group>
        </Billboard>
      ))}
    </group>
  );
}

function Stage5() {
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; messages: string[] } | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) {
      // Pancing event resize agar Canvas 3D (R3F) mengkalkulasi ulang rasio dan resolusinya 
      // setelah loading screen menghilang dan transisi framer-motion stabil.
      const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <div className="w-full h-screen bg-[#050010] relative overflow-hidden">
      {createPortal(
        <AnimatePresence>
          {!isReady && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1 } }}
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050010]"
            >
              <div className="relative flex items-center justify-center mb-6">
                <Heart size={60} color="#ff1493" className="animate-pulse drop-shadow-[0_0_20px_#ff1493]" />
                <div className="absolute w-24 h-24 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-pink-300 font-serif text-xl md:text-2xl animate-pulse tracking-wide drop-shadow-[0_0_10px_#ff1493]">
                Nungguin yaaa
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 4, 10], fov: 60 }}
        dpr={[1, 1]}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#050010']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={600} factor={4} saturation={0} fade speed={2} />

        {/* 3. FLOATING TEXT */}
        <Html position={[0, 3.5, 0]} center transform sprite distanceFactor={12} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none">
            <h1 className="text-4xl md:text-5xl font-serif text-pink-300 drop-shadow-[0_0_15px_#ff1493] whitespace-nowrap italic">
              For My Beloved Fira
            </h1>
          </div>
        </Html>

        <Suspense fallback={null}>
          <Stage5PlanetGroup onPhotoClick={(src, messages) => setSelectedPhoto({ src, messages })} onLoaded={() => setIsReady(true)} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>

      {/* DOM Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
            style={{ background: 'rgba(5,0,16,0.85)', backdropFilter: 'blur(16px)' }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div initial={{ scale: 0.7, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.7, y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,105,180,0.4)',
                boxShadow: '0 0 60px rgba(255,20,147,0.3)',
              }}
            >
              <button onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-pink-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10">
                <X size={24} />
              </button>

              <div className="w-48 h-48 md:w-80 md:h-80 shrink-0 relative">
                <motion.img src={selectedPhoto.src} alt="" className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-pink-400/50"
                  initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: 'spring' }} />
              </div>

              <div className="flex flex-col gap-4 flex-1 w-full justify-center">
                {selectedPhoto.messages.map((msg, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center gap-4 shadow-lg backdrop-blur-sm">
                    <Heart fill="#ff1493" color="#ff1493" size={24} className="shrink-0 drop-shadow-[0_0_10px_#ff1493]" />
                    <p className="text-pink-100 text-sm md:text-lg font-serif font-medium leading-snug">{msg}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// APP — STAGE CONTROLLER
// ============================================================
export default function App() {
  const [currentStage, setCurrentStage] = useState(1);
  const [playMusic, setPlayMusic] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-black font-sans">
      {playMusic && (
        <iframe
          width="1"
          height="1"
          src="https://www.youtube.com/embed/tGv7CUutzqU?si=vtdVqa6XAIppjxfY&autoplay=1&loop=1&playlist=tGv7CUutzqU"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        ></iframe>
      )}

      <AnimatePresence mode="wait">
        {currentStage === 1 && (
          <motion.div key="s1" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage1 onComplete={() => setCurrentStage(2)} />
          </motion.div>
        )}
        {currentStage === 2 && (
          <motion.div key="s3" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage3 onComplete={() => setCurrentStage(3)} onPlay={() => setPlayMusic(true)} />
          </motion.div>
        )}
        {currentStage === 3 && (
          <motion.div key="s2" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage2 onComplete={() => setCurrentStage(4)} />
          </motion.div>
        )}
        {currentStage === 4 && (
          <motion.div key="s4b" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage4B onComplete={() => setCurrentStage(5)} />
          </motion.div>
        )}
        {currentStage === 5 && (
          <motion.div key="s4" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage4 onComplete={() => setCurrentStage(6)} />
          </motion.div>
        )}
        {currentStage === 6 && (
          <motion.div key="s5" variants={stageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
            <Stage5 />
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
