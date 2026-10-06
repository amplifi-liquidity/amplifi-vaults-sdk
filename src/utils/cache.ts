import NodeCache from 'node-cache';

// NodeCache TTLs are in seconds.
export const TTL_2M = 2 * 60;
export const TTL_30M = 30 * 60;
export const TTL_1H = 60 * 60;
export const TTL_6H = 6 * 60 * 60;
export const TTL_24H = 24 * 60 * 60;

const cache = new NodeCache();

export default cache;
