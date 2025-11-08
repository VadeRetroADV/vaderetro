'use client'

import { useState } from 'react'
import { Search, BookOpen, Tag, FileText, Plus, Edit, Trash2, MessageCircle, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { buscarConteudoJuridico, buscarPorPalavraChave } from '@/lib/openai'

// Base completa do ordenamento jurídico brasileiro com links oficiais e imagens específicas do Unsplash
const codigosFundamentais = [
  {
    id: 1,
    nome: "Constituição Federal",
    lei: "CF/1988",
    url: "https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/constituicao-federal",
    categoria: "Constitucional",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop&crop=center",
    sigla: "cf"
  },
  {
    id: 2,
    nome: "Código Civil",
    lei: "Lei n. 10.406/2002",
    url: "http://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm",
    categoria: "Civil",
    imagem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center",
    sigla: "cc"
  },
  {
    id: 3,
    nome: "Código de Processo Civil",
    lei: "Lei n. 13.105/2015",
    url: "http://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2015/Lei/L13105.htm",
    categoria: "Processual Civil",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "cpc"
  },
  {
    id: 4,
    nome: "Código Penal",
    lei: "Decreto-lei n. 2.848/1940",
    url: "http://www.planalto.gov.br/ccivil_03/decreto-lei/Del2848compilado.htm",
    categoria: "Penal",
    imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center",
    sigla: "cp"
  },
  {
    id: 5,
    nome: "Código de Processo Penal",
    lei: "Decreto-lei n. 3.689/1941",
    url: "http://www.planalto.gov.br/ccivil_03/Decreto-Lei/Del3689.htm",
    categoria: "Processual Penal",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "cpp"
  },
  {
    id: 6,
    nome: "CLT - Consolidação das Leis do Trabalho",
    lei: "Decreto-lei n. 5.452/1943",
    url: "http://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm",
    categoria: "Trabalhista",
    imagem: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=200&fit=crop&crop=center",
    sigla: "clt"
  },
  {
    id: 7,
    nome: "Código Tributário Nacional",
    lei: "Lei n. 5.172/1966",
    url: "http://www.planalto.gov.br/ccivil_03/Leis/L5172.htm",
    categoria: "Tributário",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&crop=center",
    sigla: "ctn"
  },
  {
    id: 8,
    nome: "Código de Defesa do Consumidor",
    lei: "Lei n. 8.078/1990",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l8078.htm",
    categoria: "Consumidor",
    imagem: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center",
    sigla: "cdc"
  }
]

const legislacaoCivilComercialPenal = [
  {
    id: 9,
    nome: "Código Comercial",
    lei: "Lei n. 556/1850",
    url: "http://www.planalto.gov.br/CCIVIL_03///LEIS/LIM/LIM556.htm",
    categoria: "Comercial",
    imagem: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=200&fit=crop&crop=center",
    sigla: "ccom"
  },
  {
    id: 10,
    nome: "Código de Trânsito Brasileiro",
    lei: "Lei n. 9.503/1997",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",
    categoria: "Trânsito",
    imagem: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&crop=center",
    sigla: "ctb"
  },
  {
    id: 11,
    nome: "Código Florestal",
    lei: "Lei n. 12.651/2012",
    url: "http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm",
    categoria: "Ambiental",
    imagem: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&crop=center",
    sigla: "cf-ambiental"
  },
  {
    id: 12,
    nome: "Código Eleitoral",
    lei: "Lei n. 4.737/1965",
    url: "http://www.planalto.gov.br/ccivil_03/leis/L4737.htm",
    categoria: "Eleitoral",
    imagem: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&h=200&fit=crop&crop=center",
    sigla: "ce"
  },
  {
    id: 13,
    nome: "Código Militar (Processo Penal)",
    lei: "Decreto-Lei n. 1.002/1969",
    url: "http://www.planalto.gov.br/ccivil_03/decreto-lei/del1002.htm",
    categoria: "Militar",
    imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center",
    sigla: "cppm"
  },
  {
    id: 14,
    nome: "Lei de Introdução às Normas do Direito Brasileiro - LINDB",
    lei: "Decreto-Lei n. 4.657/1942",
    url: "http://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm",
    categoria: "Geral",
    imagem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center",
    sigla: "lindb"
  },
  {
    id: 15,
    nome: "Lei de Execução Penal - LEP",
    lei: "Lei n. 7.210/1984",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l7210.htm",
    categoria: "Penal",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop&crop=center",
    sigla: "lep"
  }
]

const estatutosLeisEspecificas = [
  {
    id: 16,
    nome: "Estatuto da Criança e do Adolescente - ECA",
    lei: "Lei n. 8.069/1990",
    url: "http://www.planalto.gov.br/ccivil_03/leis/L8069.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=200&fit=crop&crop=center",
    sigla: "eca"
  },
  {
    id: 17,
    nome: "Estatuto da Advocacia e da OAB",
    lei: "Lei n. 8.906/1994",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l8906.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "eoab"
  },
  {
    id: 18,
    nome: "Estatuto da Cidade",
    lei: "Lei n. 10.257/2001",
    url: "http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10257.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop&crop=center",
    sigla: "ec"
  },
  {
    id: 19,
    nome: "Estatuto da Pessoa Idosa",
    lei: "Lei n. 10.741/2003",
    url: "http://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop&crop=center",
    sigla: "epi"
  },
  {
    id: 20,
    nome: "Estatuto do Desarmamento",
    lei: "Lei n. 10.826/2003",
    url: "http://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&crop=center",
    sigla: "ed"
  },
  {
    id: 21,
    nome: "Estatuto da Pessoa com Deficiência",
    lei: "Lei n. 13.146/2015",
    url: "http://www.planalto.gov.br/Ccivil_03/_Ato2015-2018/2015/Lei/L13146.htm",
    categoria: "Estatuto",
    imagem: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop&crop=center",
    sigla: "epd"
  },
  {
    id: 22,
    nome: "Lei Maria da Penha",
    lei: "Lei n. 11.340/2006",
    url: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",
    categoria: "Proteção",
    imagem: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop&crop=center",
    sigla: "lmp"
  },
  {
    id: 23,
    nome: "Lei de Improbidade Administrativa",
    lei: "Lei n. 8.429/1992",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l8429.htm",
    categoria: "Administrativa",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "lia"
  },
  {
    id: 24,
    nome: "Lei de Ação Civil Pública",
    lei: "Lei n. 7.347/1985",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l7347.htm",
    categoria: "Processual",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "lacp"
  },
  {
    id: 25,
    nome: "Lei Antidrogas",
    lei: "Lei n. 11.343/2006",
    url: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm",
    categoria: "Penal",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop&crop=center",
    sigla: "lad"
  },
  {
    id: 26,
    nome: "Lei do Mandado de Segurança",
    lei: "Lei n. 12.016/2009",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12016.htm",
    categoria: "Processual",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "lms"
  }
]

const leisAdministrativasProcessuais = [
  {
    id: 27,
    nome: "Nova Lei de Licitações e Contratos",
    lei: "Lei n. 14.133/2021",
    url: "http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm",
    categoria: "Administrativa",
    imagem: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=200&fit=crop&crop=center",
    sigla: "nllc"
  },
  {
    id: 28,
    nome: "Lei de Responsabilidade Fiscal - LRF",
    lei: "Lei Complementar n. 101/2000",
    url: "http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm",
    categoria: "Fiscal",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&crop=center",
    sigla: "lrf"
  },
  {
    id: 29,
    nome: "Lei dos Juizados Especiais Cíveis e Criminais",
    lei: "Lei n. 9.099/1995",
    url: "http://www.planalto.gov.br/ccivil_03/leis/l9099.htm",
    categoria: "Processual",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "jecc"
  },
  {
    id: 30,
    nome: "Lei dos Juizados Especiais Federais",
    lei: "Lei n. 10.259/2001",
    url: "https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10259.htm",
    categoria: "Processual",
    imagem: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=200&fit=crop&crop=center",
    sigla: "jef"
  }
]

const linksJurisprudencia = [
  {
    id: 31,
    nome: "Súmulas STF e Súmulas Vinculantes",
    lei: "Supremo Tribunal Federal",
    url: "https://portal.stf.jus.br/textos/verTexto.asp?servico=jurisprudenciaSumula",
    categoria: "Jurisprudência",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop&crop=center",
    sigla: "stf"
  },
  {
    id: 32,
    nome: "Súmulas STJ",
    lei: "Superior Tribunal de Justiça",
    url: "https://scon.stj.jus.br/SCON/sumanot/",
    categoria: "Jurisprudência",
    imagem: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop&crop=center",
    sigla: "stj"
  },
  {
    id: 33,
    nome: "Súmulas e OJs TST",
    lei: "Tribunal Superior do Trabalho",
    url: "https://www.tst.jus.br/sumulas-e-orientacoes-jurisprudenciais",
    categoria: "Jurisprudência",
    imagem: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=200&fit=crop&crop=center",
    sigla: "tst"
  }
]

// Mapeamento completo para busca avançada por código
const codigoMap: { [key: string]: any } = {}

// Adicionar todos os códigos ao mapeamento
const todosOsCodigos = [
  ...codigosFundamentais,
  ...legislacaoCivilComercialPenal,
  ...estatutosLeisEspecificas,
  ...leisAdministrativasProcessuais,
  ...linksJurisprudencia
]

todosOsCodigos.forEach(codigo => {
  codigoMap[codigo.sigla] = { 
    nome: codigo.nome, 
    url: codigo.url,
    lei: codigo.lei 
  }
  // Adicionar variações comuns
  if (codigo.sigla === 'cf') {
    codigoMap['constituicao'] = codigoMap[codigo.sigla]
    codigoMap['constituicao federal'] = codigoMap[codigo.sigla]
  }
  if (codigo.sigla === 'cc') {
    codigoMap['codigo civil'] = codigoMap[codigo.sigla]
  }
  if (codigo.sigla === 'cp') {
    codigoMap['codigo penal'] = codigoMap[codigo.sigla]
  }
})

interface Etiqueta {
  id: number
  titulo: string
  cor: string
  artigos: string[]
  comentarios: string[]
  dataCriacao: string
}

export default function VadeRetro() {
  const [abaAtiva, setAbaAtiva] = useState('codigos')
  const [termoBusca, setTermoBusca] = useState('')
  const [termoBuscaPalavra, setTermoBuscaPalavra] = useState('')
  const [resultadoBuscaAvancada, setResultadoBuscaAvancada] = useState<any>(null)
  const [resultadoBuscaPalavra, setResultadoBuscaPalavra] = useState<any>(null)
  const [codigoSelecionado, setCodigoSelecionado] = useState<any>(null)
  const [carregandoConteudo, setCarregandoConteudo] = useState(false)
  const [carregandoBusca, setCarregandoBusca] = useState(false)
  const [carregandoPalavra, setCarregandoPalavra] = useState(false)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([
    {
      id: 1,
      titulo: "Direitos Fundamentais",
      cor: "bg-blue-500",
      artigos: ["CF Art. 5º", "CC Art. 1º"],
      comentarios: ["Princípios básicos da dignidade humana"],
      dataCriacao: "2024-01-15"
    },
    {
      id: 2,
      titulo: "Capacidade Civil",
      cor: "bg-green-500",
      artigos: ["CC Art. 3º", "CC Art. 4º"],
      comentarios: ["Importante para contratos", "Verificar sempre a idade"],
      dataCriacao: "2024-01-16"
    }
  ])
  const [novaEtiqueta, setNovaEtiqueta] = useState({ titulo: '', cor: 'bg-blue-500', artigos: '', comentarios: '' })
  const [etiquetaEditando, setEtiquetaEditando] = useState<Etiqueta | null>(null)
  const [dialogAberto, setDialogAberto] = useState(false)

  const abrirCodigo = async (codigo: any) => {
    setCarregandoConteudo(true)
    setCodigoSelecionado(codigo)
    
    // Simular carregamento do conteúdo
    setTimeout(() => {
      setCarregandoConteudo(false)
    }, 1500)
  }

  const voltarParaCodigos = () => {
    setCodigoSelecionado(null)
    setResultadoBuscaAvancada(null)
    setResultadoBuscaPalavra(null)
  }

  const buscarArtigoEspecifico = async (termo: string) => {
    if (!termo.trim()) return
    
    setCarregandoBusca(true)
    
    // Formato: codigo,artigo (ex: cc,105)
    if (termo.includes(',')) {
      const [codigo, artigo] = termo.split(',').map(s => s.trim().toLowerCase())
      
      if (codigoMap[codigo]) {
        try {
          const resultado = await buscarConteudoJuridico(codigoMap[codigo].nome, artigo)
          
          setResultadoBuscaAvancada({
            tipo: 'artigo_especifico',
            codigo: codigoMap[codigo].nome,
            artigo: artigo,
            url: codigoMap[codigo].url,
            lei: codigoMap[codigo].lei,
            mensagem: `Artigo ${artigo} do ${codigoMap[codigo].nome}`,
            conteudo: resultado.conteudo,
            fonte: resultado.fonte,
            sucesso: resultado.success
          })
        } catch (error) {
          setResultadoBuscaAvancada({
            tipo: 'erro',
            mensagem: 'Erro ao buscar artigo',
            conteudo: 'Erro ao conectar com a API. Verifique sua chave OpenAI e tente novamente.',
            sucesso: false
          })
        }
      } else {
        setResultadoBuscaAvancada({
          tipo: 'erro',
          mensagem: 'Código não encontrado',
          conteudo: `O código "${codigo}" não foi encontrado. Verifique a lista de códigos disponíveis.`,
          sucesso: false
        })
      }
    } else {
      setResultadoBuscaAvancada({
        tipo: 'erro',
        mensagem: 'Formato inválido',
        conteudo: 'Use o formato: código,artigo (exemplo: cc,105)',
        sucesso: false
      })
    }
    
    setCarregandoBusca(false)
  }

  const buscarPorPalavraChave = async (palavra: string) => {
    if (!palavra.trim()) return
    
    setCarregandoPalavra(true)
    
    try {
      const resultado = await buscarPorPalavraChave(palavra)
      
      setResultadoBuscaPalavra({
        tipo: 'busca_palavra',
        termo: palavra,
        conteudo: resultado.conteudo,
        fonte: resultado.fonte,
        sucesso: resultado.success
      })
    } catch (error) {
      setResultadoBuscaPalavra({
        tipo: 'erro',
        termo: palavra,
        conteudo: 'Erro ao conectar com a API. Verifique sua chave OpenAI e tente novamente.',
        sucesso: false
      })
    }
    
    setCarregandoPalavra(false)
  }

  const criarEtiqueta = () => {
    if (!novaEtiqueta.titulo.trim()) return

    const etiqueta: Etiqueta = {
      id: Date.now(),
      titulo: novaEtiqueta.titulo,
      cor: novaEtiqueta.cor,
      artigos: novaEtiqueta.artigos.split(',').map(a => a.trim()).filter(a => a),
      comentarios: novaEtiqueta.comentarios.split('\n').filter(c => c.trim()),
      dataCriacao: new Date().toISOString().split('T')[0]
    }

    setEtiquetas([...etiquetas, etiqueta])
    setNovaEtiqueta({ titulo: '', cor: 'bg-blue-500', artigos: '', comentarios: '' })
    setDialogAberto(false)
  }

  const editarEtiqueta = (etiqueta: Etiqueta) => {
    setEtiquetaEditando(etiqueta)
    setNovaEtiqueta({
      titulo: etiqueta.titulo,
      cor: etiqueta.cor,
      artigos: etiqueta.artigos.join(', '),
      comentarios: etiqueta.comentarios.join('\n')
    })
    setDialogAberto(true)
  }

  const salvarEdicao = () => {
    if (!etiquetaEditando || !novaEtiqueta.titulo.trim()) return

    const etiquetasAtualizadas = etiquetas.map(e => 
      e.id === etiquetaEditando.id 
        ? {
            ...e,
            titulo: novaEtiqueta.titulo,
            cor: novaEtiqueta.cor,
            artigos: novaEtiqueta.artigos.split(',').map(a => a.trim()).filter(a => a),
            comentarios: novaEtiqueta.comentarios.split('\n').filter(c => c.trim())
          }
        : e
    )

    setEtiquetas(etiquetasAtualizadas)
    setEtiquetaEditando(null)
    setNovaEtiqueta({ titulo: '', cor: 'bg-blue-500', artigos: '', comentarios: '' })
    setDialogAberto(false)
  }

  const excluirEtiqueta = (id: number) => {
    setEtiquetas(etiquetas.filter(e => e.id !== id))
  }

  const criarEtiquetaDaBusca = () => {
    if (!resultadoBuscaAvancada) return
    
    setNovaEtiqueta({
      titulo: `${resultadoBuscaAvancada.codigo} - Art. ${resultadoBuscaAvancada.artigo}`,
      cor: 'bg-purple-500',
      artigos: `${resultadoBuscaAvancada.codigo} Art. ${resultadoBuscaAvancada.artigo}`,
      comentarios: `Criada automaticamente da busca avançada`
    })
    setAbaAtiva('etiquetas')
    setDialogAberto(true)
  }

  const renderSecaoCodigos = (titulo: string, codigos: any[], corTitulo: string) => (
    <div className="mb-8">
      <h3 className={`text-lg sm:text-xl font-bold ${corTitulo} mb-4`}>{titulo}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {codigos.map((codigo) => (
          <Card 
            key={codigo.id} 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={() => abrirCodigo(codigo)}
          >
            <div 
              className="h-24 sm:h-32 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${codigo.imagem})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="secondary" className="text-xs bg-white bg-opacity-90">
                  {codigo.categoria}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3 p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-blue-600 transition-colors">
                {codigo.nome}
              </CardTitle>
              <Badge variant="outline" className="text-xs w-fit">{codigo.lei}</Badge>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )

  // Se um código foi selecionado, mostrar visualização do código
  if (codigoSelecionado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  onClick={voltarParaCodigos}
                  className="mr-1 sm:mr-2 p-2"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                  <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{codigoSelecionado.nome}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{codigoSelecionado.lei}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(codigoSelecionado.url, '_blank')}
                size="sm"
                className="ml-2"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Ver no Planalto</span>
                <span className="sm:hidden">Planalto</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {carregandoConteudo ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando conteúdo do código...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
              <div className="prose max-w-none">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {codigoSelecionado.nome} - {codigoSelecionado.lei}
                </h2>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Conteúdo Simulado:</strong> Em uma implementação real, aqui seria exibido o conteúdo completo do código jurídico obtido através de API oficial ou base de dados local.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">TÍTULO I - DISPOSIÇÕES PRELIMINARES</h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Art. 1º</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        Este código estabelece normas gerais sobre [matéria específica do código], 
                        em conformidade com os princípios constitucionais e as diretrizes do ordenamento jurídico brasileiro.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">TÍTULO II - DOS DIREITOS E DEVERES</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Art. 2º</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          São assegurados os direitos fundamentais previstos na Constituição Federal, 
                          aplicando-se as normas específicas deste código.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Art. 3º</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          Os deveres estabelecidos neste código devem ser observados por todos os cidadãos, 
                          sob pena das sanções previstas em lei.
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mt-6 sm:mt-8">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Nota:</strong> Para acessar o conteúdo oficial completo e atualizado, 
                          clique no botão "Ver no Planalto" no cabeçalho desta página.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">VadeRetro</h1>
                <p className="text-xs sm:text-sm text-gray-500">Vade Mecum Digital Brasileiro</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setAbaAtiva('codigos')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                abaAtiva === 'codigos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Ordenamento Jurídico</span>
              </div>
            </button>
            <button
              onClick={() => setAbaAtiva('etiquetas')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                abaAtiva === 'etiquetas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Etiquetas</span>
              </div>
            </button>
            <button
              onClick={() => setAbaAtiva('busca')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                abaAtiva === 'busca'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Busca Avançada</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Aba 1: Ordenamento Jurídico Completo */}
        {abaAtiva === 'codigos' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ordenamento Jurídico Brasileiro</h2>
              <p className="text-sm sm:text-base text-gray-600">Clique em qualquer código para acessar seu conteúdo completo</p>
            </div>

            {renderSecaoCodigos("Códigos Fundamentais", codigosFundamentais, "text-blue-800")}
            {renderSecaoCodigos("Legislação Civil, Comercial e Penal", legislacaoCivilComercialPenal, "text-green-800")}
            {renderSecaoCodigos("Estatutos e Leis Específicas", estatutosLeisEspecificas, "text-purple-800")}
            {renderSecaoCodigos("Leis Administrativas e Processuais Específicas", leisAdministrativasProcessuais, "text-orange-800")}
            {renderSecaoCodigos("Links de Jurisprudência (Tribunais)", linksJurisprudencia, "text-red-800")}
          </div>
        )}

        {/* Aba 2: Etiquetas */}
        {abaAtiva === 'etiquetas' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sistema de Etiquetas</h2>
                <p className="text-sm sm:text-base text-gray-600">Organize e anote seus artigos favoritos</p>
              </div>
              
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Etiqueta
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-3 sm:mx-0 max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {etiquetaEditando ? 'Editar Etiqueta' : 'Criar Nova Etiqueta'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título da Etiqueta</Label>
                      <Input
                        id="titulo"
                        value={novaEtiqueta.titulo}
                        onChange={(e) => setNovaEtiqueta({...novaEtiqueta, titulo: e.target.value})}
                        placeholder="Ex: Direitos Fundamentais"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cor">Cor da Etiqueta</Label>
                      <select
                        id="cor"
                        value={novaEtiqueta.cor}
                        onChange={(e) => setNovaEtiqueta({...novaEtiqueta, cor: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="bg-blue-500">Azul</option>
                        <option value="bg-green-500">Verde</option>
                        <option value="bg-red-500">Vermelho</option>
                        <option value="bg-purple-500">Roxo</option>
                        <option value="bg-yellow-500">Amarelo</option>
                        <option value="bg-pink-500">Rosa</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="artigos">Artigos (separados por vírgula)</Label>
                      <Input
                        id="artigos"
                        value={novaEtiqueta.artigos}
                        onChange={(e) => setNovaEtiqueta({...novaEtiqueta, artigos: e.target.value})}
                        placeholder="Ex: CF Art. 5º, CC Art. 1º"
                      />
                    </div>
                    <div>
                      <Label htmlFor="comentarios">Comentários (um por linha)</Label>
                      <Textarea
                        id="comentarios"
                        value={novaEtiqueta.comentarios}
                        onChange={(e) => setNovaEtiqueta({...novaEtiqueta, comentarios: e.target.value})}
                        placeholder="Adicione suas anotações..."
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        onClick={etiquetaEditando ? salvarEdicao : criarEtiqueta}
                        className="flex-1"
                      >
                        {etiquetaEditando ? 'Salvar Alterações' : 'Criar Etiqueta'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDialogAberto(false)
                          setEtiquetaEditando(null)
                          setNovaEtiqueta({ titulo: '', cor: 'bg-blue-500', artigos: '', comentarios: '' })
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {etiquetas.map((etiqueta) => (
                <Card key={etiqueta.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${etiqueta.cor} flex-shrink-0`}></div>
                        <CardTitle className="text-base sm:text-lg truncate">{etiqueta.titulo}</CardTitle>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarEtiqueta(etiqueta)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirEtiqueta(etiqueta.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Artigos:</p>
                        <div className="flex flex-wrap gap-1">
                          {etiqueta.artigos.map((artigo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {artigo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {etiqueta.comentarios.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Comentários:
                          </p>
                          <div className="space-y-1">
                            {etiqueta.comentarios.map((comentario, index) => (
                              <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {comentario}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Criada em: {new Date(etiqueta.dataCriacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {etiquetas.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma etiqueta criada</h3>
                <p className="text-gray-500">Crie sua primeira etiqueta para organizar seus estudos</p>
              </div>
            )}
          </div>
        )}

        {/* Aba 3: Busca Avançada */}
        {abaAtiva === 'busca' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Busca Avançada</h2>
              <p className="text-sm sm:text-base text-gray-600">Encontre artigos específicos ou busque por palavras-chave</p>
            </div>

            {/* Busca por Artigo Específico */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Busca por Artigo Específico</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Digite: código,artigo (ex: cc,105 ou clt,7)"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="text-base sm:text-lg"
                  />
                </div>
                <Button 
                  onClick={() => buscarArtigoEspecifico(termoBusca)}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  disabled={carregandoBusca}
                >
                  {carregandoBusca ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar Artigo
                </Button>
              </div>
            </div>

            {/* Busca por Palavra-chave */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Busca por Palavra-chave</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Digite uma palavra-chave (ex: casamento, herança, direitos fundamentais)"
                    value={termoBuscaPalavra}
                    onChange={(e) => setTermoBuscaPalavra(e.target.value)}
                    className="text-base sm:text-lg"
                  />
                </div>
                <Button 
                  onClick={() => buscarPorPalavraChave(termoBuscaPalavra)}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  disabled={carregandoPalavra}
                >
                  {carregandoPalavra ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar Tema
                </Button>
              </div>
            </div>

            {/* Resultado da Busca por Artigo */}
            {resultadoBuscaAvancada && (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <Button
                    variant="ghost"
                    onClick={() => setResultadoBuscaAvancada(null)}
                    className="mr-0 sm:mr-4 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Nova Busca
                  </Button>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                    {resultadoBuscaAvancada.mensagem}
                  </h3>
                </div>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div>
                        <CardTitle className="text-base sm:text-lg">{resultadoBuscaAvancada.mensagem}</CardTitle>
                        <Badge variant={resultadoBuscaAvancada.sucesso ? "secondary" : "destructive"} className="mt-1">
                          {resultadoBuscaAvancada.sucesso ? "OpenAI GPT-4" : "Erro"}
                        </Badge>
                      </div>
                      {resultadoBuscaAvancada.sucesso && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={criarEtiquetaDaBusca}
                            className="w-full sm:w-auto"
                          >
                            <Tag className="h-4 w-4 mr-1" />
                            Criar Etiqueta
                          </Button>
                          {resultadoBuscaAvancada.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resultadoBuscaAvancada.url, '_blank')}
                              className="w-full sm:w-auto"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver no Planalto
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="bg-white border rounded-lg p-3 sm:p-6">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 font-mono bg-gray-50 p-3 sm:p-4 rounded border overflow-x-auto">
                          {resultadoBuscaAvancada.conteudo}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Resultado da Busca por Palavra-chave */}
            {resultadoBuscaPalavra && (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <Button
                    variant="ghost"
                    onClick={() => setResultadoBuscaPalavra(null)}
                    className="mr-0 sm:mr-4 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Nova Busca
                  </Button>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                    Resultados para: "{resultadoBuscaPalavra.termo}"
                  </h3>
                </div>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div>
                        <CardTitle className="text-base sm:text-lg">Busca por Palavra-chave</CardTitle>
                        <Badge variant={resultadoBuscaPalavra.sucesso ? "secondary" : "destructive"} className="mt-1">
                          {resultadoBuscaPalavra.sucesso ? "OpenAI GPT-4" : "Erro"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="bg-white border rounded-lg p-3 sm:p-6">
                      <div className="prose max-w-none">
                        <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {resultadoBuscaPalavra.conteudo.split('\n').map((linha: string, index: number) => (
                            <p key={index} className="mb-2">
                              {linha}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!resultadoBuscaAvancada && !resultadoBuscaPalavra && (
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg max-w-2xl mx-auto">
                <h4 className="font-semibold text-blue-900 mb-3">Como usar a busca avançada:</h4>
                <div className="space-y-4 text-sm text-blue-800">
                  <div>
                    <p className="font-medium mb-2">1. Busca por Artigo Específico:</p>
                    <p><strong>Formato:</strong> código,artigo</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-2 mt-2">
                      <div>
                        <p className="font-medium">Códigos disponíveis:</p>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>• <strong>cf</strong> - Constituição Federal</li>
                          <li>• <strong>cc</strong> - Código Civil</li>
                          <li>• <strong>cpc</strong> - Código de Processo Civil</li>
                          <li>• <strong>cp</strong> - Código Penal</li>
                          <li>• <strong>clt</strong> - CLT</li>
                          <li>• <strong>cdc</strong> - Código de Defesa do Consumidor</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Exemplos:</p>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>• <strong>cc,105</strong> - Art. 105 do Código Civil</li>
                          <li>• <strong>cf,5</strong> - Art. 5º da Constituição</li>
                          <li>• <strong>clt,7</strong> - Art. 7º da CLT</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">2. Busca por Palavra-chave:</p>
                    <p>Digite qualquer termo jurídico e a IA encontrará os artigos relevantes.</p>
                    <p className="text-xs mt-1">Exemplos: "casamento", "herança", "direitos fundamentais", "contrato de trabalho"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}