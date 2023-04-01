import { Button, List, Modal } from "antd-mobile";
import { MoreOutline } from "antd-mobile-icons";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../../db";
import css from "./index.module.scss";
export interface Props {
  noteId?: number;
  onSave: () => void
}

export function MoreSettings(props: Props) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  return (
    <Button
      fill="none"
      onClick={(e) => {
        setVisible(!visible);
      }}
      className={css.root}
    >
      <MoreOutline />
      {visible && (
        <List className={css.menu}>
          <List.Item
            onClick={props.onSave}
          >
            保存
          </List.Item>
          <List.Item
            onClick={(e) => {
              if (props.noteId)
                db.notes.update(props.noteId, { deletedAt: new Date() });
              navigate(-1);
            }}
          >
            删除
          </List.Item>
        </List>
      )}
    </Button>
  );
}
