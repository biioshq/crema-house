import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect that stays quiet during SSR. Every measurement-driven
 * animation in the site uses this so first paint is never a flash of
 * un-animated content.
 */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
