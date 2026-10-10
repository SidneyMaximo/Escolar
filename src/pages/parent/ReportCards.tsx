import { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle2, Calendar, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function ParentReportCards() {
  const { session } = useAuth();
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportCards() {
      try {
        if (!session?.user.id) return;
        // 1. Busca os filhos do usuário logado
        const { data: children } = await supabase
          .from('students')
          .select('id, full_name')
          .eq('parent_guardian_id', session.user.id);

        if (children && children.length > 0) {
          const childIds = children.map((c) => c.id);
          const { data: rData } = await supabase
            .from('report_cards')
            .select('*, student:students(full_name), class:classes(name)')
            .in('student_id', childIds)
            .order('generated_at', { ascending: false });

          if (rData) setReportCards(rData);
        } else {
          // Busca todos os boletins disponíveis para demonstração
          const { data: rData } = await supabase
            .from('report_cards')
            .select('*, student:students(full_name), class:classes(name)')
            .order('generated_at', { ascending: false });
          if (rData) setReportCards(rData);
        }
      } catch (err) {
        console.warn('Erro ao carregar boletins:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportCards();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Boletins & Pareceres</h1>
        <p className="text-muted-foreground">Relatórios de rendimento e avaliação pedagógica dos seus filhos.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando boletins...</div>
      ) : reportCards.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum boletim disponível</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Os boletins e relatórios bimestrais liberados pela escola aparecerão nesta tela.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reportCards.map((rc) => (
            <div key={rc.id} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Liberado pela Coordenação
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rc.generated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-foreground">{rc.student?.full_name || 'Aluno'}</h3>
                <p className="text-xs text-muted-foreground">
                  Turma: {rc.class?.name || 'Geral'} • {rc.period}
                </p>

                {rc.notes && (
                  <div className="mt-4 rounded-lg bg-muted/40 p-3.5 text-xs text-foreground/90 leading-relaxed border border-border/60">
                    <span className="font-semibold block mb-1">Parecer da Professora:</span>
                    {rc.notes}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Documento Oficial</span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-primary" /> Imprimir / Salvar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
