let lastImageDescription = null; // Variável para armazenar a última descrição da imagem
const API_KEY = ""; // Mantenha vazio se estiver no Canvas, ou cole sua chave de API aqui para GitHub Pages

document.addEventListener('DOMContentLoaded', () => {
    const generateRandomButton = document.getElementById('generateRandomButton');
    const imageUpload = document.getElementById('imageUpload');
    const regenerateFromUploadButton = document.getElementById('regenerateFromUploadButton');
    const apiWarning = document.getElementById('apiWarning');
    const imageDisplay = document.getElementById('imageDisplay');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generatedImage = document.getElementById('generatedImage');
    const errorMessage = document.getElementById('errorMessage');

    // Função para desabilitar todos os botões e o input de arquivo
    function disableAllButtons(disabled) {
        generateRandomButton.disabled = disabled;
        imageUpload.disabled = disabled;
        document.querySelector('label[for="imageUpload"]').style.pointerEvents = disabled ? 'none' : 'auto';
        document.querySelector('label[for="imageUpload"]').style.opacity = disabled ? '0.6' : '1';
        regenerateFromUploadButton.disabled = disabled;
    }

    // Validação inicial da API Key
    // Se estiver no Canvas, a chave deve ser injetada. Se estiver vazia, assumimos que não foi configurada.
    // Para GitHub Pages, você DEVE colar sua chave de API na variável API_KEY acima.
    if (!API_KEY && window.location.hostname.includes('github.io')) { // Verifica se está em GitHub Pages e API_KEY está vazia
        apiWarning.style.display = 'block';
        showError("Aviso: Chave de API não configurada. O gerador não funcionará no GitHub Pages sem ela.");
        disableAllButtons(true);
    } else if (!API_KEY) { // Se não está no GitHub Pages, assume que o Canvas vai injetar
        // Mensagem para ambiente Canvas onde a chave é injetada em runtime
        // Não precisa de aviso se a expectativa é que o ambiente forneça a chave
        console.log("A chave de API está vazia no código, presumindo que será fornecida pelo ambiente (ex: Canvas).");
    }


    // Função para mostrar o estado de carregamento
    function showLoading(message = "Gerando personagem...") {
        loadingIndicator.style.display = 'flex';
        loadingIndicator.querySelector('span').textContent = message;
        generatedImage.style.display = 'none';
        errorMessage.style.display = 'none';
        generatedImage.src = ''; // Limpa a imagem anterior
    }

    // Função para ocultar o estado de carregamento e mostrar a imagem
    function showImage(imageUrl) {
        loadingIndicator.style.display = 'none';
        generatedImage.src = imageUrl;
        generatedImage.style.display = 'block';
    }

    // Função para mostrar mensagem de erro
    function showError(message) {
        loadingIndicator.style.display = 'none';
        generatedImage.style.display = 'none';
        errorMessage.textContent = `Erro: ${message}`;
        errorMessage.style.display = 'block';
    }

    // Função para descrever a imagem usando gemini-2.0-flash
    async function describeImage(base64ImageData, mimeType) {
        showLoading("Analisando imagem...");
        try {
            const prompt = "Descreva esta imagem em detalhes para que eu possa usá-la para gerar um personagem de desenho animado. Inclua características físicas, roupas, expressões e qualquer elemento de fundo relevante.";
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64ImageData
                                }
                            }
                        ]
                    }
                ],
            };
            const apiKey = API_KEY; // Usa a chave de API definida globalmente
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Verifica se a resposta HTTP foi bem-sucedida
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro HTTP: ${response.status} - ${response.statusText}`, errorText);
                if (response.status === 401) {
                    throw new Error(`Não autorizado (401). Verifique se sua chave de API está configurada corretamente.`);
                } else {
                    throw new Error(`Erro na API de descrição da imagem: ${response.statusText || 'Resposta inválida'}. Detalhes: ${errorText.substring(0, 200)}...`);
                }
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Não foi possível obter a descrição da imagem. Estrutura de resposta inesperada.");
            }
        } catch (error) {
            console.error("Erro ao descrever a imagem:", error);
            showError(`Falha ao analisar a imagem: ${error.message}.`);
            return null;
        }
    }

    // Função para gerar o personagem usando imagen-3.0-generate-002
    async function generateCharacter(basePrompt) {
        showLoading("Gerando personagem DragonBall...");
        try {
            const finalPrompt = `Personagem estilo DragonBall, ${basePrompt}, estilo anime, alta qualidade, detalhado.`;
            const payload = { instances: { prompt: finalPrompt }, parameters: { "sampleCount": 1 } };
            const apiKey = API_KEY; // Usa a chave de API definida globalmente
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Verifica se a resposta HTTP foi bem-sucedida
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro HTTP: ${response.status} - ${response.statusText}`, errorText);
                if (response.status === 401) {
                    throw new Error(`Não autorizado (401). Verifique se sua chave de API está configurada corretamente.`);
                } else {
                    throw new Error(`Erro na API de geração de imagem: ${response.statusText || 'Resposta inválida'}. Detalhes: ${errorText.substring(0, 200)}...`);
                }
            }

            // Tenta analisar o JSON
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                const rawResponseText = await response.text(); // Read text again if JSON parsing failed
                console.error("Erro ao analisar JSON da resposta da API de geração de imagem:", jsonError, "Resposta bruta:", rawResponseText);
                throw new Error(`Resposta inválida da API de geração de imagem. Detalhes: ${jsonError.message}. Resposta bruta: ${rawResponseText.substring(0, 200)}...`);
            }

            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                showImage(imageUrl);
            } else {
                throw new Error("Não foi possível gerar a imagem do personagem. Estrutura de resposta inesperada.");
            }
        } catch (error) {
            console.error("Erro ao gerar o personagem:", error);
            showError(`Falha ao gerar o personagem: ${error.message}. Tente novamente ou com uma imagem diferente.`);
        }
    }

    // Gerar personagem aleatório ao carregar a página se a API_KEY estiver disponível
    if (API_KEY || !window.location.hostname.includes('github.io')) {
        generateCharacter("aura poderosa, pose dinâmica");
    } else {
        // Se API_KEY está vazia e está no GitHub Pages, exibe o aviso
        showError("Gerador desabilitado: Chave de API não configurada para este ambiente.");
    }

    // Event listener para o botão de gerar personagem aleatório
    generateRandomButton.addEventListener('click', () => {
        if (!API_KEY && window.location.hostname.includes('github.io')) {
            showError("Gerador desabilitado: Chave de API não configurada.");
            return;
        }
        lastImageDescription = null; // Limpa a descrição armazenada
        regenerateFromUploadButton.style.display = 'none'; // Oculta o botão de regenerar
        imageUpload.value = ''; // Limpa o valor do input de arquivo
        generateCharacter("aura poderosa, pose dinâmica");
    });

    // Event listener para o upload de imagem
    imageUpload.addEventListener('change', async (event) => {
        if (!API_KEY && window.location.hostname.includes('github.io')) {
            showError("Gerador desabilitado: Chave de API não configurada.");
            return;
        }
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1]; // Remove o prefixo "data:image/jpeg;base64,"
                const mimeType = file.type;

                const description = await describeImage(base64Data, mimeType);
                if (description) {
                    lastImageDescription = description; // Armazena a descrição
                    regenerateFromUploadButton.style.display = 'block'; // Mostra o botão de regenerar
                    await generateCharacter(description);
                } else {
                    lastImageDescription = null; // Limpa se a descrição falhou
                    regenerateFromUploadButton.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        } else {
            showError("Nenhum arquivo selecionado.");
            lastImageDescription = null; // Limpa se nenhum arquivo selecionado
            regenerateFromUploadButton.style.display = 'none';
            imageUpload.value = ''; // Limpa o valor se nenhum arquivo for selecionado
        }
    });

    // Event listener para o novo botão "Gerar Novamente (Baseado na Imagem Enviada)"
    regenerateFromUploadButton.addEventListener('click', async () => {
        if (!API_KEY && window.location.hostname.includes('github.io')) {
            showError("Gerador desabilitado: Chave de API não configurada.");
            return;
        }
        if (lastImageDescription) {
            await generateCharacter(lastImageDescription);
        } else {
            showError("Nenhuma imagem foi enviada ou a descrição não pôde ser gerada. Por favor, envie uma imagem primeiro.");
            regenerateFromUploadButton.style.display = 'none';
        }
    });
});