import { NextResponse } from 'next/server';

interface GitHubItem {
  name: string;
  path: string;
  type: string;
  url: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

async function getRepoContents(owner: string, repo: string, path: string = ''): Promise<TreeNode[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${process.env.GITHUB_TOKEN}`
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const contents: GitHubItem[] = await response.json();
    const tree: TreeNode[] = [];

    for (const item of contents) {
      const node: TreeNode = {
        name: item.name,
        path: item.path,
        type: item.type === 'file' ? 'file' : 'directory'
      };

      if (item.type === 'dir') {
        // Récupération récursive du contenu des dossiers
        node.children = await getRepoContents(owner, repo, item.path);
      }

      tree.push(node);
    }

    return tree;

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { githubUrl } = await request.json();
    
    // Extraction du propriétaire et du repo depuis l'URL
    const urlParts = new URL(githubUrl).pathname.split('/').filter(Boolean);
    const [owner, repo] = urlParts;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "URL GitHub invalide" },
        { status: 400 }
      );
    }

    const tree = await getRepoContents(owner, repo);
    return NextResponse.json({ tree });

  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : "Erreur lors de la récupération de l'arborescence"
      },
      { status: 500 }
    );
  }
} 