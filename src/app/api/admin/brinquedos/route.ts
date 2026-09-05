import { NextResponse } from 'next/server';
import { getAllBrinquedos, createBrinquedo } from '@/lib/firebase-db';

export async function GET() {
  try {
    const brinquedos = await getAllBrinquedos();
    return NextResponse.json(brinquedos);
  } catch (error) {
    console.error('Erro ao buscar brinquedos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Dados recebidos:', body);

    const {
      nome,
      descricao,
      fotos,
      dimensoes,
      faixa_etaria,
      status,
      categoria_id,
      preco_periodo,
      tema_layout
    } = body;

    // Validar campos obrigatórios
    if (!nome || !descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Dados para salvar no Firebase
    const brinquedoData = {
      nome: String(nome),
      descricao: String(descricao),
      fotos: Array.isArray(fotos) ? fotos : (fotos || []),
      tema_layout: String(tema_layout || 'CLASSICO_DIVERTIDO'),
      dimensoes: String(dimensoes || ''),
      faixa_etaria: String(faixa_etaria || ''),
      status: String(status || 'DISPONIVEL'),
      categoria_id: categoria_id || null,
      preco_periodo: Number(preco_periodo) || 0,
      mostrar_home: false,
    };

    console.log('Dados para inserir:', brinquedoData);

    const data = await createBrinquedo(brinquedoData);

    console.log('Brinquedo criado com sucesso:', data);
    return NextResponse.json({ id: data.id, ...brinquedoData });
  } catch (error) {
    console.error('Erro ao criar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar brinquedo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
