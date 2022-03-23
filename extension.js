// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { start } = require('repl');
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-snippet-for-report" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-snippet-for-report.generateSnippet', async function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}
	
		const selection = editor.selection;
		const text = editor.document.getText(selection);
		const startLine = selection._start._line + 1;
		const lang = editor.document.languageId;
		const workspacePath = vscode.workspace.rootPath;
		const fullPath = editor.document.fileName;
		let pathToFile = fullPath;

		if (fullPath.split(workspacePath).length > 1) {
			pathToFile = fullPath.split(workspacePath)[1];
		}

		if (pathToFile[0] === "/" || pathToFile[0] === "\\") {
			pathToFile = pathToFile.substring(1);
		}

		const snippet = `\`\`\`{language=${lang} caption=${pathToFile} firstnumber=${startLine} hlines=${startLine}}
${text}
\`\`\`
`

		await vscode.env.clipboard.writeText(snippet);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
