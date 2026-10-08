import { ingest, json } from '../../server/analytics.js';
export const onRequestGet = ({ env }) => json({ enabled: Boolean(env.ANALYTICS_DB && env.ANALYTICS_ADMIN_TOKEN) });
export const onRequestPost = ingest;
