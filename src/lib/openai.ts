import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Para uso no cliente - em produção, mova para API route
})

export async function buscarConteudoJuridico(codigo: string, artigo: string) {
  try {
    const prompt = `
Você é um especialista em direito brasileiro. Forneça o conteúdo EXATO e OFICIAL do artigo ${artigo} do ${codigo}.

IMPORTANTE:
- Forneça APENAS o texto oficial do artigo
- Inclua parágrafos, incisos e alíneas se existirem
- Use a numeração oficial (§, I, II, III, a), b), etc.)
- NÃO adicione interpretações ou comentários
- Se o artigo não existir, informe claramente

Formato de resposta:
Art. ${artigo}º [texto oficial completo]
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em legislação brasileira. Forneça sempre o texto oficial exato dos artigos solicitados, sem interpretações."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })

    return {
      success: true,
      conteudo: completion.choices[0]?.message?.content || "Conteúdo não encontrado",
      fonte: "OpenAI GPT-4"
    }
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return {
      success: false,
      conteudo: "Erro ao buscar conteúdo. Verifique sua conexão e tente novamente.",
      fonte: "Erro"
    }
  }
}

export async function buscarPorPalavraChave(palavraChave: string) {
  try {
    const prompt = `
Você é um especialista em direito brasileiro. Busque no ordenamento jurídico brasileiro por "${palavraChave}".

FORNEÇA:
1. Principais artigos que tratam do assunto
2. Códigos/leis relevantes
3. Resumo objetivo do que a legislação diz sobre o tema

FORMATO:
**Legislação Relevante:**
- [Código] Art. X - [resumo do artigo]
- [Código] Art. Y - [resumo do artigo]

**Resumo:**
[Explicação objetiva sobre o tema na legislação brasileira]

Seja preciso e cite apenas artigos que realmente existem.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em legislação brasileira. Forneça informações precisas e cite apenas artigos que realmente existem."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
    })

    return {
      success: true,
      conteudo: completion.choices[0]?.message?.content || "Conteúdo não encontrado",
      fonte: "OpenAI GPT-4"
    }
  } catch (error) {
    console.error('Erro ao buscar por palavra-chave:', error)
    return {
      success: false,
      conteudo: "Erro ao buscar conteúdo. Verifique sua conexão e tente novamente.",
      fonte: "Erro"
    }
  }
}