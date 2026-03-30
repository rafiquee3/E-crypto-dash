/* eslint-disable no-console */
export function onRenderCallback(
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
) {
    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`[Profiler] ${id} - ${phase}`);
        console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
        console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
        console.log(`Commit time: ${commitTime.toFixed(2)}ms`);
        console.groupEnd();
    }
}
