# Gerador de Personagens Dragon Ball

Este projeto é um aplicativo web que permite gerar personagens no estilo Dragon Ball. Ele oferece duas formas principais de geração: um personagem aleatório ou um personagem baseado em uma imagem que o usuário faz upload. A descrição da imagem é processada por um modelo de inteligência artificial (Gemini-2.0-flash) e, em seguida, essa descrição é usada por outro modelo de IA (Imagen-3.0-generate-002) para criar o personagem visual.

## Estrutura do Projeto

O projeto está organizado nos seguintes arquivos:

```
.
├── index.html
├── style.css
└── script.js
```

### `index.html`

Contém a estrutura principal da página web, incluindo os elementos visuais como o título, a área de exibição da imagem, os botões de ação e o input de upload de arquivo. Ele faz a ligação com os arquivos CSS e JavaScript.

### `style.css`

Responsável por toda a estilização e layout do aplicativo. Utiliza Tailwind CSS para classes utilitárias e estilos personalizados para garantir uma interface responsiva e agradável.

### `script.js`

Contém toda a lógica JavaScript do aplicativo, incluindo:

- Funções para interagir com as APIs de IA (Gemini 2.0 Flash para descrição de imagem e Imagen 3.0 para geração de imagem).
- Manipulação de eventos dos botões e do input de upload de arquivo.
- Gerenciamento dos estados de carregamento e exibição de erros.
- Lógica para armazenar a descrição da última imagem enviada para permitir a regeneração.

## Funcionalidades

- **Gerar Personagem Aleatório**: Gera um novo personagem Dragon Ball com base em um prompt genérico predefinido.
- **Upload de Imagem para Base**: Permite ao usuário fazer upload de uma imagem. O aplicativo analisa essa imagem para gerar uma descrição textual.
- **Gerar Novamente (Baseado na Imagem Enviada)**: Após o upload e a primeira geração de um personagem, este botão aparece. Ele permite gerar um novo personagem com base na *mesma descrição* da imagem previamente enviada, sem a necessidade de fazer o upload novamente.

## Como Usar

Para executar este projeto localmente, siga os passos abaixo:

1. **Clone o Repositório** (se estiver em um, ou baixe os arquivos diretamente):

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2. **Organize os Arquivos**: Certifique-se de que `index.html`, `style.css` e `script.js` estejam na mesma pasta raiz do projeto.
3. **Configuração da Chave de API**:
    - Este projeto utiliza as APIs do Google (Gemini 2.0 Flash e Imagen 3.0). As chamadas de API no `script.js` esperam que a chave de API seja injetada automaticamente pelo ambiente de execução (como o Google AI Studio/Canvas).
    - As linhas `const apiKey = "";` no `script.js` são intencionalmente deixadas vazias. Se você estiver executando em um ambiente diferente que requer uma chave de API explícita, você precisará obter sua própria chave de API do Google Cloud ou Google AI Studio e substituí-la nas linhas relevantes.
    - **Importante**: Se você receber erros `401 Unauthorized`, isso indica que a chave de API não está sendo fornecida ou é inválida no seu ambiente de execução. Verifique a configuração do seu projeto no console do Google Cloud ou na plataforma Google AI Studio.
4. **Abra no Navegador**: Simplesmente abra o arquivo `index.html` em seu navegador de internet preferido.

## Erros Comuns e Soluções

- **`Erro HTTP: 401 - Unauthorized`**: Sua chave de API não está sendo reconhecida ou é inválida. Verifique sua configuração de API no Google AI Studio ou Google Cloud Console.
- **`SyntaxError: Unexpected end of input` ou `Resposta inválida da API`**: Isso pode acontecer se a API retornar uma resposta incompleta ou não-JSON devido a um erro interno do servidor, limite de taxa ou problema de autenticação. Verifique o console do navegador para mais detalhes sobre a resposta bruta da API.
- **Upload não funciona após gerar aleatoriamente**: Este problema foi corrigido na última versão. Certifique-se de que seu arquivo `script.js` contenha a linha `imageUpload.value = '';` no evento de clique do botão "Gerar Personagem Aleatório".

---
