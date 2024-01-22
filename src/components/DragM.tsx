import React, { useEffect, useState } from "react";
import DragM from "dragm";

const BuildTitle = ({title}) => {
  const [dom, setDom] = useState();

  useEffect(() => {
    setDom(
      document.getElementsByClassName(
        "ant-modal-wrap" //modal的class是ant-modal-wrap
      )[0]
    );
  }, []);

  const updateTransform = (transformStr) => {
    if (dom) {
      dom.style.transform = transformStr;
    }
  };

  return (
    <DragM updateTransform={updateTransform}>
      <div>{title}</div>
    </DragM>
  );
};

export default BuildTitle;
