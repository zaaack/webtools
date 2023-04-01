import {
  CapsuleTabs,
  Card,
  FloatingBubble,
  SafeArea,
  SearchBar,
} from "antd-mobile";
import { AddOutline } from "antd-mobile-icons";
import { CapsuleTab } from "antd-mobile/es/components/capsule-tabs/capsule-tabs";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Category, db } from "./db";
import css from "./index.module.scss";
import { SyncManager } from "./sync/sync-helper";
import { toText } from "./utils";

const sync =new SyncManager()
sync.sync()
export interface Props {}
function Memo(props: Props) {
  const [curCatId, setCatId] = useState(-1);
  const categories = useLiveQuery(() => {
    return db.categories.toArray();
  });
  const notes = useLiveQuery(() => {
    if (curCatId === -1) {
      return db.notes
        .orderBy("updatedAt")
        .reverse()
        .filter(a =>!a.trashedAt)
        .toArray();
    }
    return db.notes
      .where("categoryId")
      .equals(curCatId)
      .reverse()
        .filter(a =>!a.trashedAt)
        .sortBy("updatedAt");
  }, [curCatId]);
  return (
    <div className={css.root}>
      <SearchBar placeholder="请输入内容" />
      {categories && (
        <CapsuleTabs
          defaultActiveKey={curCatId + ""}
          onChange={(e) => {
            setCatId(Number(e));
          }}
        >
          {[{ id: -1, title: "全部" } as Category]
            .concat(categories)
            .map((c) => {
              return <CapsuleTabs.Tab key={c.id + ""} title={c.title} />;
            })}
        </CapsuleTabs>
      )}
      <div className={css.notes}>
        {notes?.map((n) => {
          const img = n.content.match(/<img\s+src="(.*?)"(?:[^>]*?)>/);
          return (
            <Link to={`/memo/note/${n.id}`} className={css.note}>
              <Card>
                {img && <img src={img[1]} className={css.img} />}
                {n.title && <h2>{n.title}</h2>}
                {toText(n.content).slice(0, 80)}
              </Card>
            </Link>
          );
        })}
      </div>
      <Link to={`/memo/note/new`}>
        <FloatingBubble
          style={{
            "--initial-position-bottom": "24px",
            "--initial-position-right": "24px",
            // '--edge-distance': '24px',
          }}
        >
          <AddOutline fontSize={32} />
        </FloatingBubble>
      </Link>
    </div>
  );
}

export default Memo;
