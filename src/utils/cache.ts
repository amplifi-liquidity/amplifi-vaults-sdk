import NodeCache from 'node-cache';

// NodeCache TTL arguments are seconds, not milliseconds.
const cache = new NodeCache();

export default cache;
