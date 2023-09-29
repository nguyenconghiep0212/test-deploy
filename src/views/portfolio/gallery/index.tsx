import { Icon } from "@iconify/react";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { data, galleries, customer } from "views/mock.ts";
import Feedback from "../components/feedback/index";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface Info {
  thumbnail: string;
  customer: {
    avatar_url: string;
    name: string;
    info: string;
  };
  user: {
    avatar_url: string;
    name: string;
  };
  feedback: any;
}

function Component() {
  const [gallery, setGallery] = useState<any>([]);
  const [info, setInfo] = useState<Info>({
    thumbnail: "",
    customer: {
      avatar_url: "",
      name: "",
      info: "",
    },
    user: {
      avatar_url: "",
      name: "",
    },
    feedback: {
      alias: "",
      data: [],
    },
  });
  const params = useParams();
  const navigate = useNavigate();
  function getInfo() {
    const temp = data.components
      .find((e) => e.key === "gallery")
      ?.data.find((e) => e.customer_id === params.customerId);
    const customerInfo = customer.find((e) => e.id === params.customerId);
    const obj = {
      thumbnail: temp.thumbnail,
      customer: {
        avatar_url: customerInfo.avatar_url,
        name: customerInfo.name,
        info: customerInfo.info,
      },
      user: {
        avatar_url: data.personal_info.avatar_url,
        name: data.personal_info.name,
      },
      feedback: {
        alias: data.components.find((e) => e.key === "feedback").alias,
        data: data.components
          .find((e) => e.key === "feedback")
          ?.data.filter((e) => e.customer_id === customerInfo?.id),
      },
    };
    setInfo(obj);
    console.log(obj);
  }

  function masonryGrid() {
    return (
      <div>
        {gallery.map((e) => (
          <div className="my-2">
            <div className="text-[#B6B6B6] font-bold text-lg mb-4">
              {e.name}
            </div>
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 290: 1, 360: 2, 1536: 3 }}
            >
              <Masonry gutter="0.5rem">
                {e.images.map((f, i) => (
                  <div key={i} className={` rounded-2xl`}>
                    <img src={f} alt="gallery_src" className="rounded-2xl" />
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
            <div id="divider" className="flex items-center justify-center py-6">
              <div className="w-2/3 border-t border-dashed border-primary-blue-light"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function getCustomerGallery() {
    const arr = galleries.find((e) => e.customer_id === params.customerId).galleries;
    setGallery(arr);
  }

  function handleBack() {
    return navigate(-1);
  }
  useEffect(() => {
    getCustomerGallery();
    getInfo();
  }, []);
  return (
    <div className="w-full h-full sm:flex sm:flex-col sm:items-center">
      <div className="h-full pb-3 sm:w-1/2">
        {/* INFO */}
        <div className="relative w-full h-1/3 sm:h-2/5 lg:h-3/5">
          <div
            className="sm:w-[300%] sm:-translate-x-1/2 h-full  "
            style={{
              backgroundImage: `url(${info.thumbnail})`,
              WebkitFilter: `blur(24px)`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              boxShadow: "inset 0px -70px 10px #18191A",
            }}
          ></div>
          <div className="absolute top-0 left-0 sm:-left-12 ">
            <Button variant="text" className="!px-0" onClick={handleBack}>
              <Icon
                className="text-2xl  ml-[-16px] text-white"
                icon="ep:back"
              />
            </Button>
          </div>
          <div
            className="absolute top-0 w-3/4 h-full -translate-x-1/2 sm:w-full 3xl:w-3/5 left-1/2"
            style={{
              backgroundImage: `url(${info.thumbnail})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              boxShadow: "inset 0px -70px 40px #18191A",
            }}
          ></div>
        </div>
        <div className="relative bg-[#18191A] z-10  sm:w-[300%] sm:overflow-x-clip -translate-x-1/2">
          <div
            id="customer"
            className="flex items-center space-x-2 translate-x-1/2"
          >
            <div className=" w-20 h-20 ml-3 mt-[-25px]">
              <img
                src={info.customer.avatar_url}
                alt="customer_avatar"
                className="z-20 h-full rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-primary-blue-light-max">
                {info.customer.name || "Anonymous"}
              </span>
              <span className="text-sm font-thin text-primary-blue-light-max">
                {info.customer.info || "N/A"}
              </span>
            </div>
          </div>
          <div id="user" className="translate-x-1/2">
            <div className="w-10 h-6 ml-3 text-white border-r border-primary-blue-light" />
            <div className="flex space-x-2">
              <div className="w-20 h-20 ml-3 -mt-3 scale-75 border-2 rounded-full border-primary-blue-light">
                <img
                  className="h-full"
                  src={info.user.avatar_url}
                  alt="user_avatar"
                />
              </div>
              <span className="mt-4 text-lg font-semibold text-white">
                {info.user.name}
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 mt-3 space-y-6">
          {/* GALLERY */}
          <div className="overflow-auto ">{masonryGrid()}</div>
          {/* FEEDBACK */}
          <div className="p-3 rounded-2xl w-full bg-[#1E2530]">
            <Feedback alias={info.feedback.alias} data={info.feedback.data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
