import React, { useEffect, useState } from "react";
import SaveToContact from "assests/portfolio/save_to_contact.svg";
import EditDnD from "./dragAndDrop";
import SelectContact from "./selectContact.tsx";
import { Icon } from "@iconify/react";
import { getBase64FromUrl } from "helper/convertToBase64";
import { generateBankQR } from "api";
import { Button, Input, Modal, Tooltip, message } from "antd";
import { GEN_QR } from "interface/card";
import IcAccount from "assests/icon/ic-account-blue.svg";
import Banner from "assests/landing/footer_banner.svg";
import "./style.scss";
import downloadjs from "downloadjs";
import html2canvas from "html2canvas";

enum QR_TEMPLATE {
  COMPACT2 = "compact2",
  COMPACT = "compact",
  QRONLY = "qr_only",
  FULL = "print",
}

function Contact({ data, userInfo, isEdit }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [bankList, setBankList] = useState([]);
  const [viewTransferInfo, setViewTransferInfo] = useState(false);

  // DnD State
  const [dndItems, setDndItems] = useState(() => {
    const ar: any = [];
    data.map((e) => {
      if (ar.map((f: any) => f.nameContact).includes(e.nameContact)) {
        const obj: any = ar.find((f: any) => f.nameContact === e.nameContact);
        obj.children.push({ ...e });
      } else {
        const temp = { ...e };
        temp.children = [e];
        ar.push(temp);
      }
    });
    return ar;
  });
  const [editingContact, setEditingContact] = useState({});

  const [QRbase64, setQRbase64] = useState({
    base64: "",
    bankNo: "",
    bankName: "",
    bankBin: "",
    transferAmount: null,
    transferDescription: "",
  });
  const [visibleQR, setVisibleQR] = useState(false);

  async function generateVCF() {
    const vcard = {
      str_vcard: "BEGIN:VCARD\nVERSION:3.0\n",
      str_photo: `\nPHOTO;TYPE=JPEG;ENCODING=b:[${getBase64FromUrl(
        userInfo.avatar
      )}]`,
      str_fullname: `\nFN:${userInfo.name}`,
      str_phone_work:
        "\nTEL;TYPE=home,voice;VALUE=uri:" +
        userInfo.contacts.find((e) => e.typeContact === "phone")?.infoDetail,
      str_end: "\nEND:VCARD",
      str_personal_website: `\nURL:https://onthedesk.vn/${userInfo.shortcut}`,
      str_url: userInfo.contacts
        .filter((e) => e.typeContact === "social")
        .map((e) => `\nURL:${e.infoDetail}`),
      str_banking: userInfo.contacts
        .filter((e) => e.typeContact === "bank")
        .map((e) => `\nURL:${e.nameContact}|${e.infoDetail}`),
      build_address: function () {
        var org_street = "phung khoang",
          org_city = "ha noi",
          org_region = "ha noi",
          org_post = "00000",
          org_country = "VN";
        vcard.str_vcard +=
          "\nADR;TYPE=work:;;" +
          org_street +
          ";" +
          org_city +
          ";" +
          org_region +
          ";" +
          org_post +
          ";" +
          org_country;
      },
      save: function () {
        vcard.str_vcard += vcard.str_fullname;
        vcard.str_vcard += vcard.str_phone_work;
        vcard.str_vcard += vcard.str_photo;
        // vcard.build_address();
        vcard.str_vcard += vcard.str_personal_website;
        vcard.str_vcard += vcard.str_url.join("\n");
        vcard.str_vcard += vcard.str_banking.join("\n");
        vcard.str_vcard += vcard.str_end;
      },
    };
    vcard.save();
    let download = (content, filename) => {
      let uriContent = URL.createObjectURL(
        new Blob([content], { type: "text/plain" })
      );
      let link = document.createElement("a");
      link.setAttribute("href", uriContent);
      link.setAttribute("download", filename);
      let event = new MouseEvent("click");
      link.dispatchEvent(event);
    };
    download(vcard.str_vcard, "card.vcf");
  }
  function onOpenContact(data) {
    if (data.infoDetail) {
      window.open(
        data.typeContact === "phone"
          ? `tel:${data.infoDetail}`
          : data.infoDetail,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      message.error("Đường dẫn không tồn tại");
    }
  }
  async function genQR(data) {
    if (data.infoDetail) {
      const params: GEN_QR = {
        accountNo: data.infoDetail.split("|")[1],
        accountName: data.infoDetail.split("|")[0],
        acqId: data.keyContact,
        template: QR_TEMPLATE.COMPACT,
      };
      const res = await generateBankQR(params);
      if (res) {
        setVisibleQR(true);
        setQRbase64({
          bankNo: data.infoDetail.split("|")[1],
          bankName: data.infoDetail.split("|")[0],
          base64: res.data.qrDataURL,
          bankBin: data.keyContact,
          transferAmount: null,
          transferDescription: "",
        });
      }
    } else {
      message.error("Đường dẫn không tồn tại");
    }
  }

  async function genTransferQR() {
    const params: GEN_QR = {
      accountNo: QRbase64.bankNo,
      accountName: QRbase64.bankName,
      acqId: QRbase64.bankBin,
      template: QR_TEMPLATE.COMPACT,
      amount: QRbase64.transferAmount,
      addInfo: QRbase64.transferDescription,
    };
    const res = await generateBankQR(params);
    if (res) {
      setQRbase64({ ...QRbase64, base64: res.data.qrDataURL });
    }
  }
  async function handleCaptureClick() {
    const downloadEl = document.querySelector<HTMLElement>(".DownloadQR");
    if (!downloadEl) return;
    const canvas = await html2canvas(downloadEl, { backgroundColor: null });
    const dataURL = canvas.toDataURL("image/png");
    downloadjs(dataURL, "OnTheDeskQR.png", "image/png");
  }

  useEffect(() => {}, [editingContact, QRbase64, dndItems, bankList]);
  function saveContact() {
    return (
      <div
        className="flex items-center justify-start w-full cursor-pointer h-9"
        onClick={() => {
          generateVCF();
        }}
      >
        <div className="bg-[#d6d6cc] flex items-center justify-center overflow-clip w-10 h-[inherit] rounded-tl-md rounded-bl-md">
          <img
            src={SaveToContact}
            alt="platform logo"
            className="w-full rounded-tl-md rounded-bl-md"
          />
        </div>
        <div className="flex bg-[#908D84] items-center justify-start w-[calc(100%-40px)] h-[inherit] px-4 rounded-tr-md rounded-br-md">
          <span className="text-white truncate">Lưu danh bạ</span>
        </div>
      </div>
    );
  }
  function QR() {
    return (
      <div>
        <Modal
          className="modalFullScreen"
          open={visibleQR}
          closeIcon={false}
          footer={null}
          afterClose={() => {
            setVisibleQR(false);
          }}
        >
          <div className="relative flex items-center justify-center h-full space-y-[18px] backdrop-blur">
            <div
              className="absolute cursor-pointer top-5 right-5"
              onClick={() => setVisibleQR(false)}
            >
              <Icon className="w-5 h-5 text-white" icon="tabler:x" />
            </div>
            <div className="flex flex-col mx-6 w-max space-y-[18px]">
              <img src={QRbase64.base64} alt="QR" className="rounded-md" />
              <div className="space-y-3">
                <div className="flex justify-start space-x-2">
                  <img className="w-6 h-6" src={IcAccount} alt="account" />
                  <span className="text-white">{QRbase64.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-2 ">
                    <Icon
                      className="w-6 h-6 text-primary-blue-medium"
                      icon="solar:card-linear"
                    />
                    <span id="BankNo" className="text-white">
                      {QRbase64.bankNo}
                    </span>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(QRbase64.bankNo);
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" icon="tabler:copy" />
                  </div>
                </div>
                {(userInfo.shortcut === "@admin" ||
                  userInfo.shortcut === "hiep-nguyen-cong") && (
                  <div>
                    {viewTransferInfo && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <div className="flex w-full pr-2 space-x-2">
                            <Icon
                              className="w-6 h-6 text-primary-blue-medium"
                              icon="ph:info-bold"
                            />
                            <Input
                              placeholder="Nội dung chuyển khoản"
                              id="transferDes"
                              bordered={false}
                              value={QRbase64.transferDescription}
                              className="p-0 text-white"
                              onChange={(e) =>
                                setQRbase64({
                                  ...QRbase64,
                                  transferDescription: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                QRbase64.transferDescription
                              );
                            }}
                          >
                            <Icon
                              className="w-6 h-6 text-white"
                              icon="tabler:copy"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex w-full pr-2 space-x-2 ">
                            <Icon
                              className="w-6 h-6 text-primary-blue-medium"
                              icon="tabler:report-money"
                            />
                            <Input
                              placeholder="Số tiền chuyển khoản"
                              id="transferAmount"
                              value={QRbase64.transferAmount}
                              bordered={false}
                              className="w-full p-0 text-white"
                              onChange={(e) => {
                                if (
                                  Number(e.target.value) ||
                                  e.target.value === ""
                                ) {
                                  setQRbase64({
                                    ...QRbase64,
                                    transferAmount:
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                  });
                                } else {
                                  messageApi.open({
                                    type: "warning",
                                    content: "Vui lòng nhập số",
                                  });
                                }
                              }}
                            />
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                QRbase64.transferAmount
                              );
                            }}
                          >
                            <Icon
                              className="w-6 h-6 text-white"
                              icon="tabler:copy"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-[18px]">
                          <div
                            className="before:bg-[#303A49] bg-[#ffffff2f] font-semibold text-white py-[6px] px-[9px] rounded-lg border-white border-[1px] border-solid cursor-pointer"
                            onClick={() => {
                              genTransferQR();
                            }}
                          >
                            Tạo QR tự động điền
                          </div>
                          <div
                            className="flex items-center space-x-1 font-semibold text-primary-blue-medium py-[6px] px-[9px] bg-[#1E2530] rounded-lg"
                            style={{
                              boxShadow:
                                "2px 2px 2px 0px rgba(0, 25, 64, 0.50) inset, -2px -2px 2px 0px rgba(60, 173, 255, 0.25) inset",
                            }}
                          >
                            <Icon
                              className="h-[18px] w-[18px]"
                              icon="tabler:check"
                            />
                            <span>Tạo giao dịch chuyển khoản</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {!viewTransferInfo && (
                      <div className="flex justify-center mt-4">
                        <Button
                          className="gradient_btn !shadow-none"
                          onClick={() => setViewTransferInfo(true)}
                        >
                          Tạo giao dịch chuyển khoản
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-3">
                <Button
                  className="!shadow-none bg-[#ffffff4d] !border !border-solid !border-white"
                  onClick={() => {
                    handleCaptureClick();
                  }}
                >
                  <Icon className="w-[18px] h-[18px]" icon="tabler:download" />
                </Button>
                <Button className="!shadow-none bg-[#ffffff4d] !border !border-solid !border-white">
                  <Icon className="w-[18px] h-[18px]" icon="uil:share" />
                </Button>
              </div>
            </div>
            <div className="absolute bottom-[99999px]">{DownloadQR()}</div>
          </div>
        </Modal>
      </div>
    );
  }
  function DownloadQR() {
    return (
      <div className="relative flex items-center justify-center p-2 bg-transparent DownloadQR">
        <div className="download-qr-border" />
        <div className="relative flex items-center justify-center space-y-[18px] backdrop-blur p-[18px] w-[252px] bg-[#181d25] rounded-xl download-qr">
          <div className="flex flex-col w-max space-y-[18px]">
            <img src={QRbase64.base64} alt="QR" className="rounded-md" />
            <div className="space-y-3">
              <div className="flex items-start justify-start space-x-2">
                <img className="w-5 h-5" src={IcAccount} alt="account" />
                <span className="text-white text-[12px]">
                  {QRbase64.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-start space-x-2 ">
                  <Icon
                    className="w-5 h-5 text-primary-blue-medium"
                    icon="solar:card-linear"
                  />
                  <span id="BankNo" className="text-white text-[12px]">
                    {QRbase64.bankNo}
                  </span>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(QRbase64.bankNo);
                  }}
                >
                  <Icon className="w-5 h-5 text-white" icon="tabler:copy" />
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex items-start w-full pr-2 space-x-2">
                  <Icon
                    className="w-5 h-5 min-w-[1.25rem] text-primary-blue-medium"
                    icon="ph:info-bold"
                  />
                  <span id="transferDes" className="p-0 text-[12px] text-white">
                    {QRbase64.transferDescription}
                  </span>
                </div>
                <div className="cursor-pointer">
                  <Icon className="w-5 h-5 text-white" icon="tabler:copy" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-start w-full pr-2 space-x-2 ">
                  <Icon
                    className="w-5 h-5 text-primary-blue-medium"
                    icon="tabler:report-money"
                  />
                  <span id="transferAmount" className="text-white text-[12px]">
                    {QRbase64.transferAmount}
                  </span>
                </div>
                <div className="cursor-pointer">
                  <Icon className="w-5 h-5 text-white" icon="tabler:copy" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-1 bg-transparent">
              <span className="text-[10px] font-semibold text-primary-blue-medium">
                Powered by
              </span>
              <img src={Banner} className="h-[10px]" alt="Banner" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="my-3">
      <div className="">
        {isEdit ? (
          <div className="space-y-2">
            <SelectContact dndItems={dndItems} setDndItems={setDndItems} />
            <EditDnD
              dndItems={dndItems}
              setDndItems={setDndItems}
              editingContact={editingContact}
              setEditingContact={setEditingContact}
            />

            {saveContact()}
          </div>
        ) : (
          <div className="grid <xs:grid-cols-1 grid-cols-2 gap-2 3xl:grid-cols-5 lg:grid-cols-3 ">
            {dndItems.map((e, index) => {
              return e.children.length > 1 ? (
                <Tooltip
                  placement="bottom"
                  arrow={false}
                  trigger="click"
                  fresh={true}
                  title={
                    <div
                      className={`space-y-5 contact-tooltip <xs:w-[90vw] xs:w-[50vw] lg:!w-[20vw]`}
                    >
                      {e.children.map((f, j) => (
                        <div
                          key={j}
                          className="flex items-center px-3 space-x-3 cursor-pointer"
                          onClick={() => {
                            if (e.typeContact === "bank") {
                              genQR(f);
                              setBankList(e.children);
                            } else {
                              onOpenContact(f);
                            }
                          }}
                        >
                          <Icon
                            className="text-lg text-primary-blue-medium"
                            icon="solar:arrow-right-linear"
                          />
                          <div>{f.nameContact}</div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div
                    key={index}
                    className="flex items-center justify-start w-full cursor-pointer h-9"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-[inherit] rounded-tl-md rounded-bl-md ${
                        e.keyContact === "phone" ? "bg-[#01B634]" : "bg-white"
                      }`}
                    >
                      <img
                        src={`${process.env.REACT_APP_BASE_IMG}${e.linkIcon}`}
                        alt="platform logo"
                      />
                    </div>
                    <div
                      className="flex  items-center justify-between w-[calc(100%-40px)] h-[inherit] px-[1rem] rounded-tr-md rounded-br-md"
                      style={{
                        backgroundColor: `${e.backgoundColor}`,
                      }}
                    >
                      <span className="text-white truncate">
                        {e.nameContact}
                      </span>
                      <Icon
                        className="text-lg text-white"
                        icon="solar:alt-arrow-down-linear"
                      />
                    </div>
                  </div>
                </Tooltip>
              ) : (
                <div
                  key={index}
                  className="flex items-center justify-start w-full cursor-pointer h-9"
                  onClick={() => {
                    if (e.typeContact === "bank") {
                      genQR(e.children[0]);
                    } else {
                      onOpenContact(e.children[0]);
                    }
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-[inherit] rounded-tl-md rounded-bl-md ${
                      e.keyContact === "phone" ? "bg-[#01B634]" : "bg-white"
                    }`}
                  >
                    <img
                      src={`${process.env.REACT_APP_BASE_IMG}${e.linkIcon}`}
                      alt="platform logo"
                    />
                  </div>
                  <div
                    className="flex items-center justify-start w-[calc(100%-40px)] h-[inherit] px-4 rounded-tr-md rounded-br-md"
                    style={{
                      backgroundColor: `${e.backgoundColor}`,
                    }}
                  >
                    <span className="text-white truncate">{e.nameContact}</span>
                  </div>
                </div>
              );
            })}
            {saveContact()}
          </div>
        )}
      </div>
      {QR()}
      {contextHolder}
    </div>
  );
}

export default Contact;
