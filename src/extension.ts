import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "list-functions" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "extension.listFunctions",
    () => {
      console.log('Command "extension.listFunctions" executed.');

      const folderPath = vscode.workspace.rootPath;
      if (!folderPath) {
        vscode.window.showErrorMessage("Please open a folder in VSCode");
        return;
      }

      listFunctionsInFolder(folderPath);
    }
  );

  let explorerDisposable = vscode.commands.registerCommand(
    "extension.listFunctionsFromExplorer",
    (uri: vscode.Uri) => {
      if (uri && uri.fsPath) {
        console.log('Command "extension.listFunctionsFromExplorer" executed.');
        listFunctionsInFolder(uri.fsPath);
      } else {
        vscode.window.showErrorMessage(
          "Please select a valid folder in VSCode"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(explorerDisposable);
}

async function listFunctionsInFolder(folderPath: string) {
  const matchPatterns = [".js", ".tsx"];
  const excludePaths = ["node_modules", "test", ".git"];

  const files = await listAllFiles(folderPath, matchPatterns, excludePaths);
  let functionsList = "";
  files.forEach((file) => {
    functionsList += listFunctions(file, folderPath);
  });

  // Copy results to clipboard
  vscode.env.clipboard.writeText(functionsList).then(() => {
    vscode.window.showInformationMessage("Function list copied to clipboard.");
  });

  // Create and show a new webview
  const panel = vscode.window.createWebviewPanel(
    "functionList",
    "Function List",
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = getWebviewContent(functionsList);
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
      if (entry.isDirectory() && !excludePaths.includes(entry.name)) {
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
  return files;
}

function listFunctions(filePath: string, rootPath: string): string {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const functionPattern =
      /(function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)/g;
    const matches = data.match(functionPattern);

    const relativePath = path.relative(rootPath, filePath);

    if (matches) {
      return `${relativePath}:\n${matches.join("\n")}\n\n`;
    } else {
      return `No functions found in ${relativePath}\n\n`;
    }
  } catch (err) {
    console.error(`Error reading file: ${filePath}`, err);
    return `Error reading file: ${filePath}\n\n`;
  }
}

function getWebviewContent(functionsList: string): string {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Function List</title>
        </head>
        <body>
            <pre>${functionsList}</pre>
        </body>
        </html>
    `;
}

export function deactivate() {}
