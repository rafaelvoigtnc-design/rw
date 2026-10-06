import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar promocional para obter campos do formulário
    const promocionalRef = doc(db, 'promocionais', params.id);
    const promocionalSnap = await getDoc(promocionalRef);

    if (!promocionalSnap.exists()) {
      return NextResponse.json(
        { error: 'Promocional não encontrado' },
        { status: 404 }
      );
    }

    const promocional = promocionalSnap.data();
    const campos_formulario = promocional.campos_formulario || [];

    // Buscar participantes
    const q = query(
      collection(db, 'participacoes_promocional'),
      where('promocional_id', '==', params.id)
    );
    const snapshot = await getDocs(q);
    const participantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Criar planilha dinâmica
    const worksheetData: any[] = [];

    // Cabeçalho
    const headers = ['Nome Cliente', 'Data Participação'];
    campos_formulario.forEach((campo: any) => {
      headers.push(campo.nome_campo);
    });
    worksheetData.push(headers);

    // Linhas de dados
    participantes.forEach((participante: any) => {
      const row = [
        participante.cliente_nome || '',
        new Date(participante.data_participacao).toLocaleString('pt-BR'),
      ];

      campos_formulario.forEach((campo: any) => {
        const valor = participante.dados_participacao?.[campo.nome_campo] || '';
        row.push(valor);
      });

      worksheetData.push(row);
    });

    // Criar workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes');

    // Gerar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Retornar arquivo
    return new NextResponse(buffer as Buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="participantes-${params.id}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar participantes:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar participantes' },
      { status: 500 }
    );
  }
}
