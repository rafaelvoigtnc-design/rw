import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Testar conexão básica
    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .select('id, nome')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão OK',
      data: data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
