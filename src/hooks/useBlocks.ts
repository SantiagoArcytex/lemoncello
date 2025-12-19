import { useCallback, useEffect } from 'react';
import { TimerBlock, DEFAULT_BLOCKS } from '@/types/blocks';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useBlocks() {
  const [blocks, setBlocks] = useLocalStorage<TimerBlock[]>('lemoncello-blocks', []);

  useEffect(() => {
    if (blocks.length === 0) {
      const defaultBlocksWithIds: TimerBlock[] = DEFAULT_BLOCKS.map(block => ({
        ...block,
        id: generateId(),
        createdAt: new Date(),
      }));
      setBlocks(defaultBlocksWithIds);
    }
  }, [blocks.length, setBlocks]);

  const addBlock = useCallback((block: Omit<TimerBlock, 'id' | 'createdAt'>) => {
    const newBlock: TimerBlock = {
      ...block,
      id: generateId(),
      createdAt: new Date(),
    };
    setBlocks(prev => [...prev, newBlock]);
    return newBlock;
  }, [setBlocks]);

  const updateBlock = useCallback((id: string, updates: Partial<Omit<TimerBlock, 'id' | 'createdAt'>>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  }, [setBlocks]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, [setBlocks]);

  const getBlockById = useCallback((id: string) => {
    return blocks.find(block => block.id === id);
  }, [blocks]);

  return {
    blocks,
    addBlock,
    updateBlock,
    deleteBlock,
    getBlockById,
  };
}
