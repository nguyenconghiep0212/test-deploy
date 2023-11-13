import { Button, Modal  } from "antd";
import React from "react";
import Confirm from "assests/dialogConfirm/Confirm.svg";
import Error from "assests/dialogConfirm/Error.svg";
import './style.scss'

function Component({
  title,
  visible,
  type,
  message,
  cancelText,
  okText,
  handleOk,
  handleCancel,
}) {
  return (
    <Modal title={title || ""} open={visible} closeIcon={false} footer={null} className="confirm_dialog">
      <div className="flex flex-col items-center justify-center space-y-6">
        <img className="w-20 h-20" src={type === "success" ? Confirm : Error} alt="" />
        <div className="text-white">
            {message}
        </div>
        <div className="flex justify-center space-x-2">
          <Button
            className="bg-[#1E2530] !shadow-none rounded-lg !text-primary-blue-medium font-semibold"
            onClick={handleCancel ? () => handleCancel() : () => {}}
          >
            {cancelText || "Cancel"}
          </Button>
          <Button
            className="rounded-lg gradient_btn !shadow-none font-semibold"
            onClick={handleOk ? () => handleOk() : () => {}}
          >
            {okText || "Ok"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default Component;
