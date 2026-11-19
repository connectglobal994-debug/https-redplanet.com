import { NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  category: string;
}

export async function GET() {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ articles: [], status: 'not_configured' }, { status: 503 });
  }
  try {
    const rows = await supabaseAdmin<ArticleRow[]>(
      'news_articles?select=id,title,summary,url,source,published_at,category&published=eq.true&order=published_at.desc&limit=40'
    );
    return NextResponse.json({
      articles: rows.map((row) => ({
        title: row.title,
        summary: row.summary,
        url: row.url,
        source: row.source,
        publishedAt: row.published_at,
        category: row.category,
      })),
      status: 'ok',
    });
  } catch (error) {
    console.error('News feed retrieval failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ articles: [], status: 'unavailable' }, { status: 503 });
  }
}
