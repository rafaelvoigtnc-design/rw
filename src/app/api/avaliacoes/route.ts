import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('avaliacao')
      .select(`
        *,
        cliente (
          nome
        )
      `)
      .eq('aprovado_para_exibir', true)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const { brinquedoId, nota, texto, foto } = await request.json();

    const { data, error } = await supabase
      .from('avaliacao')
      .insert({
        id: crypto.randomUUID(),
        cliente_id: clienteId,
        brinquedo_id: brinquedoId,
        nota,
        texto,
        foto: foto || null,
        aprovado_para_exibir: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    );
  }
}
