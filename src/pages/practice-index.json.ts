import type { APIRoute } from 'astro';
import original from '../../data/questions/original.json';
import pyq from '../../data/questions/pyq.json';

export const GET: APIRoute = async () => {
  const all = [...(original as unknown[]), ...(pyq as unknown[])];
  return new Response(JSON.stringify(all), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
};
