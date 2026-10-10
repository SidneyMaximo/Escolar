import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: 'Qual a idade mínima para matrícula?',
    answer: 'Aceitamos crianças a partir de 6 meses para o berçário e de 2 anos para a educação infantil.',
  },
  {
    question: 'Quais são os horários de funcionamento?',
    answer: 'Funcionamos de segunda a sexta, das 7h às 18h. Oferecemos períodos integral, manhã e tarde.',
  },
  {
    question: 'Como é o processo de adaptação?',
    answer: 'Realizamos adaptação gradual com acompanhamento individualizado. A família participa ativamente nos primeiros dias para garantir conforto e segurança da criança.',
  },
  {
    question: 'A escola oferece alimentação?',
    answer: 'Sim, temos cardápio balanceado elaborado por nutricionista, com opções para restrições alimentares e alergias.',
  },
  {
    question: 'Quais documentos são necessários para matrícula?',
    answer: 'Certidão de nascimento, comprovante de residência, cartão de vacinação, foto 3x4 e documentos dos responsáveis (RG, CPF e comprovante de renda).',
  },
  {
    question: 'Existe desconto para irmãos?',
    answer: 'Sim, oferecemos desconto progressivo a partir do segundo filho matriculado. Consulte nossa secretaria para valores.',
  },
  {
    question: 'Como funciona a comunicação entre pais e escola?',
    answer: 'Utilizamos agenda digital, aplicativo próprio e reuniões periódicas. Os pais recebem atualizações diárias sobre atividades e desenvolvimento.',
  },
  {
    question: 'A escola possui atividades extracurriculares?',
    answer: 'Oferecemos ballet, judô, natação, inglês e música como atividades complementares, inclusas ou com valor adicional conforme modalidade.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Perguntas Frequentes</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tire suas dúvidas sobre nossa escola
        </p>
      </div>

      <div className="mt-12 space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl border border-border bg-card transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180 text-primary'
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-border px-6 py-4">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl bg-primary/5 p-8 text-center">
        <p className="text-foreground">
          Ainda tem dúvidas?{' '}
          <a href="/contato" className="font-semibold text-primary hover:underline">
            Entre em contato conosco
          </a>
        </p>
      </div>
    </div>
  );
}