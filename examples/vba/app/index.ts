import { parser, Runtime, SubBinder } from '../src/index';
import type * as Manaco from 'monaco-editor';

declare var require: any;
declare var monacoBase: string;
declare var monaco: typeof Manaco;

require.config({
  paths: {
    vs: monacoBase,
  },
});

const $ = (v: string): any => document.getElementById(v)!;

const sampleCode = `
sub test2 (ByVal msg As Integer, msg2 As Integer)
MsgBox msg
MsgBox msg2
end sub

sub test
test2 1, 2
end sub
`.trim();

require(['vs/editor/editor.main'], () => {
  $('sub').value = 'test';
  const editorContainer = $('monaco-editor');
  editorContainer.innerHTML = '';
  editorContainer.style.height = '400px';

  let editor = monaco.editor.create(editorContainer, {
    model: null,
  });

  var oldModel = editor.getModel();
  var newModel = monaco.editor.createModel(sampleCode, 'vb');
  editor.setModel(newModel);
  if (oldModel) {
    oldModel.dispose();
  }

  function getCurrentCode() {
    return editor.getModel()!.getValue().trim();
  }

  function getCurrentAst() {
    const value = getCurrentCode();
    return { value, ret: parser.parse(value, {}) };
  }
  $('lex').addEventListener('click', () => {
    const value = getCurrentCode();
    console.log(parser.lex(value));
  });
  $('parse').addEventListener('click', () => {
    const {ret}=getCurrentAst();
    console.log(ret);
    if(ret.error){
      console.error(ret.error.errorMessage);
    }
  });

  function wait(ms:number){
    return new Promise((resolve)=>{
      setTimeout(resolve,ms);
    });
  }

  const MsgBoxSub: SubBinder = {
    name: 'MsgBox',
    argumentsInfo:[{
      name:'msg',
    }],
    async fn(runtime) {
      alert(runtime.getCurrentScope().getVariable('msg')?.value);
      await wait(500);
      return undefined;
    },
  };

  $('evaluate').addEventListener('click', () => {
    try {
      const runtime = new Runtime();
      runtime.registerSubBinder(MsgBoxSub);
      runtime.run(getCurrentCode());
      runtime.callSub('test');
    } catch (e: any) {
      console.error(e);
    }
  });
});
