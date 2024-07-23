"use client";

import {
  Button,
  Textarea,
  Divider,
  Select,
  SelectItem,
  Input,
  Snippet,
} from "@nextui-org/react";
import React, { useState } from "react";

export default function ZipPage() {
  const [zipFileName, setZipFileName] = useState("");
  const [value, setValue] = useState("");
  const [system, setSystem] = useState("windows");
  const [result, setResult] = useState("");

  const systems = [
    { key: "windows", label: "Windows" },
    { key: "linux", label: "Linux" },
  ];

  function handleGenerate() {
    let fileName = zipFileName;

    if (!fileName.includes(".zip")) {
      fileName = `${zipFileName}.zip`;
    }
    const fileList = value;
    const arrFileList = fileList.replace(/\r/g, "").split("\n", -1);
    let commandInfo = `zip -r`;
    if (system === "windows") {
      commandInfo = `tar -a -c -f`;
    }
    commandInfo = `${commandInfo} ${fileName}`;
    arrFileList.forEach((item) => {
      commandInfo += ` ${item}`;
    });
    setResult(commandInfo);
  }

  return (
    <section className="min-h-screen p-24">
      <h1 className="text-2xl">根据文件名和需要压缩的文件列表生成压缩指令</h1>
      <Divider className="my-4" />

      <div className="flex flex-col items-center">
        <Select
          isRequired
          label="操作系统"
          labelPlacement="outside"
          placeholder="选择一个系统"
          defaultSelectedKeys={["windows"]}
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          className="max-w-md py-4"
        >
          {systems.map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>

        <Input
          isRequired
          label="压缩包文件名"
          labelPlacement="outside"
          placeholder="请出入压缩包的文件名"
          className="max-w-md py-4"
          value={zipFileName}
          onValueChange={setZipFileName}
        />

        <Textarea
          isRequired
          label="文件列表"
          labelPlacement="outside"
          placeholder="输入每个待压缩文件的路径，一行一个文件"
          className="max-w-md py-4"
          value={value}
          onValueChange={setValue}
        />

        <div>
          <Button size="sm" color="primary" onClick={handleGenerate}>
            生成压缩指令
          </Button>
        </div>

        {result && (
          <div className="py-4">
            <Snippet hideSymbol className="max-w-md">
              <span className="whitespace-normal">{result}</span>
            </Snippet>
          </div>
        )}
      </div>
    </section>
  );
}
