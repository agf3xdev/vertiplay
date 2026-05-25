import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — Vertiplay",
  description: "Como o Vertiplay coleta, usa e protege seus dados pessoais.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] px-5 pt-10 pb-20 safe-top">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-white/65 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-extrabold mb-2">Política de Privacidade</h1>
      <p className="text-xs text-white/55 mb-8">
        Última atualização: 24 de maio de 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-white/85">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Quem somos</h2>
          <p>
            O Vertiplay (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Vertiplay&quot;) é um aplicativo de
            mini-novelas verticais operado pela{" "}
            <b>AGENCIA F3X CONSULTORIA DESENVOLVIMENTO MARKETING E PROPAGANDA LTDA</b>,
            CNPJ a ser informado, sediada no Brasil. Esta política descreve como
            tratamos seus dados pessoais nos termos da Lei Geral de Proteção de
            Dados (LGPD - Lei 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b>Cadastro:</b> nome, email, foto de perfil (Google) ou apenas
              email (quando você usa login por código).
            </li>
            <li>
              <b>Uso do app:</b> séries assistidas, progresso de episódios,
              compras de moedas e desbloqueios, lista de amigos e presentes
              enviados.
            </li>
            <li>
              <b>Pagamento:</b> apenas o ID da transação. Os dados de cartão e
              PIX são processados diretamente pelas plataformas Stripe e Mercado
              Pago e <b>não trafegam por nossos servidores</b>.
            </li>
            <li>
              <b>Técnicos:</b> tipo de dispositivo, sistema operacional, idioma,
              endereço IP (apenas para segurança e prevenção a fraude).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Para que usamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Autenticar você e manter sua sessão ativa.</li>
            <li>Salvar seu progresso entre episódios e dispositivos.</li>
            <li>
              Processar compras de moedas, presentes e produtos da loja parceira.
            </li>
            <li>
              Permitir que você encontre amigos pelo email/username e envie
              presentes.
            </li>
            <li>
              Enviar emails transacionais (código de login, recibo de compra).
            </li>
            <li>Detectar abusos, fraudes e violações dos Termos de Uso.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Com quem compartilhamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b>Google</b> — quando você opta por login com Google.
            </li>
            <li>
              <b>Stripe e Mercado Pago</b> — para processar pagamentos.
            </li>
            <li>
              <b>Resend</b> — para envio do código de verificação por email.
            </li>
            <li>
              <b>DigitalOcean e Cloudflare</b> — provedores de hospedagem e CDN.
            </li>
            <li>
              <b>Marcas parceiras</b> — apenas dados de entrega quando você
              compra um produto da loja patrocinadora (nome e endereço).
            </li>
          </ul>
          <p className="mt-2">
            <b>Nunca vendemos seus dados</b> a terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Seus direitos (LGPD)</h2>
          <p>Você pode, a qualquer momento:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Confirmar quais dados temos sobre você;</li>
            <li>Acessar, corrigir ou atualizar seus dados;</li>
            <li>Solicitar a exclusão da sua conta e dos dados associados;</li>
            <li>
              Revogar consentimentos previamente dados (como o consentimento de
              uso da sua história enviada pelo formulário UGC).
            </li>
          </ul>
          <p className="mt-2">
            Para exercer qualquer direito, envie um email para{" "}
            <a
              href="mailto:vertiplay@diogoarchanjo.com.br"
              className="underline text-[var(--color-vp-pink)]"
            >
              vertiplay@diogoarchanjo.com.br
            </a>
            . Respondemos em até 15 dias.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Crianças e adolescentes</h2>
          <p>
            O Vertiplay é destinado a maiores de 12 anos. Conteúdo com cenas de
            romance e drama é classificado como inadequado para menores de 12.
            Não coletamos dados de crianças intencionalmente; se identificarmos
            uma conta de menor, ela será removida.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Segurança</h2>
          <p>
            Usamos HTTPS em todo o tráfego, senhas e códigos OTP com hash
            SHA-256, sessões JWT assinadas e validação HMAC em todos os webhooks
            de pagamento. Apesar disso, nenhum sistema é 100% seguro — caso
            ocorra um incidente, comunicaremos você e a ANPD nos prazos legais.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Retenção</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após a
            exclusão, removemos os dados em até 30 dias, exceto aqueles que a
            lei nos obriga a guardar (transações financeiras: 5 anos).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">9. Alterações</h2>
          <p>
            Podemos atualizar esta política. Sempre que houver mudança
            significativa, avisaremos via email ou tela do app. A data no topo
            indica a última versão.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">10. Contato e Encarregado (DPO)</h2>
          <p>
            Encarregado pelo tratamento de dados:{" "}
            <b>Diogo Archanjo Ferreira</b>
            <br />
            Email:{" "}
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
