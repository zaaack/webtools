import React, { useEffect, useLayoutEffect, useRef } from "react";
import Quill, { QuillOptionsStatic } from "quill";
export interface Props {
  defaultValue: string;
  onChange: (v: string) => void;
  modules?: QuillOptionsStatic["modules"];
  getEditor?: (e: Quill) => void;
  className?:string
  placeholder?: string
}
function QuillEditor(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.innerHTML = props.defaultValue
    let editor = new Quill(rootRef.current, {
      modules: props.modules,
      theme: 'snow',
      placeholder: props.placeholder,
    });
    editor.on('text-change', e =>{
      props.onChange(editor.root.innerHTML)
    })
    props.getEditor?.(editor)
  }, [rootRef.current]);
  return <div ref={rootRef} className={props.className}></div>;
}

export default QuillEditor;
