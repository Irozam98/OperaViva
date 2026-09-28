import React, { useState, useRef, useEffect } from 'react';
import { 
  X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Sliders, Check, 
  RotateCcw as ResetIcon, Sparkles, Sun, Contrast, Palette, Frame, ShieldCheck, 
  Maximize2, Eye, Grid
} from 'lucide-react';

interface ImageEditorModalProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

export type VirtualFrameType = 'none' | 'gold' | 'black' | 'wood' | 'passepartout';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  imageUrl,
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Navigazione schede strumenti
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop' | 'frame' | 'filters' | 'watermark'>('adjust');

  // Regolazioni Colore & Luce
  const [brightness, setBrightness] = useState<number>(100);   // 50 - 150
  const [contrast, setContrast] = useState<number>(100);       // 50 - 160
  const [saturate, setSaturate] = useState<number>(100);       // 0 - 200
  const [warmth, setWarmth] = useState<number>(0);             // -30 (freddo) a +30 (caldo)
  const [clarity, setClarity] = useState<number>(0);           // 0 to 50

  // Rotazione & Raddrizzamento
  const [rotation, setRotation] = useState<number>(0);         // 0, 90, 180, 270
  const [fineAngle, setFineAngle] = useState<number>(0);       // -10 a +10 gradi per raddrizzare foto storte
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Ritaglio Bordi (% dai 4 lati)
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Cornice Virtuale
  const [frameType, setFrameType] = useState<VirtualFrameType>('none');

  // Watermark / Firma Digitale
  const [useWatermark, setUseWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>("© Archivio d'Arte");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(60);

  // Carica immagine
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Ridisegno Canvas
  useEffect(() => {
    if (!imageElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const origW = imageElement.naturalWidth || imageElement.width;
    const origH = imageElement.naturalHeight || imageElement.height;

    // Calcolo coordinate ritagliate
    const cutL = (cropLeft / 100) * origW;
    const cutR = (cropRight / 100) * origW;
    const cutT = (cropTop / 100) * origH;
    const cutB = (cropBottom / 100) * origH;

    const sourceW = Math.max(10, origW - cutL - cutR);
    const sourceH = Math.max(10, origH - cutT - cutB);

    // Dimensioni canvas tenendo conto della rotazione di 90 o 270 gradi
    const isSideways = rotation === 90 || rotation === 270;
    let baseW = isSideways ? sourceH : sourceW;
    let baseH = isSideways ? sourceW : sourceH;

    // Dimensioni addizionali se cornice attiva
    let framePadding = 0;
    if (frameType === 'gold' || frameType === 'wood') {
      framePadding = Math.round(Math.min(baseW, baseH) * 0.08); // Cornice spessa circa 8%
    } else if (frameType === 'black') {
      framePadding = Math.round(Math.min(baseW, baseH) * 0.05); // Cornice moderna sottile 5%
    } else if (frameType === 'passepartout') {
      framePadding = Math.round(Math.min(baseW, baseH) * 0.12); // Passe-partout largo 12%
    }

    canvas.width = baseW + framePadding * 2;
    canvas.height = baseH + framePadding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna Cornice di Sfondo (se attiva)
    if (frameType !== 'none' && framePadding > 0) {
      if (frameType === 'gold') {
        const goldGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        goldGrad.addColorStop(0, '#d4af37');
        goldGrad.addColorStop(0.3, '#f9eed2');
        goldGrad.addColorStop(0.6, '#b8860b');
        goldGrad.addColorStop(1, '#8c6d23');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bordo interno scuro
        ctx.strokeStyle = '#4a3b10';
        ctx.lineWidth = 4;
        ctx.strokeRect(framePadding - 3, framePadding - 3, baseW + 6, baseH + 6);
      } else if (frameType === 'wood') {
        const woodGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        woodGrad.addColorStop(0, '#5c3a21');
        woodGrad.addColorStop(0.5, '#7a4e2d');
        woodGrad.addColorStop(1, '#422814');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2d1808';
        ctx.lineWidth = 3;
        ctx.strokeRect(framePadding - 2, framePadding - 2, baseW + 4, baseH + 4);
      } else if (frameType === 'black') {
        ctx.fillStyle = '#111317';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2b303a';
        ctx.lineWidth = 2;
        ctx.strokeRect(framePadding - 2, framePadding - 2, baseW + 4, baseH + 4);
      } else if (frameType === 'passepartout') {
        ctx.fillStyle = '#f8f6f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Filetto nero interno intorno alla finestra
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(framePadding - 2, framePadding - 2, baseW + 4, baseH + 4);

        // Bordo esterno in legno
        ctx.strokeStyle = '#1e222a';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
      }
    }

    // Disegno Opera d'Arte
    ctx.save();

    // Sposta al centro dell'area pittura
    ctx.translate(framePadding + baseW / 2, framePadding + baseH / 2);

    // Rotazione e raddrizzamento fine (-10° a +10°)
    const totalAngle = rotation + fineAngle;
    if (totalAngle !== 0) {
      ctx.rotate((totalAngle * Math.PI) / 180);
    }

    // Specchiatura
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    // Applica filtri colore
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

    // Disegna la porzione ritagliata
    ctx.drawImage(
      imageElement,
      cutL, cutT, sourceW, sourceH,
      -sourceW / 2, -sourceH / 2, sourceW, sourceH
    );

    ctx.restore();

    // Effetto Temperatura Caldo / Freddo
    if (warmth !== 0) {
      ctx.save();
      ctx.fillStyle = warmth > 0 ? 'rgba(235, 140, 40, ' + (warmth / 180) + ')' : 'rgba(40, 140, 235, ' + (Math.abs(warmth) / 180) + ')';
      ctx.fillRect(framePadding, framePadding, baseW, baseH);
      ctx.restore();
    }

    // Griglia a Terzi Guida (visibile solo a schermo per comporre l'inquadratura)
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);

      const wThird = baseW / 3;
      const hThird = baseH / 3;

      // Linee verticali
      ctx.beginPath();
      ctx.moveTo(framePadding + wThird, framePadding);
      ctx.lineTo(framePadding + wThird, framePadding + baseH);
      ctx.moveTo(framePadding + wThird * 2, framePadding);
      ctx.lineTo(framePadding + wThird * 2, framePadding + baseH);

      // Linee orizzontali
      ctx.moveTo(framePadding, framePadding + hThird);
      ctx.lineTo(framePadding + baseW, framePadding + hThird);
      ctx.moveTo(framePadding, framePadding + hThird * 2);
      ctx.lineTo(framePadding + baseW, framePadding + hThird * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Watermark / Firma Digitale Opzionale
    if (useWatermark && watermarkText.trim()) {
      ctx.save();
      const fontSize = Math.max(16, Math.round(baseW * 0.035));
      ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(watermarkText.trim(), canvas.width - framePadding - 18, canvas.height - framePadding - 18);
      ctx.restore();
    }

  }, [
    imageElement, rotation, fineAngle, flipH, flipV, 
    brightness, contrast, saturate, warmth, clarity,
    cropTop, cropBottom, cropLeft, cropRight, 
    frameType, useWatermark, watermarkText, watermarkOpacity, showGrid
  ]);

  const handleReset = () => {
    setRotation(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setWarmth(0);
    setClarity(0);
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
    setFrameType('none');
    setUseWatermark(false);
    setShowGrid(false);
  };

  // Applicazione preset fotografici veloci
  const applyPreset = (type: 'vivid' | 'clean' | 'warm' | 'bw' | 'vintage') => {
    if (type === 'vivid') {
      setBrightness(105);
      setContrast(118);
      setSaturate(130);
      setWarmth(4);
    } else if (type === 'clean') {
      setBrightness(108);
      setContrast(106);
      setSaturate(100);
      setWarmth(-3);
    } else if (type === 'warm') {
      setBrightness(103);
      setContrast(110);
      setSaturate(112);
      setWarmth(15);
    } else if (type === 'bw') {
      setBrightness(104);
      setContrast(125);
      setSaturate(0);
      setWarmth(0);
    } else if (type === 'vintage') {
      setBrightness(98);
      setContrast(112);
      setSaturate(85);
      setWarmth(22);
    }
  };

  // Preset di ritaglio proporzioni
  const applyCropAspect = (ratio: '1:1' | '4:3' | '3:2' | '16:9' | 'reset') => {
    if (ratio === 'reset') {
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      return;
    }
    if (!imageElement) return;

    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    const currentRatio = w / h;

    let targetRatio = 1;
    if (ratio === '4:3') targetRatio = 4 / 3;
    if (ratio === '3:2') targetRatio = 3 / 2;
    if (ratio === '16:9') targetRatio = 16 / 9;

    if (currentRatio > targetRatio) {
      // Troppo largo: taglia a destra e sinistra
      const newW = h * targetRatio;
      const diffPercent = ((w - newW) / w) * 100;
      setCropLeft(Math.round(diffPercent / 2));
      setCropRight(Math.round(diffPercent / 2));
      setCropTop(0);
      setCropBottom(0);
    } else {
      // Troppo alto: taglia in alto e in basso
      const newH = w / targetRatio;
      const diffPercent = ((h - newH) / h) * 100;
      setCropTop(Math.round(diffPercent / 2));
      setCropBottom(Math.round(diffPercent / 2));
      setCropLeft(0);
      setCropRight(0);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    try {
      // Disattiva la griglia guida prima del render finale se attiva
      setShowGrid(false);
      setTimeout(() => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
        onSave(dataUrl);
      }, 50);
    } catch (e) {
      console.error('Errore salvataggio foto:', e);
      alert('Impossibile salvare l\'immagine elaborata.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300, padding: '1rem' }}>
      <div 
        className="modal-card modal-card-lg" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '1080px', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sliders size={22} color="#d4af37" />
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>
                Laboratorio Fotografico Dipinti
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Raddrizzamento millimetrico, taglio bordi cavalletto, regolazione pigmenti e cornici
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleReset} title="Ripristina valori originali">
              <ResetIcon size={15} />
              <span>Ripristina</span>
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Editor a due colonne su PC, colonna singola su mobile */}
        <div className="modal-body editor-modal-body" style={{ overflowY: 'auto' }}>
          
          {/* Colonna Sinistra: Canvas Anteprima */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07090e',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            padding: '0.85rem',
            minHeight: '260px',
            position: 'relative'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{
                maxWidth: '100%',
                maxHeight: '450px',
                objectFit: 'contain',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                borderRadius: frameType === 'none' ? '4px' : '0px'
              }}
            />

            {/* Barra Rotazioni e Controlli Rapidi Sotto Canvas */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1.2rem',
              background: 'rgba(20,24,35,0.9)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button className="btn-ghost btn-sm" onClick={() => setRotation(r => (r - 90 + 360) % 360)} title="Ruota 90° a sinistra">
                <RotateCcw size={15} />
                <span>-90°</span>
              </button>

              <button className="btn-ghost btn-sm" onClick={() => setRotation(r => (r + 90) % 360)} title="Ruota 90° a destra">
                <RotateCw size={15} />
                <span>+90°</span>
              </button>

              <div style={{ color: 'var(--border-medium)' }}>|</div>

              <button className="btn-ghost btn-sm" onClick={() => setFlipH(f => !f)} title="Specchia orizzontale">
                <FlipHorizontal size={15} />
                <span>Specchia</span>
              </button>

              <button className="btn-ghost btn-sm" onClick={() => setFlipV(f => !f)} title="Capovolgi verticale">
                <FlipVertical size={15} />
                <span>Capovolgi</span>
              </button>

              <div style={{ color: 'var(--border-medium)' }}>|</div>

              <button 
                className={`btn-ghost btn-sm ${showGrid ? 'active' : ''}`} 
                onClick={() => setShowGrid(g => !g)} 
                title="Griglia guida a terzi per allineare i bordi"
                style={{ color: showGrid ? 'var(--gold-400)' : 'var(--text-secondary)' }}
              >
                <Grid size={15} />
                <span>Griglia</span>
              </button>
            </div>
          </div>

          {/* Colonna Destra: Palette Strumenti */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Tabs Navigazione */}
            <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
              <button 
                className={`filter-tab ${activeTab === 'adjust' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('adjust')}
              >
                Luce & Colori
              </button>
              <button 
                className={`filter-tab ${activeTab === 'crop' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('crop')}
              >
                Ritaglio
              </button>
              <button 
                className={`filter-tab ${activeTab === 'frame' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('frame')}
              >
                Cornici
              </button>
              <button 
                className={`filter-tab ${activeTab === 'filters' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('filters')}
              >
                Filtri
              </button>
              <button 
                className={`filter-tab ${activeTab === 'watermark' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('watermark')}
              >
                Firma/Logo
              </button>
            </div>

            {/* TAB 1: Regolazione Luce, Colori e Inclinazione Fine */}
            {activeTab === 'adjust' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                
                {/* Raddrizzamento Millimetrico (-10° a +10°) */}
                <div className="form-group" style={{ background: 'rgba(212,175,55,0.06)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0, color: 'var(--gold-400)' }}>
                      📐 Raddrizza Inclinazione Tela
                    </label>
                    <span style={{ color: 'var(--gold-300)', fontWeight: 700 }}>
                      {fineAngle > 0 ? `+${fineAngle}°` : `${fineAngle}°`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="-10" 
                    max="10" 
                    step="0.5"
                    value={fineAngle}
                    onChange={e => setFineAngle(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-400)', cursor: 'pointer', marginTop: '6px' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Raddrizza di precisione quando la foto al quadro è scattata leggermente inclinata.
                  </div>
                </div>

                {/* Luminosità */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      <Sun size={15} color="#d4af37" />
                      Luminosità
                    </label>
                    <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={brightness}
                    onChange={e => setBrightness(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-400)', cursor: 'pointer', marginTop: '4px' }}
                  />
                </div>

                {/* Contrasto */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      <Contrast size={15} color="#d4af37" />
                      Contrasto Materico Tela
                    </label>
                    <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{contrast}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="160" 
                    value={contrast}
                    onChange={e => setContrast(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-400)', cursor: 'pointer', marginTop: '4px' }}
                  />
                </div>

                {/* Saturazione */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      <Palette size={15} color="#d4af37" />
                      Saturazione Pigmenti
                    </label>
                    <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{saturate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={saturate}
                    onChange={e => setSaturate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-400)', cursor: 'pointer', marginTop: '4px' }}
                  />
                </div>

                {/* Temperatura Caldo / Freddo */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      🌡️ Temperatura Luce (Caldo / Freddo)
                    </label>
                    <span style={{ color: warmth > 0 ? '#f59e0b' : warmth < 0 ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                      {warmth > 0 ? `+${warmth} (Ambra Calda)` : warmth < 0 ? `${warmth} (Luce Neutra/Fredda)` : 'Neutro'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="-30" 
                    max="30" 
                    value={warmth}
                    onChange={e => setWarmth(Number(e.target.value))}
                    style={{ width: '100%', accentColor: warmth > 0 ? '#f59e0b' : '#38bdf8', cursor: 'pointer', marginTop: '4px' }}
                  />
                </div>

              </div>
            )}

            {/* TAB 2: Ritaglio & Formato Proporzioni */}
            {activeTab === 'crop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                    Proporzioni Standard Quadri (Aspetto Rapido)
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyCropAspect('1:1')}>
                      1:1 Quadrato
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyCropAspect('4:3')}>
                      4:3 Classico
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyCropAspect('3:2')}>
                      3:2 Reflex
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyCropAspect('16:9')}>
                      16:9 Panoramico
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => applyCropAspect('reset')} style={{ color: '#f87171' }}>
                      Ripristina Taglio
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Rifila i bordi per eliminare il cavalletto o la parete circostante:
                  </p>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span>Rifila Lato Superiore</span>
                      <span style={{ color: 'var(--gold-300)' }}>{cropTop}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={cropTop}
                      onChange={e => setCropTop(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-400)' }}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span>Rifila Lato Inferiore (es. barra cavalletto)</span>
                      <span style={{ color: 'var(--gold-300)' }}>{cropBottom}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={cropBottom}
                      onChange={e => setCropBottom(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-400)' }}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span>Rifila Lato Sinistro</span>
                      <span style={{ color: 'var(--gold-300)' }}>{cropLeft}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={cropLeft}
                      onChange={e => setCropLeft(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-400)' }}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span>Rifila Lato Destro</span>
                      <span style={{ color: 'var(--gold-300)' }}>{cropRight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={cropRight}
                      onChange={e => setCropRight(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-400)' }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Cornici Virtuali da Galleria */}
            {activeTab === 'frame' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Applica una cornice virtuale realistica per mostrare al cliente o gallerista l'opera già ambientata:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button 
                    className={`btn ${frameType === 'none' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFrameType('none')}
                    style={{ padding: '0.85rem' }}
                  >
                    Bordi a Giorno (Nessuna Cornice)
                  </button>

                  <button 
                    className={`btn ${frameType === 'gold' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFrameType('gold')}
                    style={{ padding: '0.85rem' }}
                  >
                    👑 Cornice Dorata Barocca
                  </button>

                  <button 
                    className={`btn ${frameType === 'black' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFrameType('black')}
                    style={{ padding: '0.85rem' }}
                  >
                    ⬛ Cornice Nera Contemporanea
                  </button>

                  <button 
                    className={`btn ${frameType === 'wood' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFrameType('wood')}
                    style={{ padding: '0.85rem' }}
                  >
                    🪵 Cornice Noce / Legno Caldo
                  </button>

                  <button 
                    className={`btn ${frameType === 'passepartout' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFrameType('passepartout')}
                    style={{ gridColumn: 'span 2', padding: '0.85rem' }}
                  >
                    🖼️ Passe-partout Avorio Museale + Bordo Legno
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  ✨ <em>Nota:</em> Salvando l'immagine con una cornice attiva, la cornice verrà inclusa nel file salvato e comparirà anche nelle schede stampabili e nel catalogo!
                </div>
              </div>
            )}

            {/* TAB 4: Filtri Rapidi Studio d'Arte */}
            {activeTab === 'filters' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => applyPreset('vivid')}
                  style={{ flexDirection: 'column', padding: '1rem', height: 'auto', gap: '0.3rem' }}
                >
                  <Sparkles size={20} color="#f59e0b" />
                  <span style={{ fontWeight: 600 }}>Colori Vivi & Brillanti</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+Contrasto e risalto tinte</span>
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => applyPreset('clean')}
                  style={{ flexDirection: 'column', padding: '1rem', height: 'auto', gap: '0.3rem' }}
                >
                  <Sun size={20} color="#38bdf8" />
                  <span style={{ fontWeight: 600 }}>Luce Chiara Studio</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chiarifica dipinti opachi</span>
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => applyPreset('warm')}
                  style={{ flexDirection: 'column', padding: '1rem', height: 'auto', gap: '0.3rem' }}
                >
                  <Palette size={20} color="#d4af37" />
                  <span style={{ fontWeight: 600 }}>Tonalità Galleria Calda</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Atmosfera classica ambrata</span>
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => applyPreset('bw')}
                  style={{ flexDirection: 'column', padding: '1rem', height: 'auto', gap: '0.3rem' }}
                >
                  <Contrast size={20} color="#e2e8f0" />
                  <span style={{ fontWeight: 600 }}>Monocromo Fine Art</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Disegni, carboncini e chine</span>
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => applyPreset('vintage')}
                  style={{ gridColumn: 'span 2', flexDirection: 'column', padding: '1rem', height: 'auto', gap: '0.3rem' }}
                >
                  <Frame size={20} color="#c29929" />
                  <span style={{ fontWeight: 600 }}>Patina d'Epoca Sec. XIX</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ideale per restauri antichi e tele storiche</span>
                </button>
              </div>
            )}

            {/* TAB 5: Watermark / Firma Digitale Opzionale */}
            {activeTab === 'watermark' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={useWatermark}
                    onChange={e => setUseWatermark(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold-400)' }}
                  />
                  <span style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                    Applica firma o filigrana discreta in basso a destra
                  </span>
                </label>

                <div className="form-group">
                  <label className="form-label">Testo Filigrana</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={watermarkText}
                    onChange={e => setWatermarkText(e.target.value)}
                    placeholder="es. © Nome Artista / Bottega"
                    disabled={!useWatermark}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Trasparenza Filigrana</label>
                    <span style={{ color: 'var(--gold-300)' }}>{watermarkOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="100" 
                    value={watermarkOpacity}
                    onChange={e => setWatermarkOpacity(Number(e.target.value))}
                    disabled={!useWatermark}
                    style={{ width: '100%', accentColor: 'var(--gold-400)', marginTop: '4px' }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  🛡️ Protegge le immagini delle tue opere dal download non autorizzato quando le condividi sui social o con intermediari.
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Modal */}
        <div className="modal-footer editor-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={handleSave} id="btn-save-edited-image">
            <Check size={18} />
            <span>Applica & Salva Foto</span>
          </button>
        </div>

      </div>
    </div>
  );
};
