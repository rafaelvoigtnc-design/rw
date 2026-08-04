import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const { error } = await supabase
      .from('carrinho_item')
      .delete()
      .eq('id', params.id)
      .eq('cliente_id', clienteId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    return NextResponse.json(
      { error: 'Erro ao remover do carrinho' },
      { status: 500 }
    );
  }
}
