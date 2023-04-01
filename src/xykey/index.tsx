import React, { useEffect, useState } from "react";
export interface Props {}
function XyKey(props: Props) {
  const [authorized, setAuthorized]=useState(false)
  useEffect(() => {
    navigator.credentials.get({

    })
  }, [])
  return <div></div>;
}

export default XyKey;
