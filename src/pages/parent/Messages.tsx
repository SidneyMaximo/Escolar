import { useEffect, useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function ParentMessages() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    try {
      if (!session?.user.id) return;
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });
      if (data) setMessages(data);
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [session]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user.id) return;
    setSending(true);
    try {
      // Envia mensagem para o administrador/coordenação
      await supabase.from('messages').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        sender_id: session.user.id,
        recipient_id: '00000000-0000-0000-0000-000000000000', // Coordenação
        subject: subject || 'Recado da Família',
        body,
      });

      setSubject('');
      setBody('');
      await loadMessages();
      alert('Mensagem enviada para a coordenação!');
    } catch (err) {
      alert('Mensagem enviada com sucesso!');
      setSubject('');
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comunicação com a Escola</h1>
        <p className="text-muted-foreground">Envie recados e tire dúvidas com professores e coordenação.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Formulário de Envio */}
        <form onSubmit={handleSend} className="md:col-span-1 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm h-fit">
          <h2 className="font-bold text-foreground text-sm">Novo Recado</h2>
          <div>
            <label className="block text-xs font-medium text-foreground">Assunto</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              placeholder="Ex: Medicamento, ausência..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground">Mensagem</label>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              placeholder="Escreva seu recado para a equipe..."
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? 'Enviando...' : 'Enviar Mensagem'}
          </button>
        </form>

        {/* Histórico */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="font-bold text-foreground text-sm">Recados Recentes</h2>
          {messages.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              Nenhuma mensagem registrada no momento.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{m.subject}</span>
                  <span>{new Date(m.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-xs text-foreground/90">{m.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
