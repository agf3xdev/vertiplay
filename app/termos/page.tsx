import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — Vertiplay",
  description: "Regras de uso do aplicativo Vertiplay.",
};

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] px-5 pt-10 pb-20 safe-top">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-white/65 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-extrabold mb-2">Termos de Uso</h1>
      <p className="text-xs text-white/55 mb-8">
        Última atualização: 24 de maio de 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-white/85">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Aceitação</h2>
          <p>
            Ao criar conta ou usar o Vertiplay, você concorda integralmente com
            estes Termos e com nossa{" "}
            <Link href="/privacidade" className="underline text-[var(--color-vp-pink)]">
              Política de Privacidade
            </Link>
            . Se não concordar, não use o aplicativo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. O serviço</h2>
          <p>
            O Vertiplay é uma plataforma de mini-novelas verticais sob demanda,
            com episódios curtos (60-75 segundos), modelo freemium: parte do
            conteúdo é gratuita, parte é desbloqueada com moedas virtuais
            (&quot;Coins Vertiplay&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Moedas Vertiplay</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              São créditos virtuais para uso exclusivo dentro do app, sem valor
              monetário fora dele.
            </li>
            <li>Não são reembolsáveis nem transferíveis em dinheiro.</li>
            <li>
              Podem ser presenteadas a outros usuários através do recurso
              &quot;Presentear&quot;.
            </li>
            <li>
              Não têm prazo de validade enquanto sua conta estiver ativa.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Loja parceira</h2>
          <p>
            O Vertiplay exibe produtos físicos de marcas patrocinadoras dentro
            das séries. As compras são processadas pela marca parceira e a
            entrega, devolução e troca seguem as políticas dela. O Vertiplay
            atua como vitrine, não como vendedor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Conteúdo do usuário (UGC)</h2>
          <p>
            Ao enviar uma história pelo formulário &quot;Conte sua História&quot;, você
            declara que é o autor e nos concede licença não exclusiva, mundial e
            gratuita para avaliá-la, adaptá-la e produzi-la como série caso seja
            selecionada. Em caso de produção, negociaremos crédito autoral e
            eventual compensação caso a caso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Conduta proibida</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tentar burlar pagamentos ou sistema de moedas.</li>
            <li>Compartilhar credenciais de acesso.</li>
            <li>Assediar ou ameaçar outros usuários.</li>
            <li>
              Reproduzir, copiar ou redistribuir conteúdo das séries fora do
              app.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Suspensão e exclusão</h2>
          <p>
            Podemos suspender ou excluir contas que violem estes Termos, sem
            reembolso de moedas. Você também pode excluir sua conta a qualquer
            momento — saiba mais na nossa Política de Privacidade.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Limitação de responsabilidade</h2>
          <p>
            O Vertiplay é fornecido &quot;como está&quot;. Faremos nosso melhor para
            manter o serviço disponível, mas não garantimos disponibilidade
            ininterrupta. Não nos responsabilizamos por danos indiretos
            decorrentes do uso do app.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">9. Lei aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do
            Brasil. Fica eleito o foro da Comarca de Rio de Janeiro/RJ para
            dirimir qualquer controvérsia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">10. Contato</h2>
          <p>
            Dúvidas?{" "}
            <a
              href="mailto:vertiplay@diogoarchanjo.com.br"
              className="underline text-[var(--color-vp-pink)]"
            >
              vertiplay@diogoarchanjo.com.br
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
