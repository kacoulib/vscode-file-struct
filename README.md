# List Functions VSCode Extension

## Description

The **List Functions** extension for Visual Studio Code allows you to list all functions (including arrow functions) defined in JavaScript and TypeScript files within a selected folder. The results are displayed in a new tab and automatically copied to the clipboard.

## Features

- List all functions in JavaScript and TypeScript files within a selected folder.
- Automatically copy the list of functions to the clipboard.
- Display the list of functions in a new webview tab.

## Installation

### Prerequisites

- Node.js and npm installed
- Visual Studio Code installed

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/list-functions
   cd list-functions
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Compile the extension:**

   ```bash
   npm run compile
   ```

4. **Package the extension:**

   ```bash
   npm install -g vsce
   vsce package
   ```

5. **Install the extension in VSCode:**

   - Open VSCode.
   - Go to the Extensions view by clicking on the Extensions icon in the Activity Bar or by pressing `Ctrl+Shift+X` (or `Cmd+Shift+X` on macOS).
   - Click on the ellipsis (`...`) in the top-right corner of the Extensions view.
   - Select `Install from VSIX...`.
   - Navigate to and select the generated `.vsix` file (e.g., `list-functions-0.0.1.vsix`).

## Usage

1. **Open a folder** in VSCode.

2. **Right-click on a folder** in the Explorer pane.

3. **Select `List Functions from Explorer`** from the context menu.

4. **View the list of functions** in the new tab that opens and note that the list has been copied to the clipboard.

## Development

### Prerequisites

- Node.js and npm installed
- Visual Studio Code installed

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/list-functions
   cd list-functions
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Open the project in VSCode:**

   ```bash
   code .
   ```

4. **Compile the extension:**

   ```bash
   npm run compile
   ```

5. **Run the extension in development mode:**

   - Press `F5` to open a new VSCode window with the extension loaded.

6. **Make changes and test** your extension.

## Contributing

1. **Fork the repository.**

2. **Create a new branch:**

   ```bash
   git checkout -b my-feature-branch
   ```

3. **Make your changes.**

4. **Commit your changes:**

   ```bash
   git commit -m 'Add some feature'
   ```

5. **Push to the branch:**

   ```bash
   git push origin my-feature-branch
   ```

6. **Submit a pull request.**

## License

MIT License. See the [LICENSE](LICENSE) file for more details.
