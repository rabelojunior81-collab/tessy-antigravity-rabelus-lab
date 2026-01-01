
import { Type, FunctionDeclaration } from "@google/genai";

export const GITHUB_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "read_github_file",
    description: "Lê o conteúdo completo de um arquivo específico do repositório GitHub conectado. Use para ler código-fonte, README, documentação, ou qualquer arquivo de texto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: "Caminho completo do arquivo no repositório, ex: README.md, src/App.tsx, package.json"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "list_github_directory",
    description: "Lista todos os arquivos e pastas de um diretório específico do repositório GitHub. Use para explorar a estrutura do projeto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        directory_path: {
          type: Type.STRING,
          description: "Caminho do diretório, vazio para root, ex: src, components"
        }
      },
      required: ["directory_path"]
    }
  },
  {
    name: "search_github_code",
    description: "Busca por código ou texto específico dentro do repositório GitHub. Use para encontrar onde algo está implementado.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Termo de busca, ex: function handleSubmit, import React"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_github_readme",
    description: "Lê o arquivo README.md do repositório GitHub. Use como primeira ação para entender o projeto.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: "list_github_branches",
    description: "Lista todas as branches do repositório GitHub.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: "get_commit_details",
    description: "Obtém detalhes completos de um commit específico, incluindo arquivos modificados, adições e deleções.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        commit_sha: {
          type: Type.STRING,
          description: "SHA do commit, obtido de list_recent_commits"
        }
      },
      required: ["commit_sha"]
    }
  },
  {
    name: "get_repository_structure",
    description: "Obtém a estrutura completa de diretórios e arquivos do repositório até uma profundidade específica. Use para ter visão geral do projeto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        max_depth: {
          type: Type.NUMBER,
          description: "Profundidade máxima, padrão 2, máximo 3"
        }
      }
    }
  }
];

export const githubTools = {
  functionDeclarations: GITHUB_FUNCTION_DECLARATIONS
};
