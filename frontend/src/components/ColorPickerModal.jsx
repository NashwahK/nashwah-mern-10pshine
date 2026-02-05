import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#FBBF24' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Black', hex: '#000000' },
];

export default function ColorPickerModal({ isOpen, onClose, onSubmit, title, type = 'text' }) {
  const [color, setColor] = useState('#000000');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setColor('#000000');
      setCopied(false);
    }
  }, [isOpen]);

  const handleRemoveColor = () => {
    onSubmit(null);
    onClose();
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handlePresetColor = (presetColor) => {
    setColor(presetColor);
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (color) {
      onSubmit(color);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Calculate positions for circular palette
  const radius = 120;
  const colors = PRESET_COLORS.map((color, index) => {
    const angle = (index / PRESET_COLORS.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { ...color, x, y };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Pick a color from the palette</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Circular Color Palette */}
        <div className="flex flex-col items-center gap-12">
          {/* Color Wheel */}
          <div className="relative w-80 h-80 mx-auto">
            {/* Circular Gradient Background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-700 dark:to-zinc-800 shadow-inner" />
            
            {/* Color Buttons Arranged in Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              {colors.map((colorData, index) => (
                <button
                  key={colorData.hex}
                  type="button"
                  onClick={() => handlePresetColor(colorData.hex)}
                  title={colorData.name}
                  className={`absolute w-14 h-14 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-125 border-4 ${
                    color.toUpperCase() === colorData.hex.toUpperCase()
                      ? 'border-zinc-900 dark:border-white ring-4 ring-zinc-900 dark:ring-white'
                      : 'border-white dark:border-zinc-700'
                  }`}
                  style={{
                    backgroundColor: colorData.hex,
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${colorData.x}px), calc(-50% + ${colorData.y}px))`,
                  }}
                >
                  <span className="sr-only">{colorData.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Section */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                  Custom Hex
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith('#')) val = val.slice(1);
                      if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setColor('#' + val.padEnd(6, '0'));
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 px-4 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition"
                  >
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                  Preview
                </label>
                <div
                  className="w-16 h-10 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 shadow-md"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>

            {/* Action Buttons - Centered */}
            <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700 justify-center">
              {type === 'text' && (
                <button
                  type="button"
                  onClick={handleRemoveColor}
                  className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-200 dark:border-red-800"
                >
                  Remove Color
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
              >
                Apply Color
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
