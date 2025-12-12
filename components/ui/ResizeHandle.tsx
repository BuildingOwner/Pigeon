'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function ResizeHandle({ onResize, direction = 'horizontal', className }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos(direction === 'horizontal' ? e.clientX : e.clientY);
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;

    if (delta !== 0) {
      onResize(delta);
      setStartPos(currentPos);
    }
  }, [isDragging, startPos, direction, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'flex-shrink-0 transition-colors relative group',
        direction === 'horizontal'
          ? 'w-1 cursor-col-resize'
          : 'h-1 cursor-row-resize',
        className
      )}
    >
      {/* 호버/드래그 시 하이라이트 영역 */}
      <div
        className={cn(
          'absolute transition-all',
          direction === 'horizontal'
            ? 'inset-y-0 -inset-x-1 group-hover:bg-primary-200'
            : 'inset-x-0 -inset-y-1 group-hover:bg-primary-200',
          isDragging && 'bg-primary-300'
        )}
      />
      {/* 중앙 인디케이터 */}
      <div
        className={cn(
          'absolute bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
          direction === 'horizontal'
            ? 'w-1 h-8 left-0 top-1/2 -translate-y-1/2'
            : 'h-1 w-8 top-0 left-1/2 -translate-x-1/2',
          isDragging && 'opacity-100 bg-primary-400'
        )}
      />
    </div>
  );
}
