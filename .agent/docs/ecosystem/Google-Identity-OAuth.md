---
title: Google-Identity-OAuth
url: https://developers.google.com/identity/gsi/web/guides/display-button
updated: 2026-01-21T03:17:05.980Z
method: Puppeteer Deep Scrape
---

Os Serviços de Identificação do Google estão migrando para as APIs FedCM. Siga o [guia de migração](https://developers.google.com/identity/gsi/web/guides/fedcm-migration?hl=pt-br) para analisar possíveis mudanças e evitar impactos negativos para o login do usuário no seu site.

*   [Página inicial](https://developers.google.com/?hl=pt-br)
*   [Produtos](https://developers.google.com/products?hl=pt-br)
*   [Google Identity](https://developers.google.com/identity?hl=pt-br)
*   [Authentication](https://developers.google.com/identity/authentication?hl=pt-br)

Isso foi útil?

Exibir o botão Fazer login com o Google Mantenha tudo organizado com as coleções Salve e categorize o conteúdo com base nas suas preferências.
==============================================================================================================================================

*   Nesta página
*   [Pré-requisitos](#prerequisites)
*   [Renderização do botão](#button_rendering)
    *   [Idioma do botão](#button_language)
*   [Processamento de credenciais](#credential_handling)
    *   [Modo pop-up](#popup_mode)
    *   [Modo de redirecionamento](#redirect_mode)
    *   [URI do endpoint de login](#your_login_endpoint_uri)

Adicione um botão "Fazer login com o Google" ao seu site para permitir que os usuários se inscrevam ou façam login no seu app da Web. Use HTML ou JavaScript para renderizar o botão e os atributos para personalizar a forma, o tamanho, o texto e o tema do botão.

![Botão de login personalizado.](https://developers.google.com/static/identity/gsi/web/images/personalized-button-single.png?hl=pt-br)

Depois que um usuário seleciona uma Conta do Google e dá o consentimento, o Google compartilha o perfil do usuário usando um JSON Web Token (JWT). Para ter uma visão geral das etapas envolvidas durante o login e a experiência do usuário, consulte [Como funciona](https://developers.google.com/identity/gsi/web/guides/overview?hl=pt-br#how_it_works). [Entenda o botão personalizado](https://developers.google.com/identity/gsi/web/guides/personalized-button?hl=pt-br) analisa as diferentes condições e estados que afetam a exibição do botão para os usuários.

Pré-requisitos
--------------

Siga as etapas descritas em [Configuração](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid?hl=pt-br) para configurar a tela de consentimento OAuth, receber um ID do cliente e carregar a biblioteca de cliente.

Renderização do botão
---------------------

Para mostrar o botão "Fazer login com o Google", você pode escolher HTML ou JavaScript para renderizar o botão na página de login:

[HTML](#html)[JavaScript](#javascript)

Renderize o botão de login usando HTML, retornando o JWT para o endpoint de login da plataforma.

<html>
      <body>
        <script src="https://accounts.google.com/gsi/client" async></script>
        <div id="g_id_onload"
            data-client_id="YOUR_GOOGLE_CLIENT_ID"
            data-login_uri="https://your.domain/your_login_endpoint"
            data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left">
        </div>
      <body>
    </html>

Um elemento com uma classe `g_id_signin` é renderizado como um botão "Fazer login com o Google". O botão é personalizado pelos parâmetros fornecidos nos atributos de dados.

Para mostrar um botão "Fazer login com o Google" e o Google One Tap na mesma página, remova `data-auto_prompt="false"`. Isso é recomendado para reduzir o atrito e melhorar as taxas de login.

Para conferir a lista completa de atributos de dados, consulte a página de [referência do `g_id_signin`](https://developers.google.com/identity/gsi/web/reference/html-reference?hl=pt-br#element_with_class_g_id_signin).

Renderize o botão de login usando JavaScript, retornando o JWT para o gerenciador de callback JavaScript do navegador.

<html>
      <body>
        <script src="https://accounts.google.com/gsi/client" async></script>
        <script>
          function handleCredentialResponse(response) {
            console.log("Encoded JWT ID token: " + response.credential);
          }
          window.onload = function () {
            google.accounts.id.initialize({
              client_id: "YOUR_GOOGLE_CLIENT_ID"
              callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
              document.getElementById("buttonDiv"),
              { theme: "outline", size: "large" }  // customization attributes
            );
            google.accounts.id.prompt(); // also display the One Tap dialog
          }
        </script>
        <div id="buttonDiv"></div>
      </body>
    </html>

O elemento especificado como o primeiro parâmetro para `renderButton` é exibido como um botão "Fazer login com o Google". Neste exemplo, `buttonDiv` é usado para renderizar o botão na página. O botão é personalizado usando os atributos especificados no segundo parâmetro para `renderButton`.

Para minimizar a fricção do usuário, `google.accounts.id.prompt()` é chamado para mostrar o recurso Um toque como uma segunda alternativa ao uso do botão para inscrição ou login.

A biblioteca GIS analisa o documento HTML em busca de elementos com um atributo ID definido como `g_id_onload` ou atributos de classe que contêm `g_id_signin`. Se um elemento correspondente for encontrado, o botão será renderizado usando HTML, mesmo que você também tenha renderizado o botão em JavaScript. Para evitar que o botão seja mostrado duas vezes, possivelmente com parâmetros conflitantes, não inclua elementos HTML que correspondam a esses nomes nas páginas HTML.

### Idioma do botão

O idioma do botão é determinado automaticamente pelo idioma padrão do navegador ou pela preferência do usuário da sessão do Google. Também é possível escolher o idioma manualmente adicionando o parâmetro `hl` e o código de idioma à diretiva src ao carregar a biblioteca e adicionando o parâmetro opcional data-locale ou locale [data-locale](https://developers.google.com/identity/gsi/web/reference/html-reference?hl=pt-br#data-locale) em HTML ou [locale](https://developers.google.com/identity/gsi/web/reference/html-reference?hl=pt-br#data-locale) em JavaScript.

[HTML](#html)[JavaScript](#javascript)

O snippet de código abaixo mostra como exibir o idioma do botão em francês adicionando o parâmetro `hl` ao URL da biblioteca de cliente e definindo o atributo `data-locale` como francês:

<script src="https://accounts.google.com/gsi/client?hl=fr" async></script>
    <div class="g_id_signin" data-locale="fr">
    </div>

O snippet de código a seguir mostra como exibir o idioma do botão em francês adicionando o parâmetro `hl` ao URL da biblioteca de cliente e chamando o método `google.accounts.id.renderButton` com o parâmetro `locale` definido como francês:

<script src="https://accounts.google.com/gsi/client?hl=fr" async></script>
    <script>
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { locale: "fr" }
      );
    </script>

Processamento de credenciais
----------------------------

Depois que o usuário dá consentimento, o Google retorna uma credencial JSON Web Token (JWT), conhecida como um token de ID, para o navegador do usuário ou diretamente para um endpoint de login hospedado pela sua plataforma.

O local escolhido para receber o JWT depende se você renderiza o botão usando HTML ou JavaScript e se o modo de UX de pop-up ou redirecionamento é usado.

### Modo pop-up

O uso do modo de UX `popup` executa o fluxo de UX de login em uma janela pop-up. Essa é geralmente uma experiência menos intrusiva para os usuários e é o modo de UX padrão.

Ao renderizar o botão usando:

[HTML](#html)[JavaScript](#javascript)

É possível definir:

*   `data-callback` para retornar o JWT ao gerenciador de callback ou
*   `data-login_uri` para que o Google envie o JWT diretamente para seu endpoint de login usando uma [solicitação POST](https://developers.google.com/identity/gsi/web/reference/html-reference?hl=pt-br#server-side).

Se ambos os valores forem definidos, `data-callback` terá precedência sobre `data-login_uri`. Definir os dois valores pode ser útil ao usar um manipulador de callback para depuração.

É necessário especificar um `callback`. O modo pop-up não oferece suporte a redirecionamentos ao renderizar o botão em JavaScript. Se definido, `login_uri` será ignorado.

Consulte [Processar a resposta de credencial retornada](https://developers.google.com/identity/gsi/web/guides/handle-credential-responses-js-functions?hl=pt-br) para mais informações sobre como decodificar o JWT no seu manipulador de callback do JS.

### Modo de redirecionamento

O uso do modo de UX `redirect` executa o fluxo de UX de login usando o redirecionamento de página inteira do navegador do usuário, e o Google retorna o JWT diretamente para o endpoint de login usando uma [solicitação POST](https://developers.google.com/identity/gsi/web/reference/html-reference?hl=pt-br#server-side). Em geral, essa é uma experiência mais intrusiva para os usuários, mas é considerada o método de login mais seguro.

Ao renderizar o botão usando:

*   **HTML**: defina `data-login_uri` como o URI do endpoint de login (opcional).
*   O **JavaScript** pode definir `login_uri` como o URI do endpoint de login.

Se você não fornecer um valor, o Google vai retornar o JWT para o URI da página atual.

### URI do endpoint de login

Use HTTPS e um URI absoluto ao definir `data-login_uri` ou `login_uri`. Por exemplo, `https://example.com/path`.

O HTTP só é permitido ao usar localhost durante o desenvolvimento: `http://localhost/path`.

Consulte [Usar origens seguras do JavaScript e redirecionar URIs](https://developers.google.com/identity/protocols/oauth2/policies?hl=pt-br#secure-response-handling) para uma descrição completa dos requisitos e regras de validação do Google.

Isso foi útil?