// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

function isIdentChar(char) {
  //9 - tabs
  //32 - spaces
  const ident_ascii = [9, 32];
  return !!ident_ascii.includes(char.charCodeAt(0));
}

function removeIdent(text) {
  const lines = text.split("\n");
  let min_ident = null;

  for (let item of lines) {
    let ident = 0;

    //Check as some extensions add functions in code lines
    if (typeof item !== "string") {
      continue;
    }

    //Ignore empty lines
    if (item.length === 0) {
      continue;
    }

    if (!isIdentChar(item[0])) {
      min_ident = 0;
      break;
    }

    for (let i in item) {
      if (ident >= min_ident && min_ident !== null) {
        break;
      }
      if (!isIdentChar(item[i])) {
        break;
      }
      ident++;
    }

    if (ident < min_ident || min_ident === null) {
      min_ident = ident;
    }
  }

  if (min_ident === 0) {
    return lines.join("\n");
  }

  const newSelection = [];

  for (let key in lines) {
    //Check as some extensions add functions in code lines
    if (typeof lines[key] !== "string") {
      continue;
    }

    //Ignore empty lines
    if (lines[key].length === 0) {
      newSelection.push(lines[key]);
      continue;
    }
    newSelection.push(lines[key].substring(min_ident));
  }

  return newSelection.join("\n");
}

function getHLinesFromBreakpoints(
  breakpoints,
  selectedTextStartLine,
  selectedTextEndLine,
  selectedFilePath
) {
  const hLines = [];

  if (!breakpoints) {
    return [];
  }

  if (breakpoints.length === 0) {
    return [];
  }

  for (let i in breakpoints) {
    const breakpoint = breakpoints[i];

    if (!breakpoint.location) {
      continue;
    }

    if (!breakpoint.location.range || !breakpoint.location.uri) {
      continue;
    }

    const breakpointLine = breakpoint.location.range.start.c + 1;
    const breakpointPath = breakpoint.location.uri.path;

    if (breakpointPath !== selectedFilePath) {
      continue;
    }

    if (
      breakpointLine >= selectedTextStartLine &&
      breakpointLine <= selectedTextEndLine
    ) {
      hLines.push(breakpointLine);
    }
  }

  return hLines.sort();
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "code-snippet-for-report.generateSnippet",
    async function () {
      try {
        // The code you place here will be executed every time your command is executed
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return; // No open text editor
        }

        const selection = editor.selection;
        const text = removeIdent(editor.document.getText(selection));
        const startLine = selection.start.c + 1;
        const endLine = selection.end.c + 1;
        const lang = editor.document.languageId;
        const workspacePath = vscode.workspace.rootPath;
        const fullPath = editor.document.fileName;

        //By default make start line as hline
        let hlines = startLine;
        const potentialHlinesArr = getHLinesFromBreakpoints(
          vscode.debug.breakpoints,
          startLine,
          endLine,
          fullPath
        );

        if (potentialHlinesArr.length > 0) {
          hlines = potentialHlinesArr.join(",");
        }
        let pathToFile = fullPath;

        //get relative path
        if (fullPath.split(workspacePath).length > 1) {
          pathToFile = fullPath.split(workspacePath)[1];
        }

        //remove / or \ at the beginning of path
        if (pathToFile[0] === "/" || pathToFile[0] === "\\") {
          pathToFile = pathToFile.substring(1);
        }

        const snippet = `\`\`\`{language=${lang} caption=${pathToFile} firstnumber=${startLine} hlines=${hlines}}
${text}
\`\`\`
`;

        await vscode.env.clipboard.writeText(snippet);
      } catch (e) {
        vscode.window.showInformationMessage("Some error, check console.");
        console.error(e);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
