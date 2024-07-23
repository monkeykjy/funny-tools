"use client";

import { useState } from "react";
import {
  Divider,
  Button,
  Image,
  Card,
  CardBody,
  CardHeader,
} from "@nextui-org/react";

interface ResultFile {
  name: string;
  url: string;
}

const PngPage = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<ResultFile[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files) return;

    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/png", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data && data.downloadUrls) {
        console.log("上传成功", data.downloadUrls);
        setDownloadUrls(data.downloadUrls);
        if (data.zipUrl) {
          setZipUrl(data.zipUrl);
        }
      }
    } catch (error) {
      console.error("Error uploading files", error);
    } finally {
      // 清空文件列表
      console.log("清空文件列表");
      setFiles(null);
      setUploading(false);
    }
  };

  const handleDownload = async (url: string) => {
    if (!url) return;
    const response = await fetch(url);
    const blob = await response.blob();
    const urlObject = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObject;
    a.download = url.split("/").pop() || "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="min-h-screen p-24">
      <h1 className="text-2xl">
        上传PNG文件，将PNG文件周边的透明部分去掉，剩下最简单的图片提供下载
      </h1>
      <Divider className="my-4" />

      <div className="flex flex-col items-center">
        {/* 使用Input组件，可以上传多个文件 */}
        <div className="py-4">
          <input
            type="file"
            multiple
            accept="image/png"
            max={10}
            onChange={handleFileChange}
            aria-label="file upload"
          />
        </div>
        <div className="py-4">
          <Button
            onClick={handleUpload}
            color="primary"
            isDisabled={files == null || files.length === 0}
            isLoading={uploading}
          >
            上传
          </Button>
        </div>
        {/* <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button> */}
        {downloadUrls.length > 0 && (
          <div>
            <h2>处理结果</h2>
            {/* 下载的链接列表，一行为一个处理完的文件，左边显示图片的预览图和名字，右边显示下载按钮，不显示下载超链接 */}
            <Card
              isBlurred
              className="border-none bg-background/60 dark:bg-default-100/50 min-w-[512px] max-w-[1240px] m-4"
              shadow="sm"
            >
              {zipUrl && (
                <CardHeader className="bg-black">
                  <Button
                    onClick={() => handleDownload(zipUrl)}
                    color="success"
                    size="sm"
                  >
                    下载全部
                  </Button>
                </CardHeader>
              )}
              <ul className="divide-y">
                {downloadUrls.map((item, index) => (
                  <li key={index}>
                    <CardBody>
                      <div className="grid grid-cols-12 items-center justify-center">
                        <div className="col-span-2">
                          <Image
                            alt="Album cover"
                            className="object-center object-cover w-12 h-12"
                            height={48}
                            width={48}
                            shadow="md"
                            src={item.url}
                            isZoomed
                          />
                        </div>

                        <div className="col-span-6">
                          <p className="text-sm">{item.name}</p>
                        </div>

                        <div className="col-span-4">
                          <div className="flex justify-end items-center">
                            <Button
                              onClick={() => handleDownload(item.url)}
                              size="sm"
                              color="primary"
                            >
                              下载
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default PngPage;
