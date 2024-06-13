import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "list-functions" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "extension.listFunctionsFromExplorer",
    (uri: vscode.Uri) => {
      if (uri && uri.fsPath) {
        console.log(
          'Command "extension.listFunctionsFromExplorer" executed with URI:',
          uri.fsPath
        );
        const folderName = path.basename(uri.fsPath);
        openWebview(context, uri.fsPath, folderName);
      } else {
        vscode.window.showErrorMessage(
          "Please select a valid folder in VSCode"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function openWebview(
  context: vscode.ExtensionContext,
  folderPath: string,
  folderName: string
) {
  const panel = vscode.window.createWebviewPanel(
    "listFunctions",
    `${folderName} List Functions`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent(folderName);

  panel.webview.onDidReceiveMessage(
    async (message) => {
      console.log("Received message from webview:", message);
      switch (message.command) {
        case "listFunctions":
          panel.webview.postMessage({ command: "showLoader" });
          const functionsList = await listFunctionsInFolder(
            folderPath,
            message.matchPatterns,
            message.excludePaths
          );
          panel.webview.postMessage({ command: "hideLoader" });
          panel.webview.postMessage({ command: "showResults", functionsList });
          break;
        case "copyToClipboard":
          vscode.env.clipboard.writeText(message.text).then(() => {
            vscode.window.showInformationMessage(
              "Function list copied to clipboard."
            );
          });
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

async function listFunctionsInFolder(
  folderPath: string,
  matchPatterns: string[],
  excludePaths: string[]
): Promise<string> {
  console.log("Listing functions in folder:", folderPath);
  const files = await listAllFiles(folderPath, matchPatterns, excludePaths);
  let functionsList = "";
  files.forEach((file) => {
    functionsList += listFunctions(file, folderPath);
  });

  return functionsList;
}

async function listAllFiles(
  folderPath: string,
  matchPatterns: string[],
  excludePaths: string[]
): Promise<string[]> {
  let files: string[] = [];

  async function readDirRecursively(dir: string) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (
        entry.isDirectory() &&
        !excludePaths.some((exclude) => fullPath.match(new RegExp(exclude)))
      ) {
        await readDirRecursively(fullPath);
      } else if (
        entry.isFile() &&
        matchPatterns.some((pattern) => fullPath.endsWith(pattern))
      ) {
        files.push(fullPath);
      }
    }
  }

  await readDirRecursively(folderPath);
  console.log("Found files:", files);
  return files;
}

function listFunctions(filePath: string, rootPath: string): string {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const functionPattern =
      /(function\s+\w+\s*\([^)]*\)\s*|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*|let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*)/g;
    const matches = data.match(functionPattern);

    const relativePath = path.relative(rootPath, filePath);

    if (matches) {
      const cleanMatches = matches.map((match) =>
        match.replace(/\s*=>\s*|{\s*$/g, "")
      );
      return `${relativePath}:\n${cleanMatches.join("\n")}\n\n`;
    } else {
      return `No functions found in ${relativePath}\n\n`;
    }
  } catch (err) {
    console.error(`Error reading file: ${filePath}`, err);
    return `Error reading file: ${filePath}\n\n`;
  }
}

function getWebviewContent(folderName: string): string {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>List Functions</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                .loader {
                    border: 16px solid #f3f3f3;
                    border-radius: 50%;
                    border-top: 16px solid #3498db;
                    width: 120px;
                    height: 120px;
                    animation: spin 2s linear infinite;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    display: none;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body class="bg-gray-100 font-sans leading-normal tracking-normal">
            <div class="container mx-auto p-4">
                <h1 class="text-3xl font-bold mb-4 text-gray-900">${folderName} List Functions in Folder</h1>
                <form id="inputForm" class="mb-4">
                    <div class="mb-4">
                        <label for="matchPatterns" class="block text-gray-700 text-sm font-bold mb-2">Match Patterns (comma separated):</label>
                        <input type="text" id="matchPatterns" name="matchPatterns" value=".js,.ts,.tsx" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="mb-4">
                        <label for="excludePaths" class="block text-gray-700 text-sm font-bold mb-2">Exclude Paths (comma separated):</label>
                        <input type="text" id="excludePaths" name="excludePaths" value="node_modules,.git,dist,build,logs,.github" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="flex items-center justify-between">
                        <button type="button" onclick="listFunctions()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Confirm</button>
                        <button type="button" class="copy-button ml-4" onclick="copyToClipboard()" title="Copy to Clipboard">
                            <img src="https://img.icons8.com/material-outlined/24/000000/copy.png" alt="Copy" class="w-6 h-6">
                        </button>
                    </div>
                </form>
                <div class="loader" id="loader"></div>
                <pre id="results" class="bg-white shadow-md rounded p-4 text-gray-800 overflow-x-auto"></pre>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                
                function listFunctions() {
                    const matchPatterns = document.getElementById('matchPatterns').value.split(',').map(pattern => pattern.trim());
                    const excludePaths = document.getElementById('excludePaths').value.split(',').map(path => path.trim());
                    console.log('Sending message to extension:', { command: 'listFunctions', matchPatterns, excludePaths });
                    document.getElementById('loader').style.display = 'block';
                    vscode.postMessage({ command: 'listFunctions', matchPatterns, excludePaths });
                }

                function copyToClipboard() {
                    const results = document.getElementById('results').textContent;
                    console.log('Copying results to clipboard:', results);
                    vscode.postMessage({ command: 'copyToClipboard', text: results });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    console.log('Received message from extension:', message);
                    switch (message.command) {
                        case 'showResults':
                            document.getElementById('results').textContent = message.functionsList;
                            document.getElementById('loader').style.display = 'none';
                            break;
                        case 'showLoader':
                            document.getElementById('loader').style.display = 'block';
                            break;
                        case 'hideLoader':
                            document.getElementById('loader').style.display = 'none';
                            break;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

export function deactivate() {}
