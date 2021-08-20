import createFormulaTokensProvider from "./createFormulaTokensProvider.js";
import createFormulaCompletionItemProvider from "./createFormulaCompletionItemProvider.js";
import createFormulaSignatureHelpProvider from "./createFormulaSignatureHelpProvider.js";
import createFormulaHoverProvider from "./createFormulaHoverProvider.js";
import { langId } from "./utils.js";
import observe from "./observe.js";

let setupLanguaged = false;

export default function init({ monaco, functionNames }) {
  if (!setupLanguaged) {
    const { editor, languages } = monaco;

    let themeName = langId + "-theme";

    editor.defineTheme(themeName, {
      base: "vs",
      inherit: false,
      rules: [
        {
          token: "FUNCTION",
          foreground: "0000FF"
        },
        {
          token: "NAME",
          foreground: "001188"
        },
        {
          token: "NUMBER",
          foreground: "09885A"
        },
        {
          token: "STRING",
          foreground: "A31515"
        }
      ]
    });

    languages.onLanguage(langId, () => {
      languages.setLanguageConfiguration(langId, {
        brackets: [
          ["{", "}"],
          ["[", "]"],
          ["(", ")"]
        ],
        autoClosingPairs: [
          {
            open: "{",
            close: "}"
          },
          {
            open: "[",
            close: "]"
          },
          {
            open: "(",
            close: ")"
          },
          {
            open: '"',
            close: '"',
            notIn: ["string"]
          },
          {
            open: "'",
            close: "'",
            notIn: ["string"]
          }
        ]
      });

      languages.setTokensProvider(langId, createFormulaTokensProvider());

      languages.registerCompletionItemProvider(
        langId,
        createFormulaCompletionItemProvider(functionNames)
      );

      languages.registerSignatureHelpProvider(
        langId,
        new createFormulaSignatureHelpProvider()
      );

      languages.registerHoverProvider(langId, createFormulaHoverProvider());

      observe(monaco);
    });

    languages.register({
      id: langId
    });

    setupLanguaged = true;
  }
}
