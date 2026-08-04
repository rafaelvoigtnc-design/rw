'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageEditor({ imageUrl, onSave, onCancel, aspectRatio = 16/9 }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem com crop
    if (imageRef.current) {
      const img = imageRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.scale(scale, scale);
      ctx.translate(position.x, position.y);
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
    }

    // Converter para URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImageUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 800 / aspectRatio;
  }, [aspectRatio]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Imagem</h2>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {scale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={handleZoom}
                className="w-full"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Arraste a imagem para posicionar. Use o zoom para ajustar o tamanho.
          </div>
        </div>

        <div className="p-6 bg-gray-100 overflow-auto">
          <div
            className="relative inline-block border-2 border-dashed border-gray-400 bg-white"
            style={{ width: 800, height: 800 / aspectRatio }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Preview"
              className="absolute"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                const canvas = canvasRef.current;
                if (!canvas) return;
                
                // Centralizar imagem inicialmente
                const scaleX = canvas.width / img.width;
                const scaleY = canvas.height / img.height;
                const initialScale = Math.max(scaleX, scaleY) * 0.8;
                setScale(initialScale);
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
