import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Tentar atualizar um brinquedo existente para verificar se o campo existe
    const { data: testBrinquedo, error: testError } = await supabaseAdmin
      .from('brinquedo')
      .select('id')
      .limit(1)
      .single();

    if (testError && testError.code === 'PGRST116') {
      // Nenhum brinquedo encontrado, não podemos testar
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhum brinquedo encontrado. Execute o SQL manualmente: ALTER TABLE brinquedo ADD COLUMN IF NOT EXISTS mostrar_home BOOLEAN DEFAULT false;' 
      });
    }

    if (testBrinquedo) {
      // Tentar atualizar com o campo mostrar_home
      const { error: updateError } = await supabaseAdmin
        .from('brinquedo')
        .update({ mostrar_home: false })
        .eq('id', testBrinquedo.id);

      if (updateError && updateError.message.includes('column')) {
        // Campo não existe, retornar instruções para execução manual
        return NextResponse.json({ 
          success: false, 
          message: 'Campo mostrar_home não existe. Execute o SQL manualmente no painel do Supabase: ALTER TABLE brinquedo ADD COLUMN IF NOT EXISTS mostrar_home BOOLEAN DEFAULT false;' 
        });
      }

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({ success: true, message: 'Campo mostrar_home configurado com sucesso' });
  } catch (error) {
    console.error('Erro ao configurar campo mostrar_home:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao configurar campo mostrar_home', 
        details: error instanceof Error ? error.message : String(error),
        sqlInstruction: 'Execute no painel do Supabase: ALTER TABLE brinquedo ADD COLUMN IF NOT EXISTS mostrar_home BOOLEAN DEFAULT false;'
      },
      { status: 500 }
    );
  }
}
