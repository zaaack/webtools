import { Button, Dropdown, Input, List, Tag, TextArea } from "antd-mobile";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { useBeforeUnload, useParams } from "react-router-dom";

import "react-quill/dist/quill.snow.css";
import css from "./index.quill.module.scss";
import { useLiveQuery } from "dexie-react-hooks";
import { Category, db, Image, Note } from "../db";
import dayjs from "dayjs";
import { pngBase64ToBlob, toText } from "../utils";
import {
  LeftOutline,
  MoreOutline,
  RedoOutline,
  UndoOutline,
} from "antd-mobile-icons";
import { useNavigate, useNavigation } from "react-router";
import { MoreSettings } from "./MoreSettings";
import asyncReplace from "@egoist/async-replace";
import QuillEditor from "./QuillEditor";
import Quill from "quill";
import { syncHelper } from "../sync/sync-helper";

{
  let Image = Quill.import('formats/image');
  Image.sanitize = (url: string) => url
}
export interface Props {}
const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "code"],
    ["clean"],
  ],
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
};
export function NotePage(props: Props) {
        console.time("quill");
        console.log(new Date().toLocaleTimeString())

        const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const params = useParams<{ id: string }>();
  const editorRef = useRef<Quill>();
  const [titleHeight, setTitltHeight] = useState(0);
  const navigate = useNavigate();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const updateTitleHeigth = (title: string) => {
    let e = titleRef.current;
    if (!e) return;
    let div = document.createElement("div");
    div.className = e.className;
    div.style.overflow = "visible";
    div.innerHTML = title || "哈";
    e.parentElement?.appendChild(div);
    setTitltHeight(div.offsetHeight);
    e.parentElement?.removeChild(div);
  };
  const [note, cat, oldImages] =
    useLiveQuery(async () => {
      if (params.id === "new") {
        return [
          {
            title: "",
            content: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            categoryId: 0,
            images: [],
          } as Note,
          null,
          [],
        ];
      }
      console.time("setContent");
      let note = (await db.notes.get(Number(params.id!))) || null;
      let cat: Category | void;
      let images: Image[] = [];
      if (note) {
        setTitle(note.title);
        images = await db.images.where("noteId").equals(note.id!).toArray();
        // setContent(note.content)
        setContent(
          note.content.replace(/<custom-image\s+id="(\d+)"\s*\/>/g, (_, id) => {
            let img: Image | void = images.find((i) => i.id === id);
            let b = pngBase64ToBlob(img?.url!)
            let u = URL.createObjectURL(b)
            console.log('blob url', u)
            setTimeout(() => {
              // URL.revokeObjectURL(u)
            }, 1000)
            return `<img src="${u}" id="${img?.id}" />`;
          })
        );
        images.forEach((i) => (i.url = ""));
        console.timeEnd("setContent");
        cat = await db.categories.get(note.categoryId);
      }
      return [note, cat, images];
    }, [params.id]) || [];
  let onTextChange = useCallback(
    (t: string) => {
      setContent(t);
      setIsEdited(true);
    },
    [setContent, setIsEdited]
  );
  async function saveNote() {
    if ((title || content) && note && isEdited) {
      note.title = title;
      let newImages: string[] = [];
      note.content = await asyncReplace(
        content,
        /<img\s+src="([^>]+)"(?:\s+id="(\d+)")?\s*\/?>/g,
        async (_, url, id) => {
          if (!id) {
            let i = 10
            while (i--) {
              try {
                id = Math.random().toString(36).slice(1)
                await db.images.add({ id, url, noteId: note.id! });
                break
              } catch (error) {
                console.error(error)
              }
            }
          }
          newImages.push(id);
          return `<custom-image id="${id}" />`;
        }
      );
      if (oldImages) {
        for (const img of oldImages) {
          if (!newImages.includes(img.id!)) {
            db.images.delete(img.id);
          }
        }
      }
      if (note?.id) {
        db.notes.update(note.id, {
          title: note.title.trim(),
          content: note.content.trim(),
          updatedAt: new Date(),
          images: newImages,
        });
      } else {
        note.id = (await db.notes.add(note)) as number;
      }
      syncHelper.updateNoteSyncInfo(note)
    }
    setIsEdited(false);
  }
  useEffect(() => {
    return () => {
      saveNote();
    };
  }, []);
  useEffect(() => {
    updateTitleHeigth(note?.title || "哈");
  }, [note]);
  useEffect(() => {
    window.addEventListener("beforeunload", saveNote);
    window.addEventListener("popstate", saveNote);
    return () => {
      window.removeEventListener("beforeunload", saveNote);
      window.removeEventListener("popstate", saveNote);
    };
  }, [title, content, note, isEdited]);

  if (note === null) {
    navigate("/memo");
    return null;
  } else if (note === void 0) {
    return null;
  }

  const getEditorHistory = () => {
    let editor = editorRef.current as any;
    return editor?.history;
  };
  return (
    <div className={css.root}>
      <div className={css.navbar}>
        <Button
          fill="none"
          onClick={(e) => {
            navigate(-1);
            saveNote();
          }}
        >
          <LeftOutline />
        </Button>
        <div className={css.cat}>
          <Tag color="#aaa">{cat?.title || "未分类"}</Tag>
        </div>

        <Button
          fill="none"
          disabled={!getEditorHistory()?.stack.undo.length}
          onClick={(e) => {
            getEditorHistory().undo();
          }}
        >
          <RedoOutline />
        </Button>

        <Button
          fill="none"
          disabled={!getEditorHistory()?.stack.redo.length}
          onClick={(e) => {
            getEditorHistory().redo();
          }}
        >
          <UndoOutline />
        </Button>
        <MoreSettings noteId={note.id!} onSave={saveNote} />
      </div>

      <div className={css.main}>
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => {
            let t = e.target.value.replace(/\n+/g, "");
            setTitle(t);
            setIsEdited(true);
            updateTitleHeigth(t);
          }}
          className={css.title}
          placeholder="标题"
          rows={1}
          style={{ height: titleHeight || void 0 }}
        />
        <div className={css.info}>
          {dayjs(note.updatedAt).format("MM-DD hh:mm")}{" "}
          {content.length ? `${toText(content).length}字` : ""}
        </div>
        {location.search.includes("custom") ? (
          <QuillEditor
            getEditor={(e) => {
              console.timeEnd("quill");
              editorRef.current = e;
            }}
            modules={modules}
            defaultValue={content}
            onChange={onTextChange}
            className={css.content}
            placeholder={`内容`}
          />
        ) : (
          <ReactQuill
            ref={(e) => {
              if (e) {
                editorRef.current = e?.getEditor();
                // setTimeout(() => {
                //   console.timeEnd("quill");
                // }, 100);
                e.getEditor().focus()
              }
            }}
            onFocus={()=> {
              console.timeEnd("quill")
              console.log(new Date().toLocaleTimeString())
            }}
            modules={modules}
            theme="snow"
            defaultValue={content}
            onChange={onTextChange}
            className={css.content}
            placeholder={`内容`}
          />
        )}
      </div>
    </div>
  );
}
